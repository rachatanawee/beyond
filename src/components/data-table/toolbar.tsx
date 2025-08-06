"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Settings, Undo2, TrashIcon, EyeOff, CheckSquare, MoveHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTableViewOptions } from "./view-options";
import { DataTableExport } from "./data-export";
import type { DataTransformFunction, ExportableData } from "./utils/export-utils";
import { resetUrlState } from "./utils/deep-utils";
import { parseDateFromUrl } from "./utils/url-state";
import type { TableConfig } from "./utils/table-config";
import { formatDate } from "./utils/date-format";

// Helper functions for component sizing
const getInputSizeClass = (size: 'sm' | 'default' | 'lg') => {
  switch (size) {
    case 'sm': return 'h-8';
    case 'lg': return 'h-11';
    default: return '';
  }
};

const getButtonSizeClass = (size: 'sm' | 'default' | 'lg', isIcon = false) => {
  if (isIcon) {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-11 w-11';
      default: return '';
    }
  }
  switch (size) {
    case 'sm': return 'h-8 px-3';
    case 'lg': return 'h-11 px-5';
    default: return '';
  }
};

interface DataTableToolbarProps<TData extends ExportableData> {
  table: Table<TData>;
  setSearch: (value: string | ((prev: string) => string)) => void;
  setDateRange: (
    value:
      | { from_date: string; to_date: string }
      | ((prev: { from_date: string; to_date: string }) => {
        from_date: string;
        to_date: string;
      })
  ) => void;
  totalSelectedItems?: number;
  deleteSelection?: () => void;
  getSelectedItems?: () => Promise<TData[]>;
  getAllItems?: () => TData[];
  config: TableConfig;
  resetColumnSizing?: () => void;
  resetColumnOrder?: () => void;
  entityName?: string;
  columnMapping?: Record<string, string>;
  columnWidths?: Array<{ wch: number }>;
  headers?: string[];
  transformFunction?: DataTransformFunction<TData>;
  customToolbarComponent?: React.ReactNode;
}

export function DataTableToolbar<TData extends ExportableData>({
  table,
  setSearch,
  setDateRange,
  totalSelectedItems = 0,
  deleteSelection,
  getSelectedItems,
  getAllItems,
  config,
  resetColumnSizing,
  resetColumnOrder,
  entityName = "items",
  columnMapping,
  columnWidths,
  headers,
  transformFunction,
  customToolbarComponent,
}: DataTableToolbarProps<TData>) {
  // Get router and pathname for URL state reset
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tableFiltered = table.getState().columnFilters.length > 0;

  // Get search value directly from URL query parameter
  const searchParamFromUrl = searchParams.get("search") || "";
  // Decode URL-encoded search parameter
  const decodedSearchParam = searchParamFromUrl
    ? decodeURIComponent(searchParamFromUrl)
    : "";

  // Get search value from table state as fallback
  const currentSearchFromTable =
    (table.getState().globalFilter as string) || "";

  // Initialize local search state with URL value or table state
  const [localSearch, setLocalSearch] = useState(
    decodedSearchParam || currentSearchFromTable
  );

  // Track if the search is being updated locally
  const isLocallyUpdatingSearch = useRef(false);

  // Update local search when URL param changes
  useEffect(() => {
    // Skip if local update is in progress
    if (isLocallyUpdatingSearch.current) {
      return;
    }

    const searchFromUrl = searchParams.get("search") || "";
    const decodedSearchFromUrl = searchFromUrl
      ? decodeURIComponent(searchFromUrl)
      : "";

    if (decodedSearchFromUrl !== localSearch) {
      setLocalSearch(decodedSearchFromUrl);
    }
  }, [searchParams, localSearch]);

  const tableSearch = (table.getState().globalFilter as string) || "";
  // Also update local search when table globalFilter changes
  useEffect(() => {
    // Skip if local update is in progress
    if (isLocallyUpdatingSearch.current) {
      return;
    }

    if (tableSearch !== localSearch && tableSearch !== "") {
      setLocalSearch(tableSearch);
    }
  }, [tableSearch, localSearch]);

  // Reference to track if we're currently updating dates
  const isUpdatingDates = useRef(false);
  
  // Reference to track the last set date values to prevent updates with equal values
  const lastSetDates = useRef<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Memoize the getInitialDates function to prevent unnecessary recreations
  const getInitialDates = useCallback((): {
    from: Date | undefined;
    to: Date | undefined;
  } => {
    // If we're in the middle of an update, don't parse from URL to avoid cycles
    if (isUpdatingDates.current) {
      return lastSetDates.current;
    }

    const dateRangeParam = searchParams.get("dateRange");
    if (dateRangeParam) {
      try {
        const parsed = JSON.parse(dateRangeParam);
        
        // Parse dates from URL param
        const fromDate = parsed?.from_date ? parseDateFromUrl(parsed.from_date) : undefined;
        const toDate = parsed?.to_date ? parseDateFromUrl(parsed.to_date) : undefined;
        
        // Cache these values
        lastSetDates.current = { from: fromDate, to: toDate };
        
        return {
          from: fromDate,
          to: toDate,
        };
      } catch (e) {
        console.warn("Error parsing dateRange from URL:", e);
        return { from: undefined, to: undefined };
      }
    }
    return { from: undefined, to: undefined };
  }, [searchParams]);

  // Initial state with date values from URL
  const [dates, setDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(getInitialDates());

  // Track if user has explicitly changed dates
  const [datesModified, setDatesModified] = useState(
    !!dates.from || !!dates.to
  );

  // Load initial date range from URL params only once on component mount
  useEffect(() => {
    const initialDates = getInitialDates();
    if (initialDates.from || initialDates.to) {
      setDates(initialDates);
      setDatesModified(true);
    }
  }, [getInitialDates]); // Include memoized function as dependency

  // Determine if any filters are active
  const isFiltered = tableFiltered || !!localSearch || datesModified;

  // Create a ref to store the debounce timer
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers when component unmounts
  useEffect(() => {
    return () => {
      // Clear debounce timer
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  // Handle search with improved debounce to prevent character loss
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Mark that search is being updated locally
    isLocallyUpdatingSearch.current = true;
    setLocalSearch(value);

    // Clear any existing timer to prevent race conditions
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    // Set a new debounce timer to update the actual search state
    searchDebounceTimerRef.current = setTimeout(() => {
      // Trim whitespace before sending to backend API
      const trimmedValue = value.trim();
      setSearch(trimmedValue);
      searchDebounceTimerRef.current = null;

      // Reset the local update flag after a short delay
      // This ensures URL changes don't override the input immediately
      setTimeout(() => {
        isLocallyUpdatingSearch.current = false;
      }, 100);
    }, 500);
  };

  // Listen for URL parameter changes and update local state if needed
  useEffect(() => {
    // Skip this effect if we're currently updating the dates ourselves
    if (isUpdatingDates.current) {
      return;
    }
    
    const newDates = getInitialDates();
    
    // Check if dates have actually changed to avoid unnecessary updates
    const hasFromChanged = 
      (newDates.from && !dates.from) || 
      (!newDates.from && dates.from) || 
      (newDates.from && dates.from && newDates.from.getTime() !== dates.from.getTime());
      
    const hasToChanged = 
      (newDates.to && !dates.to) || 
      (!newDates.to && dates.to) || 
      (newDates.to && dates.to && newDates.to.getTime() !== dates.to.getTime());
    
    if (hasFromChanged || hasToChanged) {
      setDates(newDates);
      setDatesModified(!!(newDates.from || newDates.to));
    }
  }, [dates, getInitialDates]);

  // Handle date selection for filtering
  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    // Compare with previous dates to avoid unnecessary updates
    const hasFromChanged = 
      (from && !dates.from) || 
      (!from && dates.from) || 
      (from && dates.from && from.getTime() !== dates.from.getTime());
      
    const hasToChanged = 
      (to && !dates.to) || 
      (!to && dates.to) || 
      (to && dates.to && to.getTime() !== dates.to.getTime());
    
    // Only update if dates have actually changed
    if (!hasFromChanged && !hasToChanged) {
      return;
    }
    
    // Set flag to prevent update loops
    isUpdatingDates.current = true;
    
    // Update internal state
    setDates({ from, to });
    setDatesModified(true);
    lastSetDates.current = { from, to };

    // Convert dates to strings in YYYY-MM-DD format for the API
    setDateRange({
      from_date: from ? formatDate(from) : "",
      to_date: to ? formatDate(to) : "",
    });
    
    // Reset the updating flag after a delay
    setTimeout(() => {
      isUpdatingDates.current = false;
    }, 100);
  };

  // Reset all filters and URL state
  const handleResetFilters = () => {
    // Reset table filters
    table.resetColumnFilters();

    // Reset search
    setLocalSearch("");
    setSearch("");

    // Reset dates to undefined (no filter)
    setDates({
      from: undefined,
      to: undefined,
    });
    setDatesModified(false);
    setDateRange({
      from_date: "",
      to_date: "",
    });

    // Reset URL state by removing all query parameters, but only if URL state is enabled
    if (config.enableUrlState) {
      resetUrlState(router, pathname);
    }
  };

  // Get selected items data for export - this is now just for the UI indication
  // The actual data fetching happens in the export component
  const selectedItems =
    totalSelectedItems > 0
      ? new Array(totalSelectedItems).fill({} as TData)
      : [];

  // Get all available items data for export
  const allItems = getAllItems ? getAllItems() : [];

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {config.enableSearch && (
          <Input
            placeholder={config.searchPlaceholder || `Search ${entityName}...`}
            value={localSearch}
            onChange={handleSearchChange}
            className={`w-[150px] lg:w-[250px] ${getInputSizeClass(config.size)}`}
          />
        )}

        {config.enableDateFilter && (
          <div className="flex items-center">
            <CalendarDatePicker
              date={{
                from: dates.from,
                to: dates.to,
              }}
              onDateSelect={handleDateSelect}
              className={`w-fit cursor-pointer ${getInputSizeClass(config.size)}`}
              variant="outline"
            />
          </div>
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className={getButtonSizeClass(config.size)}
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {customToolbarComponent}

        {config.enableExport && (
          <DataTableExport
            table={table}
            data={allItems}
            selectedData={selectedItems}
            getSelectedItems={getSelectedItems}
            entityName={entityName}
            columnMapping={columnMapping}
            columnWidths={columnWidths}
            headers={headers}
            transformFunction={transformFunction}
            size={config.size}
            config={config}
          />
        )}

        {config.enableColumnVisibility && (
          <DataTableViewOptions
            table={table}
            columnMapping={columnMapping}
            size={config.size}
          />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={getButtonSizeClass(config.size, true)}
              title="Table Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Open table settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Table Settings</h4>
              </div>

              <div className="grid gap-2">
                {config.enableColumnResizing && resetColumnSizing && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      resetColumnSizing();
                    }}
                  >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Reset Column Sizes
                  </Button>
                )}

                {resetColumnOrder && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      resetColumnOrder();
                    }}
                  >
                    <MoveHorizontal className="mr-2 h-4 w-4" />
                    Reset Column Order
                  </Button>
                )}

                {config.enableRowSelection && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      table.resetRowSelection();
                      // Also call the parent component's deleteSelection function if available
                      if (deleteSelection) {
                        deleteSelection();
                      }
                    }}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Clear Selection
                  </Button>
                )}

                {!table.getIsAllColumnsVisible() && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={() => table.resetColumnVisibility()}
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Show All Columns
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

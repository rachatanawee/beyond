'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { DataTable } from '@/components/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Sample user data type
interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  phone?: string;
  location?: string;
  joinedAt: string;
  lastLogin?: string;
}

// Sample data
const sampleUsers: DemoUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinedAt: '2024-01-15',
    lastLogin: '2024-12-20',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    status: 'active',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    joinedAt: '2024-02-20',
    lastLogin: '2024-12-19',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'moderator',
    status: 'inactive',
    location: 'Chicago, IL',
    joinedAt: '2024-03-10',
    lastLogin: '2024-12-15',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'user',
    status: 'pending',
    phone: '+1 (555) 456-7890',
    location: 'Houston, TX',
    joinedAt: '2024-12-18',
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'user',
    status: 'active',
    phone: '+1 (555) 321-0987',
    location: 'Phoenix, AZ',
    joinedAt: '2024-04-05',
    lastLogin: '2024-12-21',
  },
];

// Mock fetch function
const fetchDemoUsers = async (params: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { page, limit, search, sort_by, sort_order } = params;
  
  let filteredData = [...sampleUsers];
  
  // Apply search filter
  if (search) {
    filteredData = filteredData.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Apply sorting
  if (sort_by) {
    filteredData.sort((a, b) => {
      const aValue = a[sort_by as keyof DemoUser] || '';
      const bValue = b[sort_by as keyof DemoUser] || '';
      
      if (sort_order === 'desc') {
        return bValue.toString().localeCompare(aValue.toString());
      }
      return aValue.toString().localeCompare(bValue.toString());
    });
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: paginatedData,
    pagination: {
      page,
      limit,
      total_pages: Math.ceil(filteredData.length / limit),
      total_items: filteredData.length,
    },
  };
};

export default function AdvancedTableDemoPage() {
  usePageTitle('Advanced Table Demo');

  // Define columns
  const getColumns = (handleRowDeselection?: ((rowId: string) => void) | null): ColumnDef<DemoUser>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
          <Badge variant={role === 'admin' ? 'destructive' : role === 'moderator' ? 'default' : 'secondary'}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'active' ? 'default' : status === 'inactive' ? 'secondary' : 'outline'}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.getValue('location') as string;
        return location ? (
          <div className="flex items-center text-sm">
            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
            {location}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string;
        return phone ? (
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
            {phone}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'joinedAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('joinedAt') as string;
        return (
          <div className="flex items-center text-sm">
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                Copy email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit user
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Advanced Table Demo
          </h2>
          <p className="text-muted-foreground">
            Production-ready data table with server-side features
          </p>
        </div>
      </div>

      {/* Advanced Data Table */}
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchDemoUsers}
        exportConfig={{
          entityName: 'demo-users',
          columnMapping: {
            name: 'Name',
            email: 'Email',
            role: 'Role',
            status: 'Status',
            location: 'Location',
            phone: 'Phone',
            joinedAt: 'Joined Date',
          },
          columnWidths: [
            { wch: 20 }, // Name
            { wch: 25 }, // Email
            { wch: 12 }, // Role
            { wch: 12 }, // Status
            { wch: 20 }, // Location
            { wch: 15 }, // Phone
            { wch: 15 }, // Joined Date
          ],
          headers: ['Name', 'Email', 'Role', 'Status', 'Location', 'Phone', 'Joined Date'],
        }}
        idField="id"
        renderToolbarContent={({ selectedRows, totalSelectedCount, resetSelection }) => (
          <div className="flex items-center gap-2">
            {totalSelectedCount > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {totalSelectedCount} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Bulk action on:', selectedRows);
                    resetSelection();
                  }}
                >
                  Bulk Action
                </Button>
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}
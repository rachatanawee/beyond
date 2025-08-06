'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { DataTable } from '@/components/data-table';

// Sample data for the demo
const sampleData = [
  {
    id: 1,
    header: "Executive Summary",
    type: "Executive Summary",
    status: "Done",
    target: "2",
    limit: "3",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Technical Approach",
    type: "Technical Approach",
    status: "In Progress",
    target: "5",
    limit: "8",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 3,
    header: "Project Management",
    type: "Narrative",
    status: "Not Started",
    target: "3",
    limit: "4",
    reviewer: "Assign reviewer",
  },
  {
    id: 4,
    header: "Quality Assurance",
    type: "Capabilities",
    status: "In Progress",
    target: "2",
    limit: "3",
    reviewer: "Eddie Lake",
  },
  {
    id: 5,
    header: "Risk Management",
    type: "Design",
    status: "Done",
    target: "1",
    limit: "2",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 6,
    header: "Budget Analysis",
    type: "Focus Documents",
    status: "Not Started",
    target: "4",
    limit: "5",
    reviewer: "Assign reviewer",
  },
  {
    id: 7,
    header: "Timeline Overview",
    type: "Table of Contents",
    status: "In Progress",
    target: "1",
    limit: "1",
    reviewer: "Eddie Lake",
  },
  {
    id: 8,
    header: "Resource Allocation",
    type: "Narrative",
    status: "Done",
    target: "3",
    limit: "4",
    reviewer: "Jamik Tashpulatov",
  },
];

export default function DataTableDemoPage() {
  usePageTitle('Data Table Demo');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Data Table Demo
          </h2>
          <p className="text-muted-foreground">
            Interactive data table with drag & drop, sorting, and filtering
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="@container/main">
        <DataTable data={sampleData} />
      </div>
    </div>
  );
}
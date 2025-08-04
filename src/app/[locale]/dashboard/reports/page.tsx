'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const reports = [
  {
    id: 1,
    name: 'Monthly Activity Report',
    description: 'Complete overview of your monthly activity',
    type: 'Activity',
    status: 'ready',
    lastGenerated: '2024-01-15',
    size: '2.4 MB',
  },
  {
    id: 2,
    name: 'User Analytics Report',
    description: 'Detailed analytics and user behavior insights',
    type: 'Analytics',
    status: 'generating',
    lastGenerated: '2024-01-14',
    size: '1.8 MB',
  },
  {
    id: 3,
    name: 'Security Audit Report',
    description: 'Security events and access logs',
    type: 'Security',
    status: 'ready',
    lastGenerated: '2024-01-13',
    size: '856 KB',
  },
  {
    id: 4,
    name: 'Performance Report',
    description: 'System performance metrics and trends',
    type: 'Performance',
    status: 'ready',
    lastGenerated: '2024-01-12',
    size: '3.2 MB',
  },
];

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Generate and download your activity reports
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Download</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Available now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Currently generating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47.2 MB</div>
            <p className="text-xs text-muted-foreground">
              All reports combined
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Your generated reports and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{report.name}</p>
                      <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                        {report.status === 'ready' ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Ready
                          </>
                        ) : (
                          <>
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Generating
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {report.lastGenerated}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {report.size}
                      </span>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {report.status === 'ready' ? (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="mr-2 h-4 w-4" />
                      Generating...
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>
            Quick access to commonly used report templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Weekly Summary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Overview of your weekly activity and performance
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Generate Report
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Custom Date Range</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate reports for specific date ranges
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Configure & Generate
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Export Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export your data in various formats (CSV, JSON, PDF)
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
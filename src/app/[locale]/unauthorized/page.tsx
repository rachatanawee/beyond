import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20">
            <Shield className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/profile">
              View Profile
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Error Code: 403 - Forbidden</p>
        </div>
      </div>
    </div>
  );
}
import { UserX, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <UserX className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Account Suspended
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your account has been temporarily suspended. Please contact support for more information about reactivating your account.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="mailto:support@example.com">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>If you believe this is an error, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
}
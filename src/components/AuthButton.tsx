'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function AuthButton() {
  const { user, signOut, loading } = useAuth();
  const t = useTranslations('Navigation');

  if (loading) {
    return (
      <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {t('logout')}
        </button>
      </div>
    );
  }

  return (
   <span></span>
  );
}
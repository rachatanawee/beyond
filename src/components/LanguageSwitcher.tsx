'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useState, useTransition } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        disabled={isPending}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {t('language')}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 dark:bg-gray-800 dark:border-gray-600">
          <div className="py-1">
            <button
              onClick={() => onSelectChange('en')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${locale === 'en' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                }`}
            >
              🇺🇸 {t('english')}
            </button>
            <button
              onClick={() => onSelectChange('th')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${locale === 'th' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                }`}
            >
              🇹🇭 {t('thai')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
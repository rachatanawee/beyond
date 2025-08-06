'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Languages,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/lib/navigation/menu-config';
import { getIconComponent } from '@/lib/navigation/icon-map';

// Navigation is now handled by server-side menu configuration

interface DashboardNavProps {
  onClose?: () => void;
  menuItems?: MenuItem[];
  userProfile?: {
    id: string;
    role: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export function DashboardNav({ onClose, menuItems = [], userProfile }: DashboardNavProps) {
  const { user, profile: authProfile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const [, startTransition] = useTransition();

  // Use passed userProfile or fallback to auth profile
  const profile = userProfile || authProfile;

  const handleLocaleChange = (nextLocale: string) => {
    console.log('Language change clicked:', nextLocale, 'current pathname:', pathname);
    
    // Close dropdown and sidebar only on mobile
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
    
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

// Navigation Item Component
function NavigationItem({ item, level = 0, onItemClick }: {
  item: MenuItem;
  level?: number;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isDirectMatch = pathname === item.href;

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (onItemClick) {
      onItemClick();
    }
  };

  const itemContent = (
    <div className={cn(
      'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors group',
      level === 0 ? 'mb-1' : 'mb-0.5',
      level > 0 && 'ml-4 pl-6 border-l border-gray-200 dark:border-gray-700',
      isDirectMatch
        ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
    )}>
      <div className="flex items-center">
        {(() => {
          const IconComponent = getIconComponent(item.iconName);
          return (
            <IconComponent
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isDirectMatch
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
              )}
            />
          );
        })()}
        <span className="truncate">{item.name}</span>
        {item.badge && (
          <span className={cn(
            'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            item.badge.variant === 'destructive' 
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          )}>
            {item.badge.text}
          </span>
        )}
      </div>
      
      {hasChildren && (
        <div className="flex items-center">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      )}
    </div>
  );

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={handleClick}
          className="w-full text-left hover:bg-transparent p-0"
        >
          {itemContent}
        </button>
        {isOpen && (
          <div className="space-y-1 mt-1">
            {item.children?.map((child) => (
              <NavigationItem
                key={child.id}
                item={child}
                level={level + 1}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href} onClick={onItemClick}>
      {itemContent}
    </Link>
  );
}

  const handleLinkClick = () => {
    // Close sidebar only on mobile when a link is clicked
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-bold">Beyond</h1>
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      {/* Server-side Navigation Menu */}
      {menuItems.length > 0 ? (
        <nav className="flex-1 space-y-1 px-3 py-4">
          {/* Role Badge */}
          {profile?.role && (
            <div className="mb-4 px-3">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {profile.role}
                </span>
                {profile.role === 'admin' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Admin
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                onItemClick={handleLinkClick}
              />
            ))}
          </div>
        </nav>
      ) : (
        <div className="flex-1 flex items-center justify-center px-3 py-4">
          <p className="text-sm text-gray-500">Loading navigation...</p>
        </div>
      )}

      {/* User Menu */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" onClick={handleLinkClick}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" onClick={handleLinkClick}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <span>{t('language')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem 
                    onClick={() => handleLocaleChange('en')}
                    className={locale === 'en' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  >
                    <span>🇺🇸 {t('english')} {locale === 'en' ? '✓' : ''}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLocaleChange('th')}
                    className={locale === 'th' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  >
                    <span>🇹🇭 {t('thai')} {locale === 'th' ? '✓' : ''}</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
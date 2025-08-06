'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { MenuItem } from '@/lib/navigation/menu-config';
import { getIconComponent } from '@/lib/navigation/icon-map';

interface NavigationMenuProps {
  menuItems: MenuItem[];
  userProfile: {
    id: string;
    role: string;
    full_name?: string;
    avatar_url?: string;
  };
  userPermissions: string[];
}

interface NavigationItemProps {
  item: MenuItem;
  level?: number;
  onItemClick?: () => void;
}

function NavigationItem({ item, level = 0, onItemClick }: NavigationItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || (hasChildren && item.children?.some(child => pathname === child.href));
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
          <Badge 
            variant={item.badge.variant} 
            className="ml-2 text-xs"
          >
            {item.badge.text}
          </Badge>
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start p-0 h-auto hover:bg-transparent"
            onClick={handleClick}
          >
            {itemContent}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {item.children?.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link href={item.href} onClick={onItemClick}>
      {itemContent}
    </Link>
  );
}

export function NavigationMenu({ menuItems, userProfile, userPermissions }: NavigationMenuProps) {
  const handleItemClick = () => {
    // This can be used to close mobile sidebar or perform other actions
    // Will be passed down from parent component
  };

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {/* User Role Badge */}
      <div className="mb-4 px-3">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {userProfile.role}
          </Badge>
          {userProfile.role === 'admin' && (
            <Badge variant="destructive" className="text-xs">
              Admin
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1">
        {menuItems.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            onItemClick={handleItemClick}
          />
        ))}
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 px-3 py-2 text-xs text-gray-500 space-y-1 border-t border-gray-200 dark:border-gray-700">
          <div className="font-medium">Debug Info:</div>
          <div>Role: {userProfile.role}</div>
          <div>Permissions: {userPermissions.length}</div>
          <div>Menu Items: {menuItems.length}</div>
        </div>
      )}
    </nav>
  );
}
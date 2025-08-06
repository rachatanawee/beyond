import { 
  Home, 
  BarChart3, 
  FileText, 
  Bell, 
  Users, 
  Shield, 
  Settings,
  User,
  Database,
  Activity,
  Lock,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  // เพิ่ม icons ใหม่ที่นี่
  CreditCard,
  Package,
  Truck,
  ShoppingCart,
  DollarSign,
  PieChart,
  BarChart,
  LineChart
} from 'lucide-react';

// Icon mapping for client-side resolution
export const iconMap = {
  Home,
  BarChart3,
  FileText,
  Bell,
  Users,
  Shield,
  Settings,
  User,
  Database,
  Activity,
  Lock,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  // เพิ่ม icons ใหม่ที่นี่
  CreditCard,
  Package,
  Truck,
  ShoppingCart,
  DollarSign,
  PieChart,
  BarChart,
  LineChart,
} as const;

export type IconName = keyof typeof iconMap;

// Get icon component by name
export function getIconComponent(iconName: string) {
  return iconMap[iconName as IconName] || Home;
}
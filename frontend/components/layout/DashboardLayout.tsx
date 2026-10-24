import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Sprout,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Bell,
  Settings,
  LogOut,
  Users,
  BarChart3,
  FileText,
  ChevronLeft,
  Menu,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const farmerNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/farmer' },
  { label: 'My Crops', icon: Package, path: '/farmer/crops' },
  { label: 'Orders', icon: ShoppingCart, path: '/farmer/orders' },
  { label: 'Wallet', icon: Wallet, path: '/farmer/wallet' },
  { label: 'Government Schemes', icon: Landmark, path: '/farmer/schemes' },
  { label: 'Notifications', icon: Bell, path: '/farmer/notifications' },
  { label: 'Settings', icon: Settings, path: '/farmer/settings' },
];

const buyerNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/buyer' },
  { label: 'Browse Crops', icon: Package, path: '/buyer/browse' },
  { label: 'My Orders', icon: ShoppingCart, path: '/buyer/orders' },
  { label: 'Wallet', icon: Wallet, path: '/buyer/wallet' },
  { label: 'Notifications', icon: Bell, path: '/buyer/notifications' },
  { label: 'Settings', icon: Settings, path: '/buyer/settings' },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Farmers', icon: Users, path: '/admin/farmers' },
  { label: 'Buyers', icon: Users, path: '/admin/buyers' },
  { label: 'Crops', icon: Package, path: '/admin/crops' },
  { label: 'Transactions', icon: Wallet, path: '/admin/transactions' },
  { label: 'Subsidy Schemes', icon: Landmark, path: '/admin/schemes' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Reports', icon: FileText, path: '/admin/reports' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'farmer':
        return farmerNavItems;
      case 'buyer':
        return buyerNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-sidebar z-50 transition-all duration-300 flex flex-col',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Sprout className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground">AgriTrade</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'sidebar-item',
                  isActive && 'sidebar-item-active',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-foreground font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate" title={user?.role === 'admin' ? user?.email : user?.name}>
                  {user?.role === 'admin' ? user?.email : user?.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full mt-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              isCollapsed && 'px-2'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full items-center justify-center text-primary-foreground shadow-lg"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary" />
            <span className="font-bold">AgriTrade</span>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

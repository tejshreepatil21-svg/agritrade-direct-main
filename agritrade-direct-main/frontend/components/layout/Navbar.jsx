import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Sprout, LogOut, User, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleBenefitsClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const benefitsSection = document.getElementById('benefits');
      if (benefitsSection) {
        benefitsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const benefitsSection = document.getElementById('benefits');
        if (benefitsSection) {
          benefitsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'farmer':
        return '/farmer';
      case 'buyer':
        return '/buyer';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AgriTrade</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" onClick={handleHomeClick} className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <a href="#benefits" onClick={handleBenefitsClick} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Benefits
            </a>
            <a href="#contact" onClick={handleContactClick} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Contact
            </a>
            {/* <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/crops" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse Crops
            </Link> */}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden ml-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <Link to="/" onClick={handleHomeClick} className="text-lg font-medium hover:text-primary transition-colors">
                    Home
                  </Link>
                  <a
                    href="#benefits"
                    onClick={(e) => {
                      handleBenefitsClick(e);
                      // Close sheet if possible, but for now just handle the click
                    }}
                    className="text-lg font-medium hover:text-primary transition-colors cursor-pointer"
                  >
                    Benefits
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      handleContactClick(e);
                      // Close sheet if possible, but for now just handle the click
                    }}
                    className="text-lg font-medium hover:text-primary transition-colors cursor-pointer"
                  >
                    Contact
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
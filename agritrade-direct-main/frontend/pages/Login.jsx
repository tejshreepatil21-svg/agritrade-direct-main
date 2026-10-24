import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Sprout, ShoppingBag, Loader2 } from 'lucide-react';
import farmerBg from '@/assets/bg.jpg';
import { toast } from 'sonner';

const roles = [
  {
    value: 'farmer',
    label: 'Farmer',
    icon: Sprout,
    description: 'Sell your crops directly to buyers',
  },
  {
    value: 'buyer',
    label: 'Buyer',
    icon: ShoppingBag,
    description: 'Purchase fresh produce from farmers',
  },

];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    // Auto-detect admin role based on email
    const isAdminEmail = email.toLowerCase() === 'patelkeshav03@gmail.com';

    if (!isAdminEmail && !selectedRole) {
      toast.error('Please select a role (Farmer or Buyer)');
      return;
    }

    setIsLoading(true);
    try {
      const roleToLogin = isAdminEmail ? 'admin' : selectedRole;

      const response = await login(email, password, roleToLogin);

      // Validate role matches (skip for admin auto-login)
      if (response.user.role !== roleToLogin) {
        toast.error(`Invalid role. This account is registered as ${response.user.role}. Please select the correct role.`);
        setIsLoading(false);
        return;
      }

      toast.success('Login successful!');

      // Redirect based on actual user role
      const redirectPath = response.user.role === 'admin'
        ? '/admin/dashboard'
        : response.user.role === 'farmer'
          ? '/farmer'
          : '/buyer';

      navigate(redirectPath);
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please check your credentials and role selection.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `url(${farmerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8 bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <div className="dashboard-card p-6 sm:p-8 animate-scale-in bg-white/95 backdrop-blur-md shadow-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary mb-3 sm:mb-4">
                <Sprout className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Sign in to your AgriTrade account</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border-2 transition-all ${selectedRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 ${selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                        }`}
                    />
                    <span
                      className={`text-xs sm:text-sm font-medium block ${selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                        }`}
                    >
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

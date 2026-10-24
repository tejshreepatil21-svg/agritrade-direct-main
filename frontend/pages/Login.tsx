import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { UserRole } from '@/types';
import { Sprout, User, ShoppingBag, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const roles: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
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
  {
    value: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Manage the platform',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password, selectedRole);
      toast.success('Login successful!');
      navigate(selectedRole === 'admin' ? '/admin' : selectedRole === 'farmer' ? '/farmer' : '/buyer');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md">
          <div className="dashboard-card p-8 animate-scale-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                <Sprout className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground mt-1">Sign in to your AgriTrade account</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <role.icon
                    className={`w-6 h-6 mx-auto mb-1 ${
                      selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {role.label}
                  </span>
                </button>
              ))}
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

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo:</strong> Use any email/password and select a role to explore
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

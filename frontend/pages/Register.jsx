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

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Validate role-specific fields
    if (selectedRole === 'farmer' && !farmSize) {
      toast.error('Farm size is required for farmers');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name,
        email,
        password,
        role: selectedRole,
        phone,
        village,
      };

      // Add role-specific fields
      if (selectedRole === 'farmer') {
        userData.farmSize = parseFloat(farmSize);
        userData.crops = [];
      } else if (selectedRole === 'buyer') {
        userData.businessName = businessName;
      }

      await register(userData);
      toast.success('Registration successful!');
      navigate(selectedRole === 'farmer' ? '/farmer' : '/buyer');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
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
          <div className="dashboard-card p-8 animate-scale-in bg-white/95 backdrop-blur-md shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                <Sprout className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground mt-1">Join AgriTrade and start trading</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <Icon
                      className={`w-8 h-8 mb-2 ${selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                        }`}
                    />
                    <span
                      className={`block font-semibold ${selectedRole === role.value ? 'text-primary' : 'text-foreground'
                        }`}
                    >
                      {role.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{role.description}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village/City</Label>
                <Input
                  id="village"
                  type="text"
                  placeholder="Your village or city"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>

              {selectedRole === 'farmer' && (
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size (acres) *</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5.5"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedRole === 'buyer' && (
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              )}

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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

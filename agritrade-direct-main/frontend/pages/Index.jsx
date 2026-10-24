import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { publicAPI } from '@/lib/api';
import heroImage from '@/assets/hero-farm.jpg';
import pageBg from '@/assets/bg.jpg';
import {
  Sprout,
  Users,
  Wallet,
  Shield,
  TrendingUp,
  Truck,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { ContactSection } from '@/components/ContactSection';

const features = [
  {
    icon: Users,
    title: 'Direct Connection',
    description: 'Connect farmers directly with buyers, eliminating middlemen and ensuring fair prices.',
  },
  {
    icon: Wallet,
    title: 'Secure Wallet',
    description: 'In-app wallet system for seamless transactions with complete transparency.',
  },
  {
    icon: Shield,
    title: 'Verified Users',
    description: 'All farmers and buyers are verified to ensure trust and reliability.',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Pricing',
    description: 'Access real-time market prices to make informed buying and selling decisions.',
  },
  {
    icon: Truck,
    title: 'Order Tracking',
    description: 'Track your orders from farm to doorstep with real-time updates.',
  },
  {
    icon: Sprout,
    title: 'Government Schemes',
    description: 'Access and apply for government subsidies and agricultural schemes.',
  },
];



const testimonials = [
  {
    name: 'Keshav Patel',
    role: 'Farmer, velda,Gujarat',
    content: 'AgriTrade helped me get 30% better prices for my crops by connecting me directly with buyers.',
    rating: 5,
  },
  {
    name: 'Ketan Patil',
    role: 'Buyer, Korit',
    content: 'I can now source fresh produce directly from farmers. The quality is exceptional and prices are fair.',
    rating: 5,
  },
  // {
  //   name: 'Suresh Kumar',
  //   role: 'Farmer, Punjab',
  //   content: 'The government schemes section helped me apply for subsidies I didn\'t even know existed!',
  //   rating: 5,
  // },
];

export default function Index() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { value: '0+', label: 'Active Farmers' },
    { value: '0+', label: 'Verified Buyers' },
    { value: '₹0+', label: 'Transactions' },
    { value: '0+', label: 'Villages Covered' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await publicAPI.getStats();
        setStats([
          { value: `${data.activeFarmers}+`, label: 'Active Farmers' },
          { value: `${data.verifiedBuyers}+`, label: 'Verified Buyers' },
          { value: `₹${(data.transactionVolume / 10000000).toFixed(1)}Cr+`, label: 'Transactions' }, // converting to Crores
          { value: `${data.villagesCovered}+`, label: 'Villages Covered' },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${pageBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full text-secondary mb-6">
              <Sprout className="w-5 h-5" />
              <span className="text-sm font-medium">India's #1 Farmer-Buyer Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight">
              Connecting Farms to{' '}
              <span className="text-secondary">Markets</span> Directly
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              AgriTrade empowers farmers to sell directly to buyers, ensuring fair prices,
              transparent transactions, and access to government schemes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Selling
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/crops">

              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-10">
              {['100% Secure', 'Verified Users', 'Instant Payments'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-primary-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-white/80 backdrop-blur-sm border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center animate-slide-up">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="benefits" className="py-20 sm:py-28 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose AgriTrade?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              A complete ecosystem designed to transform agricultural trade in India
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="stat-card group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate('/login')}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Register',
                description: 'Create your account as a farmer or buyer in minutes',
              },
              {
                step: '02',
                title: 'Connect',
                description: 'Farmers list crops, buyers browse and place orders',
              },
              {
                step: '03',
                title: 'Transact',
                description: 'Secure payments through wallet with full transparency',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div
                  className="dashboard-card p-6 sm:p-8 text-center cursor-pointer transition-transform hover:scale-105"
                  onClick={() => navigate('/login')}
                >
                  <div className="text-5xl sm:text-6xl font-extrabold text-primary/10 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white/70 to-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              What Our Users Say
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium">
              Trusted by thousands of farmers and buyers across India
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white border border-border rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-base sm:text-lg text-foreground mb-8 leading-relaxed flex-grow italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="border-t border-border pt-6">
                  <div className="font-bold text-lg text-foreground mb-1">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground font-medium">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 gradient-hero mb-12 sm:mb-16 md:mb-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Agricultural Trade?
          </h2>
          <p className="text-base sm:text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and buyers already benefiting from direct trade on AgriTrade.
          </p>
          <Link to="/register">
            <Button variant="hero" size="xl">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <ContactSection />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-8 h-8" />
                <span className="text-xl font-bold">AgriTrade</span>
              </div>
              <p className="text-sm sm:text-base text-primary-foreground/70">
                Empowering Indian agriculture through technology and direct trade.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><Link to="/about" className="hover:text-primary-foreground">About Us</Link></li>
                <li><Link to="/crops" className="hover:text-primary-foreground">Browse Crops</Link></li>
                <li><Link to="/register" className="hover:text-primary-foreground">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><a href="#" className="hover:text-primary-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><a href="#" className="hover:text-primary-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
            © 2026-AgriTrade,All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
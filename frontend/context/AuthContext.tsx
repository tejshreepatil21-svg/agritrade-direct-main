import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: Record<UserRole, User> = {
  farmer: {
    id: 'farmer-1',
    name: 'Rajesh Kumar',
    email: 'farmer@demo.com',
    role: 'farmer',
    phone: '+91 98765 43210',
    village: 'Rampur, Uttar Pradesh',
    isVerified: true,
    createdAt: new Date('2024-01-15'),
  },
  buyer: {
    id: 'buyer-1',
    name: 'Priya Sharma',
    email: 'buyer@demo.com',
    role: 'buyer',
    phone: '+91 87654 32109',
    isVerified: true,
    createdAt: new Date('2024-02-20'),
  },
  admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@agritrade.com',
    role: 'admin',
    isVerified: true,
    createdAt: new Date('2024-01-01'),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser(demoUsers[role]);
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
      isVerified: false,
      createdAt: new Date(),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

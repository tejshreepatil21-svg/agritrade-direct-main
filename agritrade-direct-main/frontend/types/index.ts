export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  village?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface Farmer extends User {
  role: 'farmer';
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  crops: Crop[];
}

export interface Buyer extends User {
  role: 'buyer';
  orders: Order[];
}

export interface Crop {
  id: string;
  farmerId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  cropId: string;
  farmerId: string;
  buyerId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Wallet {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface SubsidyScheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  deadline: Date;
  amount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface SubsidyApplication {
  id: string;
  farmerId: string;
  schemeId: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  processedAt?: Date;
}

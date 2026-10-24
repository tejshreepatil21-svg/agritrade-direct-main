import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Building2,
  History,
  Download,
} from 'lucide-react';
import { useState } from 'react';

const transactions = [
  { id: 'TXN001', type: 'credit', description: 'Payment from Priya Sharma', amount: 2500, date: '2024-01-15', status: 'completed' },
  { id: 'TXN002', type: 'credit', description: 'Payment from Rahul Verma', amount: 4000, date: '2024-01-14', status: 'completed' },
  { id: 'TXN003', type: 'debit', description: 'Withdrawal to Bank', amount: 5000, date: '2024-01-13', status: 'completed' },
  { id: 'TXN004', type: 'credit', description: 'Payment from Amit Singh', amount: 800, date: '2024-01-12', status: 'completed' },
  { id: 'TXN005', type: 'debit', description: 'Withdrawal to Bank', amount: 10000, date: '2024-01-10', status: 'pending' },
];

export default function FarmerWallet() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const balance = 45230;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your earnings and withdrawals</p>
        </div>

        {/* Balance Card */}
        <div className="dashboard-card gradient-hero p-8 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-foreground/80">Available Balance</p>
              <p className="text-4xl font-bold mt-2">₹{balance.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-secondary/20 rounded-2xl">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button variant="hero" className="gap-2">
              <Building2 className="w-4 h-4" />
              Withdraw to Bank
            </Button>
            <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <ArrowDownRight className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹12,500</p>
                <p className="text-sm text-muted-foreground">This Month Earnings</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <ArrowUpRight className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹15,000</p>
                <p className="text-sm text-muted-foreground">This Month Withdrawals</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary/20">
                <History className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">23</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="dashboard-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Withdrawal</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Bank: HDFC Bank ****1234 | IFSC: HDFC0001234
              </p>
            </div>
            <Button variant="default" disabled={!withdrawAmount}>
              Withdraw ₹{withdrawAmount || '0'}
            </Button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="dashboard-card">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
              <Button variant="ghost" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
          <div className="divide-y divide-border">
            {transactions.map((txn) => (
              <div key={txn.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${txn.type === 'credit' ? 'bg-success/10' : 'bg-primary/10'}`}>
                    {txn.type === 'credit' ? (
                      <ArrowDownRight className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{txn.description}</p>
                    <p className="text-sm text-muted-foreground">{txn.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${txn.type === 'credit' ? 'text-success' : 'text-foreground'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </p>
                  <p className={`text-xs ${txn.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

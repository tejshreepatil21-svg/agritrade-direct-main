import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { farmerAPI, walletAPI } from "@/lib/api";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  History,
  Download,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FarmerWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDeletingBank, setIsDeletingBank] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const { toast } = useToast();

  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: ''
  });

  useEffect(() => {
    fetchWalletData();
    fetchBankDetails();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, txnRes] = await Promise.all([
        farmerAPI.getWallet(),
        farmerAPI.getWalletTransactions()
      ]);

      if (walletRes.success) {
        setBalance(walletRes.data.balance || 0);
      }
      if (txnRes.success) {
        setTransactions(txnRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data', error);

      const msg = error?.response?.data?.message || error.message;
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        (msg && msg.toLowerCase().includes('access required'))
      ) {
        // Redirect or let auth context handle validity? 
        // For now, let's toast and maybe nothing else as layout handles some auth?
        // Actually, consistency:
        // But `logout` is not imported here from usAuth directly. 
        // I will just show error. If user is invalid, they should relogin.
      }

      toast({
        title: "Error",
        description: "Failed to load wallet information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await walletAPI.getBankDetails();
      if (response.success) {
        setBankDetails(response.data);
      }
    } catch (error) {
      // It's okay if bank details don't exist yet
      console.log("No bank details found or error", error);
    }
  };

  const handleWithdraw = async () => {
    if (!bankDetails) {
      toast({ title: "No Bank Account", description: "Please add a bank account first", variant: "destructive" });
      setIsBankModalOpen(true);
      return;
    }

    if (!withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      toast({ title: "Insufficient Balance", description: "You do not have enough funds", variant: "destructive" });
      return;
    }

    try {
      setIsWithdrawing(true);
      const response = await farmerAPI.withdrawMoney(parseFloat(withdrawAmount));
      if (response.success) {
        toast({ title: "Success", description: "Withdrawal successful" });
        setWithdrawAmount('');
        // Refresh data
        fetchWalletData();
      }
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      await walletAPI.addBankAccount(bankForm);
      toast({ title: "Success", description: "Bank account added successfully" });
      setIsBankModalOpen(false);
      fetchBankDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add bank account",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBank = async () => {
    if (!window.confirm("Are you sure you want to delete your bank account details?")) return;

    try {
      setIsDeletingBank(true);
      await walletAPI.deleteBankAccount();
      setBankDetails(null);
      toast({ title: "Success", description: "Bank account deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete bank account",
        variant: "destructive"
      });
    } finally {
      setIsDeletingBank(false);
    }
  };

  const handleBankInputChange = (e) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  // Calculate stats
  const totalEarnings = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Wallet</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">Manage your earnings and withdrawals</p>
          </div>
          {!bankDetails && (
            <Button onClick={() => setIsBankModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Bank Account
            </Button>
          )}
        </div>

        {/* Balance Card */}
        <div className="dashboard-card gradient-hero p-6 sm:p-8 text-primary-foreground">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base text-primary-foreground/80">Available Balance</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 break-words">₹{balance.toLocaleString()}</p>
            </div>
            <div className="p-3 sm:p-4 bg-secondary/20 rounded-2xl flex-shrink-0">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button variant="hero" className="gap-2 w-full sm:w-auto text-sm sm:text-base" onClick={() => document.getElementById('withdraw-input').focus()}>
              <Building2 className="w-4 h-4" />
              Withdraw to Bank
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="stat-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-success/10 flex-shrink-0">
                <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground">₹{totalEarnings.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 flex-shrink-0">
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground">₹{totalWithdrawals.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Withdrawals</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/20 flex-shrink-0">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{transactions.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="dashboard-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Quick Withdrawal</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Input
                id="withdraw-input"
                type="number"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="text-sm sm:text-base"
              />
              {bankDetails ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    {bankDetails.bankName}: {bankDetails.accountNumber} | IFSC: {bankDetails.ifscCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDeleteBank}
                    disabled={isDeletingBank}
                    title="Delete Bank Account"
                  >
                    {isDeletingBank ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2 break-words flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  <span className="text-red-500 cursor-pointer hover:underline" onClick={() => setIsBankModalOpen(true)}>
                    No bank account added. Click here to add.
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="default"
              disabled={!withdrawAmount || isWithdrawing || !bankDetails}
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={handleWithdraw}
            >
              {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Withdraw ₹{withdrawAmount || '0'}
            </Button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="dashboard-card">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Transaction History</h2>
              <Button variant="ghost" size="sm" className="gap-2 text-xs sm:text-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
          <div className="divide-y divide-border">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions found.</div>
            ) : (
              transactions.map((txn) => (
                <div key={txn._id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ${txn.type === 'credit' ? 'bg-success/10' : 'bg-primary/10'}`}>
                      {txn.type === 'credit' ? (
                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{txn.reference}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{format(new Date(txn.createdAt), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right sm:flex-shrink-0">
                    <p className={`font-bold text-sm sm:text-base ${txn.type === 'credit' ? 'text-success' : 'text-foreground'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </p>
                    <p className={`text-xs mt-0.5 ${txn.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Bank Dialog */}
        <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input id="accountHolderName" name="accountHolderName" value={bankForm.accountHolderName} onChange={handleBankInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select onValueChange={(val) => setBankForm({ ...bankForm, bankName: val })} value={bankForm.bankName}>
                  <SelectTrigger className="pl-10 relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <span className="pl-2"><SelectValue placeholder="Select Bank" /></span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="State Bank of India (SBI)">State Bank of India (SBI)</SelectItem>
                    <SelectItem value="Bank of Baroda">Bank of Baroda</SelectItem>
                    <SelectItem value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</SelectItem>
                    <SelectItem value="Canara Bank">Canara Bank</SelectItem>
                    <SelectItem value="Union Bank of India">Union Bank of India</SelectItem>
                    <SelectItem value="Bank of India">Bank of India</SelectItem>
                    <SelectItem value="Central Bank of India">Central Bank of India</SelectItem>
                    <SelectItem value="Indian Bank">Indian Bank</SelectItem>
                    <SelectItem value="Indian Overseas Bank">Indian Overseas Bank</SelectItem>
                    <SelectItem value="UCO Bank">UCO Bank</SelectItem>
                    <SelectItem value="Bank of Maharashtra">Bank of Maharashtra</SelectItem>
                    <SelectItem value="Punjab & Sind Bank">Punjab & Sind Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" name="accountNumber" value={bankForm.accountNumber} onChange={handleBankInputChange} required pattern="[0-9]+" title="Only numbers allowed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" name="ifscCode" value={bankForm.ifscCode} onChange={handleBankInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select onValueChange={(val) => setBankForm({ ...bankForm, accountType: val })} value={bankForm.accountType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Save Bank Details</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

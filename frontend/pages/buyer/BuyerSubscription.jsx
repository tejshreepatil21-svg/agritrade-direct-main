import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { buyerAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Check, Shield, Zap, Star, Download, Smartphone, CreditCard, Wallet, LockKeyhole, Printer } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function BuyerSubscription() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);

    // Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansRes, statusRes] = await Promise.all([
                buyerAPI.getSubscriptionPlans(),
                buyerAPI.getSubscriptionStatus()
            ]);

            if (plansRes.success) setPlans(plansRes.data);
            if (statusRes.success) setSubscription(statusRes.data);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load subscription info", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = () => {
        if (!subscription?.transactionId) {
            toast({ title: "Unavailable", description: "Receipt not available for this subscription", variant: "destructive" });
            return;
        }
        window.open(`/buyer/subscription/invoice/${subscription.transactionId}`, '_blank');
    };

    const initiatePayment = (plan) => {
        setSelectedPlan(plan);
        setSelectedMethod(''); // Reset method
        setIsPaymentModalOpen(true);
    };

    const handleSubscribe = async () => {
        if (!selectedPlan || !selectedMethod) return;

        try {
            setSubmitting(true);

            const res = await buyerAPI.subscribe({
                planId: selectedPlan.id,
                paymentMethod: selectedMethod
            });

            if (res.success) {
                toast({ title: "Success", description: "Subscription activated successfully!" });
                setIsPaymentModalOpen(false);
                fetchData(); // Refresh status
            }
        } catch (error) {
            toast({
                title: "Subscription Failed",
                description: error.message || "Payment failed.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const isSubscribed = subscription?.isSubscribed;

    const PaymentOption = ({ id, label, icon: Icon, colorClass, iconColor }) => (
        <div
            onClick={() => setSelectedMethod(id)}
            className={`
                group relative cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all duration-200
                ${selectedMethod === id
                    ? `border-primary bg-primary/5 shadow-md ring-1 ring-primary`
                    : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                }
            `}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg transition-colors duration-200 ${selectedMethod === id ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white group-hover:shadow-sm'}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <span className={`font-semibold ${selectedMethod === id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {label}
                </span>
            </div>
            <div className={`
                w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200
                ${selectedMethod === id ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}
            `}>
                {selectedMethod === id && <Check className="w-3 h-3 text-white" />}
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="text-center max-w-3xl mx-auto pt-4">
                    <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Unlock Premium Power
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Get direct access to farmers, zero commissions, and exclusive bulk deals. <br className="hidden sm:block" />
                        Choose the plan that fits your growth.
                    </p>
                </div>

                {isSubscribed && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-200">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-emerald-900">Active Membership</h3>
                                <p className="text-emerald-700 mt-1">
                                    You are currently on the <strong>{subscription.subscriptionPlan?.toUpperCase()}</strong> plan.
                                    <span className="block sm:inline sm:ml-2 text-sm opacity-80">
                                        Expires on {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                                    </span>
                                </p>
                            </div>
                        </div>
                        {subscription.transactionId && (
                            <Button variant="outline" onClick={handleViewInvoice} className="border-emerald-200 hover:bg-white hover:text-emerald-700 text-emerald-800 font-medium">
                                <Printer className="w-4 h-4 mr-2" />
                                View Invoice
                            </Button>
                        )}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
                    {plans && plans.length > 0 ? (
                        plans.map((plan) => {
                            const isCurrentPlan = subscription?.subscriptionPlan === plan.id;
                            const isPremium = plan.id === 'premium';

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-3xl p-8 border transition-all duration-300 flex flex-col group ${isPremium
                                        ? 'border-primary/20 bg-gradient-to-b from-primary/5 via-white to-white shadow-xl hover:shadow-2xl scale-[1.02] z-10'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                                        }`}
                                >
                                    {isPremium && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 tracking-wide uppercase">
                                            <Star className="w-4 h-4 fill-current" />
                                            Recommended
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold mb-2 text-slate-800">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-extrabold tracking-tight text-slate-900">₹{plan.price}</span>
                                            <span className="text-slate-500 font-medium text-lg">/{plan.duration}</span>
                                        </div>
                                        <p className="text-slate-500 mt-3 font-medium">
                                            {plan.id === 'pro'
                                                ? 'Essential tools for smart buyers'
                                                : 'Complete toolkit for scaling business'
                                            }
                                        </p>
                                    </div>

                                    <div className="flex-grow space-y-4 mb-8">
                                        {plan.features && plan.features.length > 0 ? (
                                            plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className={`p-1 rounded-full mt-0.5 flex-shrink-0 ${isPremium ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-slate-700 leading-tight">{feature}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">No features available</span>
                                        )}
                                    </div>

                                    <Button
                                        className={`w-full py-6 text-lg shadow-lg transition-all active:scale-[0.98] ${isPremium
                                            ? 'bg-primary hover:bg-primary/90 shadow-primary/25'
                                            : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-slate-100'
                                            }`}
                                        variant={isPremium ? 'default' : 'ghost'}
                                        disabled={isSubscribed || submitting}
                                        onClick={() => initiatePayment(plan)}
                                    >
                                        {isCurrentPlan ? (
                                            <span className="flex items-center gap-2">
                                                <Check className="w-5 h-5" /> Current Plan
                                            </span>
                                        ) : isSubscribed ? (
                                            'Subscription Active'
                                        ) : (
                                            'Get Started'
                                        )}
                                    </Button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-2 text-center text-gray-500 py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-lg">No subscription plans available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="sm:max-w-md p-0 gap-0 border-0 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white text-center relative flex-shrink-0">
                        <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-2xl font-bold text-center text-white mb-2">Secure Checkout</DialogTitle>
                            <DialogDescription className="text-slate-300 text-center">
                                Complete your upgrade to {selectedPlan?.name}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 bg-white space-y-6 overflow-y-auto custom-scrollbar">
                        {selectedPlan && (
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                                    <p className="text-3xl font-bold text-slate-900">₹{selectedPlan.price}</p>
                                </div>
                                <div className="text-right bg-white px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-600">
                                    {selectedPlan.duration}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-900 block ml-1">Select Payment Method</label>

                            <PaymentOption
                                id="PhonePe"
                                label="PhonePe"
                                icon={Smartphone} // Using generic icon but colored
                                iconColor="text-purple-600"
                            />
                            <PaymentOption
                                id="GPay"
                                label="Google Pay"
                                icon={Wallet}
                                iconColor="text-blue-600"
                            />
                            <PaymentOption
                                id="Paytm"
                                label="Paytm"
                                icon={CreditCard}
                                iconColor="text-cyan-600"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                        <Button
                            type="button"
                            className="w-full py-6 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            size="lg"
                            disabled={!selectedMethod || submitting}
                            onClick={handleSubscribe}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LockKeyhole className="w-5 h-5 opacity-80" />
                                    Pay ₹{selectedPlan?.price || 0} Securely
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
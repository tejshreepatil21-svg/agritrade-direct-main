import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { farmerAPI, userAPI } from "@/lib/api"; // Added userAPI
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from 'react';
import {
    User,
    Lock,
    CreditCard,
    Globe,
    LogOut,
    Loader2,
    Camera,
    Bell
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

export default function FarmerSettings() {
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { logout } = useAuth();

    // Section loading states
    const [profileSaving, setProfileSaving] = useState(false);
    const [bankSaving, setBankSaving] = useState(false);
    const [securitySaving, setSecuritySaving] = useState(false);
    const [prefSaving, setPrefSaving] = useState(false);

    // Form Data
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        profileImage: ''
    });

    const [bank, setBank] = useState({
        bankAccount: '',
        ifsc: '',
        upiId: '',
        bankName: '',
        accountHolderName: ''
    });

    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: ''
    });

    const [preference, setPreference] = useState({
        language: 'en',
        notificationSettings: {
            email: true,
            push: true,
            sms: true
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await farmerAPI.getProfile();
            if (response.success && response.data) {
                const data = response.data;
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    profileImage: data.profileImage || ''
                });
                setBank({
                    bankAccount: data.bankAccount || '',
                    ifsc: data.ifsc || '',
                    upiId: data.upiId || data.upi || '', // Support both
                    bankName: data.bankName || '',
                    accountHolderName: data.accountHolderName || ''
                });
                setPreference({
                    language: data.language || 'en',
                    notificationSettings: data.notificationSettings || { email: true, push: true, sms: true }
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load profile data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            await farmerAPI.updateProfile(profile);
            toast({ title: "Success", description: "Profile updated successfully" });
        } catch (error) {
            toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
        } finally {
            setProfileSaving(false);
        }
    };

    const handleBankUpdate = async (e) => {
        e.preventDefault();
        setBankSaving(true);
        try {
            // Log for debugging
            console.log('Updating Bank:', bank);
            await farmerAPI.updateBankDetails(bank);
            toast({ title: "Success", description: "Bank details updated successfully" });
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setBankSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setSecuritySaving(true);
        try {
            await farmerAPI.changePassword(password);
            toast({ title: "Success", description: "Password changed successfully" });
            setPassword({ currentPassword: '', newPassword: '' });
        } catch (error) {
            toast({ title: "Error", description: error.message || "Incorrect current password", variant: "destructive" });
        } finally {
            setSecuritySaving(false);
        }
    };

    const handlePreferenceUpdate = async (updates) => {
        const newPrefs = { ...preference, ...updates };
        setPreference(newPrefs);
        setPrefSaving(true);
        try {
            // Using userAPI since it's generic, or define in farmerAPI
            await userAPI.updatePreference(newPrefs);
            toast({ title: "Success", description: "Preferences updated" });
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setPrefSaving(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
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

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
                </div>

                {/* Profile Information */}
                <div className="dashboard-card p-4 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                        <User className="w-5 h-5 text-primary" /> Profile Information
                    </h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Mobile Number</Label>
                                <Input
                                    id="phone"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={profileSaving} className="w-full sm:w-auto">
                                {profileSaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Bank Details */}
                <div className="dashboard-card p-4 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground/90">
                        <CreditCard className="w-5 h-5 text-primary" /> Bank Details
                    </h2>
                    <form onSubmit={handleBankUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                <Input
                                    id="accountHolderName"
                                    placeholder="Name as per bank records"
                                    value={bank.accountHolderName}
                                    onChange={(e) => setBank({ ...bank, accountHolderName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Input
                                    id="bankName"
                                    placeholder="e.g. State Bank of India"
                                    value={bank.bankName}
                                    onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankAccount">Account Number</Label>
                                <Input
                                    id="bankAccount"
                                    type="text"
                                    placeholder="Enter account number"
                                    value={bank.bankAccount}
                                    onChange={(e) => setBank({ ...bank, bankAccount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifsc">IFSC Code</Label>
                                <Input
                                    id="ifsc"
                                    placeholder="e.g. SBIN0001234"
                                    className="uppercase"
                                    value={bank.ifsc}
                                    onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="upiId">UPI ID</Label>
                                <Input
                                    id="upiId"
                                    placeholder="username@bank"
                                    value={bank.upiId}
                                    onChange={(e) => setBank({ ...bank, upiId: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={bankSaving} className="w-full sm:w-auto">
                                {bankSaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Save Bank Details
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preferences */}
                <div className="dashboard-card p-4 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-primary" /> Preferences
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                <Globe className="w-4 h-4" /> Language
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    variant={preference.language === 'en' ? 'default' : 'outline'}
                                    onClick={() => handlePreferenceUpdate({ language: 'en' })}
                                    className="flex-1"
                                >
                                    English
                                </Button>
                                <Button
                                    variant={preference.language === 'hi' ? 'default' : 'outline'}
                                    onClick={() => handlePreferenceUpdate({ language: 'hi' })}
                                    className="flex-1"
                                >
                                    हिंदी (Hindi)
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                <Bell className="w-4 h-4" /> Notifications
                            </h3>
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="notif-email" className="font-normal cursor-pointer text-muted-foreground">Email Notifications</Label>
                                    <Switch
                                        id="notif-email"
                                        checked={preference.notificationSettings.email}
                                        onCheckedChange={(checked) => handlePreferenceUpdate({
                                            notificationSettings: { ...preference.notificationSettings, email: checked }
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="notif-sms" className="font-normal cursor-pointer text-muted-foreground">SMS Notifications</Label>
                                    <Switch
                                        id="notif-sms"
                                        checked={preference.notificationSettings.sms}
                                        onCheckedChange={(checked) => handlePreferenceUpdate({
                                            notificationSettings: { ...preference.notificationSettings, sms: checked }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="dashboard-card p-4 sm:p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-primary" /> Security
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPass">Current Password</Label>
                                <Input
                                    id="currentPass"
                                    type="password"
                                    value={password.currentPassword}
                                    onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPass">New Password</Label>
                                <Input
                                    id="newPass"
                                    type="password"
                                    value={password.newPassword}
                                    onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-2 gap-3 sm:gap-0">
                            <Button type="button" variant="outline" className="w-full sm:w-auto text-destructive hover:bg-destructive/10 border-destructive/20" onClick={logout}>
                                <LogOut className="w-4 h-4 mr-2" /> Logout from all devices
                            </Button>
                            <Button type="submit" disabled={securitySaving} className="w-full sm:w-auto">
                                {securitySaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Change Password
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </DashboardLayout>
    );
}

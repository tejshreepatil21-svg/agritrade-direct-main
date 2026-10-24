import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { userAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from 'react';
import {
    User,
    Lock,
    LogOut,
    Loader2,
    Globe,
    Bell,
    Check,
    Camera
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function BuyerSettings() {
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { logout } = useAuth();

    // Section loading states
    const [profileSaving, setProfileSaving] = useState(false);
    const [securitySaving, setSecuritySaving] = useState(false);
    const [prefSaving, setPrefSaving] = useState(false);

    // Form Data
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        businessName: '',
        gstNumber: '',
        profileImage: ''
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
            const response = await userAPI.getProfile();
            // userAPI.getProfile() returns the user object directly sometimes depending on wrapper,
            // let's assume it returns { ...user } based on `users.js` logic which sends `res.json(user)`.
            // Check api.js: `return apiRequest('/users/me')`. apiRequest returns `response.json()`.
            // So default output is the user object directly.

            const data = response.user || response; // Resilience

            setProfile({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                businessName: data.businessName || '',
                gstNumber: data.gstNumber || '',
                profileImage: data.profileImage || ''
            });

            setPreference({
                language: data.language || 'en',
                notificationSettings: data.notificationSettings || { email: true, push: true, sms: true }
            });

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
            await userAPI.updateProfile(profile);
            toast({ title: "Success", description: "Profile updated successfully" });
        } catch (error) {
            toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setSecuritySaving(true);
        try {
            await userAPI.changePassword(password);
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
            await userAPI.updatePreference(newPrefs);
            toast({ title: "Success", description: "Preferences updated" });
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            // Revert on failure if needed, or just let next fetch sync
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
            <div className="space-y-6 pb-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your profile, security, and preferences.</p>
                </div>

                {/* Profile Information */}
                <div className="bg-card border rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold">Profile Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                                    {profile.profileImage ? (
                                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-muted-foreground" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                    <Camera className="w-6 h-6" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-muted text-muted-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+91..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    value={profile.businessName}
                                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                    placeholder="Company Ltd."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gst">GST Number</Label>
                                <Input
                                    id="gst"
                                    value={profile.gstNumber}
                                    onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={profileSaving} className="min-w-[120px]">
                                {profileSaving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <SaveIcon className="mr-2 w-4 h-4" />}
                                {profileSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preferences */}
                <div className="bg-card border rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold">Preferences</h2>
                    </div>

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
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="notif-email" className="font-normal cursor-pointer">Email Notifications</Label>
                                    <Switch
                                        id="notif-email"
                                        checked={preference.notificationSettings.email}
                                        onCheckedChange={(checked) => handlePreferenceUpdate({
                                            notificationSettings: { ...preference.notificationSettings, email: checked }
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="notif-sms" className="font-normal cursor-pointer">SMS Notifications</Label>
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
                <div className="bg-card border rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold">Security</h2>
                    </div>
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
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-4 gap-3">
                            <Button type="button" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 -ml-2" onClick={logout}>
                                <LogOut className="w-4 h-4 mr-2" /> Sign out of all devices
                            </Button>
                            <Button type="submit" disabled={securitySaving} variant="outline">
                                {securitySaving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

function SaveIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    )
}

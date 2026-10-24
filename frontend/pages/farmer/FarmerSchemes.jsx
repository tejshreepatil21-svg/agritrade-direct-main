import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { farmerAPI } from "@/lib/api";
import { format } from "date-fns";
import { useState, useEffect } from 'react';
import {
  Landmark,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function FarmerSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schemesRes, appsRes] = await Promise.all([
        farmerAPI.getSchemes(),
        farmerAPI.getMySchemeApplications()
      ]);

      if (schemesRes.success) {
        setSchemes(schemesRes.data);
      }
      if (appsRes.success) {
        setMyApplications(appsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch schemes data', error);
      toast({
        title: "Error",
        description: "Failed to load government schemes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (schemeId) => {
    try {
      setApplying(schemeId);
      const response = await farmerAPI.applyForScheme(schemeId);
      if (response.success) {
        toast({ title: "Success", description: "Application submitted successfully" });
        fetchData(); // Refresh data to update lists
      }
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error.message || "Could not apply for scheme",
        variant: "destructive"
      });
    } finally {
      setApplying(null);
    }
  };

  const hasApplied = (schemeId) => {
    return myApplications.some(app => app.schemeId?._id === schemeId || app.schemeId === schemeId);
  };

  const statusColors = {
    applied: 'bg-yellow-500/10 text-yellow-500',
    approved: 'bg-green-500/10 text-green-500',
    rejected: 'bg-red-500/10 text-red-500',
    active: 'bg-blue-500/10 text-blue-500',
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
      <div className="space-y-4 sm:space-y-6 pb-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Government Schemes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">Apply for subsidies and government schemes</p>
        </div>

        {/* My Applications */}
        <div className="dashboard-card">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">My Applications</h2>
          </div>
          <div className="divide-y divide-border">
            {myApplications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                You haven't applied to any schemes yet.
              </div>
            ) : (
              myApplications.map((app) => (
                <div key={app._id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm sm:text-base">{app.schemeId?.title || 'Unknown Scheme'}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Applied on {format(new Date(app.appliedAt), 'PPP')}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[app.status] || 'bg-gray-100'}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Schemes */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Available Schemes</h2>
          <div className="grid gap-3 sm:gap-4">
            {schemes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border shadow-sm text-muted-foreground">
                No active schemes available at the moment.
              </div>
            ) : (
              schemes.map((scheme) => {
                const isApplied = hasApplied(scheme._id);
                return (
                  <div key={scheme._id} className="dashboard-card p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground flex-1 min-w-0">{scheme.title}</h3>
                        {isApplied && (
                          <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Applied
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">{scheme.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs sm:text-sm mb-1">Subsidy Amount</p>
                          <p className="font-semibold text-foreground text-sm sm:text-base">₹{scheme.subsidyAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs sm:text-sm mb-1">Last Date</p>
                          <p className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{format(new Date(scheme.lastDate), 'PPP')}</span>
                          </p>
                        </div>
                        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                          <p className="text-muted-foreground text-xs sm:text-sm mb-1">Eligibility</p>
                          <p className="font-semibold text-foreground text-sm sm:text-base">{scheme.eligibility}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant={isApplied ? "outline" : "default"}
                          className="gap-2 w-full sm:w-auto text-sm sm:text-base"
                          onClick={() => handleApply(scheme._id)}
                          disabled={isApplied || applying === scheme._id}
                        >
                          {applying === scheme._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isApplied ? (
                            'Already Applied'
                          ) : (
                            <>
                              Apply Now
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Announcements (Keeping static for now as requested module didn't specify announcement backend) */}
        <div className="dashboard-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Recent Announcements</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm sm:text-base">PM Kisan 15th Installment Released</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  The government has released the 15th installment of PM Kisan Samman Nidhi. Check your bank account.
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm sm:text-base">Deadline Extended for Crop Insurance</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  The deadline for Crop Insurance application has been extended to February 28, 2024.
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2">5 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

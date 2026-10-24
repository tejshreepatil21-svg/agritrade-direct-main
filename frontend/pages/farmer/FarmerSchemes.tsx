import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Landmark,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
} from 'lucide-react';

const schemes = [
  {
    id: 'SCH001',
    title: 'PM Kisan Samman Nidhi',
    description: 'Direct income support of ₹6,000 per year to farmer families',
    amount: '₹6,000/year',
    deadline: '2024-03-31',
    eligibility: 'All small and marginal farmers',
    status: 'open',
  },
  {
    id: 'SCH002',
    title: 'Crop Insurance Scheme',
    description: 'Comprehensive risk coverage for crops against natural calamities',
    amount: 'Up to ₹50,000',
    deadline: '2024-02-28',
    eligibility: 'Farmers with crop cultivation',
    status: 'open',
  },
  {
    id: 'SCH003',
    title: 'Fertilizer Subsidy',
    description: 'Subsidy on purchase of fertilizers for agricultural use',
    amount: '₹5,000',
    deadline: '2024-01-31',
    eligibility: 'All registered farmers',
    status: 'closed',
  },
  {
    id: 'SCH004',
    title: 'Kisan Credit Card',
    description: 'Easy credit access for farmers at subsidized interest rates',
    amount: 'Up to ₹3 Lakhs',
    deadline: '2024-06-30',
    eligibility: 'Farmers with land ownership',
    status: 'open',
  },
];

const myApplications = [
  { id: 'APP001', scheme: 'PM Kisan Samman Nidhi', appliedOn: '2024-01-10', status: 'approved' },
  { id: 'APP002', scheme: 'Crop Insurance Scheme', appliedOn: '2024-01-12', status: 'pending' },
];

const statusColors: Record<string, string> = {
  open: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
  approved: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function FarmerSchemes() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Government Schemes</h1>
          <p className="text-muted-foreground mt-1">Apply for subsidies and government schemes</p>
        </div>

        {/* My Applications */}
        <div className="dashboard-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">My Applications</h2>
          </div>
          <div className="divide-y divide-border">
            {myApplications.map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{app.scheme}</p>
                    <p className="text-sm text-muted-foreground">Applied on {app.appliedOn}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Schemes */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Schemes</h2>
          <div className="grid gap-4">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="dashboard-card p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Landmark className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{scheme.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[scheme.status]}`}>
                        {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{scheme.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold text-foreground">{scheme.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-semibold text-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {scheme.deadline}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-muted-foreground">Eligibility</p>
                        <p className="font-semibold text-foreground">{scheme.eligibility}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {scheme.status === 'open' ? (
                      <Button variant="default" className="gap-2">
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Closed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="dashboard-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Announcements</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">PM Kisan 15th Installment Released</p>
                <p className="text-sm text-muted-foreground">
                  The government has released the 15th installment of PM Kisan Samman Nidhi. Check your bank account.
                </p>
                <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Deadline Extended for Crop Insurance</p>
                <p className="text-sm text-muted-foreground">
                  The deadline for Crop Insurance application has been extended to February 28, 2024.
                </p>
                <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

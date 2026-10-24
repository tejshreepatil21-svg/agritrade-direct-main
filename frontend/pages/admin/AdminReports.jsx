import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileDown, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminReports() {
    const [reportType, setReportType] = useState('farmers');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const { toast } = useToast();

    const generateReport = async () => {
        try {
            setLoading(true);
            setReportData(null);

            const params = {
                type: reportType,
                status: status,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };

            const response = await adminAPI.getReport(params);

            if (response.success) {
                setReportData(response.data);
                toast({
                    title: "Report Generated",
                    description: `Loaded ${response.data.length} records.`,
                });
            }
        } catch (error) {
            console.error("Report Error:", error);
            toast({
                title: "Error",
                description: "Failed to generate report",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!reportData || reportData.length === 0) return;

        // Get headers from first object
        const headers = Object.keys(reportData[0]);

        // Convert to CSV string
        const csvContent = [
            headers.join(','), // Header row
            ...reportData.map(row => headers.map(header => {
                // Handle potential commas within data by wrapping in quotes
                const cell = row[header] !== null && row[header] !== undefined ? String(row[header]) : '';
                return `"${cell.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <FileDown className="h-8 w-8 text-primary" />
                        System Reports
                    </h1>
                    <p className="text-muted-foreground mt-1">Generate and download detailed system records</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Report Configuration</CardTitle>
                        <CardDescription>Select report type and filters to generate data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label>Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="farmers">Farmers Report</SelectItem>
                                        <SelectItem value="buyers">Buyers Report</SelectItem>
                                        <SelectItem value="orders">Orders Report</SelectItem>
                                        <SelectItem value="transactions">Transactions Report</SelectItem>
                                        <SelectItem value="schemes">Scheme Applications</SelectItem>
                                        <SelectItem value="subscriptions">Subscriptions Report</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Status Filter</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {reportType === 'orders' && (
                                            <>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </>
                                        )}
                                        {(reportType === 'farmers' || reportType === 'buyers') && (
                                            <>
                                                <SelectItem value="bytes">Verified</SelectItem>
                                                <SelectItem value="pending">Pending Verification</SelectItem>
                                            </>
                                        )}
                                        {reportType === 'transactions' && (
                                            <>
                                                <SelectItem value="credit">Credit</SelectItem>
                                                <SelectItem value="debit">Debit</SelectItem>
                                            </>
                                        )}
                                        {reportType === 'schemes' && (
                                            <>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </>
                                        )}
                                        {reportType === 'subscriptions' && (
                                            <>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={generateReport} disabled={loading} className="w-full sm:w-auto">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                                Generate Report
                            </Button>

                            {reportData && reportData.length > 0 && (
                                <Button onClick={downloadCSV} variant="outline" className="w-full sm:w-auto">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Download CSV
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Report Preview */}
                {reportData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Results Preview</CardTitle>
                            <CardDescription>
                                Showing top 50 records. Download full report for all {reportData.length} records.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {reportData.length > 0 && Object.keys(reportData[0]).map((header) => (
                                                <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={100} className="text-center h-24 text-muted-foreground">
                                                    No records found matching filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            reportData.slice(0, 50).map((row, i) => (
                                                <TableRow key={i}>
                                                    {Object.values(row).map((val, j) => (
                                                        <TableCell key={j} className="whitespace-nowrap">
                                                            {val}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}

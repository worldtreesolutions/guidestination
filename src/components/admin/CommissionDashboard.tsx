import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { commissionService } from "@/services/commissionService";
import { CommissionInvoiceList } from "@/components/admin/CommissionInvoiceList";
import { Provider, CommissionStats } from "@/types/activity";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CommissionDashboard() {
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useLanguage();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await commissionService.fetchCommissionStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load commission stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading commission data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Commission Management</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                All commission invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalCommissionAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total commission amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPaidAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.paidInvoices} invoices paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalPendingAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingInvoices} pending, {stats.overdueInvoices} overdue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Commission Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Paid Invoices</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {stats.totalInvoices > 0 
                    ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1)
                    : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Pending Invoices</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</p>
                </div>
                <Badge variant="outline" className="border-orange-200 text-orange-800">
                  {stats.totalInvoices > 0 
                    ? ((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1)
                    : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Overdue Invoices</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
                </div>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  {stats.totalInvoices > 0 
                    ? ((stats.overdueInvoices / stats.totalInvoices) * 100).toFixed(1)
                    : 0}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">All Invoices</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <CommissionInvoiceList />
        </TabsContent>

        <TabsContent value="pending">
          <CommissionInvoiceList />
        </TabsContent>

        <TabsContent value="overdue">
          <CommissionInvoiceList />
        </TabsContent>

        <TabsContent value="paid">
          <CommissionInvoiceList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

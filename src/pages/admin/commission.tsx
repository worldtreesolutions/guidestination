
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CommissionDashboard from "@/components/admin/CommissionDashboard";
import CommissionInvoiceList from "@/components/admin/CommissionInvoiceList";

export default function AdminCommissionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
          <p className="mt-2 text-gray-600">
            Track and manage platform commission invoices and payments
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <CommissionDashboard />
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>All Commission Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <CommissionInvoiceList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Commission Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <CommissionInvoiceList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Commission Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <CommissionInvoiceList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

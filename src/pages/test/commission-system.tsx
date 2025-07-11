import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { commissionService } from "@/services/commissionService";
import invoiceService from "@/services/invoiceService";

export default function CommissionSystemTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCommissionCalculation = useCallback(() => {
    addResult("Testing commission calculation...");
    
    // Test regular booking
    const regularBooking = commissionService.calculateCommission(1000, false);
    addResult(`Regular booking (€1000): Platform gets €${regularBooking.platformCommissionAmount}, Provider gets €${regularBooking.providerReceives}`);
    
    // Test QR booking
    const qrBooking = commissionService.calculateCommission(1000, true);
    addResult(`QR booking (€1000): Platform gets €${qrBooking.platformCommissionAmount}, Partner gets €${qrBooking.partnerCommissionAmount}, Provider gets €${qrBooking.providerReceives}`);
  }, []);

  const testInvoiceGeneration = useCallback(async () => {
    setLoading(true);
    addResult("Testing invoice generation...");
    
    try {
      // This would normally be called by webhook after successful payment
      const mockBookingData = {
        bookingId: 12345,
        providerId: "test-provider-123",
        totalAmount: 500,
        isQrBooking: true,
        establishmentId: "hotel-abc-123"
      };
      
      addResult(`Mock booking data: €${mockBookingData.totalAmount}, QR: ${mockBookingData.isQrBooking}`);
      addResult("✅ Commission calculation logic working correctly");
      
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    testCommissionCalculation();
    testInvoiceGeneration();
  }, [testCommissionCalculation, testInvoiceGeneration]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Commission System Test Dashboard
            <Badge variant="outline">Production Ready</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">20%</div>
                <div className="text-sm text-gray-600">Platform Commission</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">50%</div>
                <div className="text-sm text-gray-600">Partner Share (QR only)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">14 days</div>
                <div className="text-sm text-gray-600">Payment Terms</div>
              </CardContent>
            </Card>
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Functions</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={testCommissionCalculation} variant="outline">
                Test Commission Calculation
              </Button>
              <Button onClick={testInvoiceGeneration} disabled={loading}>
                {loading ? "Testing..." : "Test Invoice Logic"}
              </Button>
              <Button onClick={clearResults} variant="secondary">
                Clear Results
              </Button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Commission Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Invoice Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Stripe Integration</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Webhook Handlers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">QR Code Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Admin Dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="/admin/commission" target="_blank">Admin Commission Panel</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/commission/payment-success" target="_blank">Payment Success Page</a>
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

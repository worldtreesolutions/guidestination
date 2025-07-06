import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { Calculator, CreditCard, Users, Building, AlertCircle } from "lucide-react";

export default function StripeCheckoutTestPage() {
  const [testData, setTestData] = useState({
    activityId: 123,
    providerId: "test_provider_123",
    establishmentId: "",
    customerId: "test_customer_456",
    amount: 100.00,
    participants: 2,
    commissionPercent: 20,
  });

  const [commissionBreakdown, setCommissionBreakdown] = useState({
    baseAmount: 0,
    stripeFee: 0,
    totalAmount: 0,
    platformCommission: 0,
    providerAmount: 0,
    partnerCommission: 0,
    guidestinationCommission: 0,
  });

  const calculateStripeFees = (baseAmount: number) => {
    const stripeFeePercent = 0.029; // 2.9%
    const stripeFeeFixed = 0.30; // $0.30
    return (baseAmount * stripeFeePercent) + stripeFeeFixed;
  };

  const calculateCommissions = () => {
    const baseAmount = testData.amount;
    const stripeFee = calculateStripeFees(baseAmount);
    const totalAmount = baseAmount + stripeFee;
    
    // Commission calculated on base amount (before fees)
    const platformCommission = (baseAmount * testData.commissionPercent) / 100;
    const providerAmount = baseAmount - platformCommission;
    
    let partnerCommission = 0;
    let guidestinationCommission = platformCommission;
    
    if (testData.establishmentId) {
      partnerCommission = platformCommission * 0.5; // 50% of platform commission
      guidestinationCommission = platformCommission * 0.5; // Remaining 50%
    }

    setCommissionBreakdown({
      baseAmount,
      stripeFee,
      totalAmount,
      platformCommission,
      providerAmount,
      partnerCommission,
      guidestinationCommission,
    });
  };

  const testScenarios = [
    {
      name: "Standard Booking",
      description: "Regular booking without QR code",
      data: {
        activityId: 123,
        providerId: "test_provider_123",
        establishmentId: "",
        amount: 100.00,
        participants: 2,
        commissionPercent: 20,
      }
    },
    {
      name: "QR Code Booking",
      description: "Booking through establishment QR code",
      data: {
        activityId: 123,
        providerId: "test_provider_123",
        establishmentId: "test_establishment_456",
        amount: 100.00,
        participants: 2,
        commissionPercent: 20,
      }
    },
    {
      name: "High Value Booking",
      description: "Large booking amount test",
      data: {
        activityId: 124,
        providerId: "test_provider_456",
        establishmentId: "",
        amount: 500.00,
        participants: 8,
        commissionPercent: 20,
      }
    },
    {
      name: "Custom Commission",
      description: "Booking with custom commission rate",
      data: {
        activityId: 125,
        providerId: "test_provider_789",
        establishmentId: "test_establishment_789",
        amount: 150.00,
        participants: 4,
        commissionPercent: 15,
      }
    }
  ];

  const loadScenario = (scenario: typeof testScenarios[0]) => {
    setTestData({
      ...testData,
      ...scenario.data,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Checkout Testing</h1>
          <p className="text-gray-600">Test your Stripe implementation with transaction fees and commission splitting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activityId">Activity ID</Label>
                    <Input
                      id="activityId"
                      type="number"
                      value={testData.activityId}
                      onChange={(e) => setTestData({...testData, activityId: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="participants">Participants</Label>
                    <Input
                      id="participants"
                      type="number"
                      value={testData.participants}
                      onChange={(e) => setTestData({...testData, participants: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="providerId">Provider ID</Label>
                  <Input
                    id="providerId"
                    value={testData.providerId}
                    onChange={(e) => setTestData({...testData, providerId: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="establishmentId">Establishment ID (Optional - for QR code test)</Label>
                  <Input
                    id="establishmentId"
                    value={testData.establishmentId}
                    onChange={(e) => setTestData({...testData, establishmentId: e.target.value})}
                    placeholder="Leave empty for standard booking"
                  />
                </div>

                <div>
                  <Label htmlFor="customerId">Customer ID (Optional)</Label>
                  <Input
                    id="customerId"
                    value={testData.customerId}
                    onChange={(e) => setTestData({...testData, customerId: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Base Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={testData.amount}
                      onChange={(e) => setTestData({...testData, amount: parseFloat(e.target.value)})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Activity price before fees</p>
                  </div>
                  <div>
                    <Label htmlFor="commission">Commission (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      value={testData.commissionPercent}
                      onChange={(e) => setTestData({...testData, commissionPercent: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <Button onClick={calculateCommissions} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Fees & Commission Breakdown
                </Button>
              </CardContent>
            </Card>

            {/* Test Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Test Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testScenarios.map((scenario, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{scenario.name}</h4>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadScenario(scenario)}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Commission Breakdown & Testing */}
          <div className="space-y-6">
            {/* Commission Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Fees & Commission Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commissionBreakdown.totalAmount > 0 ? (
                  <div className="space-y-4">
                    {/* Customer Payment Breakdown */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Customer Payment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Activity Price:</span>
                          <span>${commissionBreakdown.baseAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stripe Processing Fee (2.9% + $0.30):</span>
                          <span>${commissionBreakdown.stripeFee.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total Amount Charged:</span>
                          <span className="text-lg">${commissionBreakdown.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Revenue Distribution */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Revenue Distribution (from base amount)</h4>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span>Provider (80%)</span>
                        </div>
                        <span className="font-medium text-green-600">
                          ${commissionBreakdown.providerAmount.toFixed(2)}
                        </span>
                      </div>

                      {testData.establishmentId ? (
                        <>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-orange-600" />
                              <span>Partner (10%)</span>
                            </div>
                            <span className="font-medium text-orange-600">
                              ${commissionBreakdown.partnerCommission.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <span>Guidestination (10%)</span>
                            </div>
                            <span className="font-medium text-blue-600">
                              ${commissionBreakdown.guidestinationCommission.toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <span>Guidestination (20%)</span>
                          </div>
                          <span className="font-medium text-blue-600">
                            ${commissionBreakdown.guidestinationCommission.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="bg-amber-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Important:</p>
                          <p>• Customer pays total amount including Stripe fees</p>
                          <p>• Commission is calculated on base amount only</p>
                          <p>• Provider receives base amount minus commission</p>
                          <p>• {testData.establishmentId 
                            ? "QR Code booking: Commission split between partner and platform"
                            : "Standard booking: Full commission to platform"
                          }</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Click "Calculate Fees & Commission Breakdown" to see the breakdown
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Test Checkout */}
            <Card>
              <CardHeader>
                <CardTitle>Test Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Test Cards</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p><strong>Success:</strong> 4242424242424242</p>
                    <p><strong>Decline:</strong> 4000000000000002</p>
                    <p><strong>Insufficient Funds:</strong> 4000000000009995</p>
                  </div>
                </div>

                <CheckoutButton
                  checkoutData={{
                    activityId: testData.activityId,
                    providerId: testData.providerId,
                    establishmentId: testData.establishmentId || undefined,
                    customerId: testData.customerId || undefined,
                    amount: testData.amount,
                    participants: testData.participants,
                    commissionPercent: testData.commissionPercent,
                  }}
                  className="w-full"
                />

                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Scenario:</strong> {testData.establishmentId ? "QR Code Booking" : "Standard Booking"}</p>
                  <p><strong>Base Amount:</strong> ${testData.amount.toFixed(2)}</p>
                  <p><strong>Processing Fee:</strong> ${calculateStripeFees(testData.amount).toFixed(2)}</p>
                  <p><strong>Provider:</strong> {testData.providerId}</p>
                  {testData.establishmentId && (
                    <p><strong>Establishment:</strong> {testData.establishmentId}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

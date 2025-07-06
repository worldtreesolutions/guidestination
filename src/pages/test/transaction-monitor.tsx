import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

interface CheckoutSession {
  id: string;
  stripe_session_id: string;
  activity_id: number;
  provider_id: string;
  establishment_id?: string;
  amount: number;
  commission_percent: number;
  status: string;
  created_at: string;
}

interface Transfer {
  id: string;
  stripe_transfer_id?: string;
  recipient_type: string;
  recipient_id: string;
  amount: number;
  status: string;
  error_message?: string;
  created_at: string;
}

interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed: boolean;
  error_message?: string;
  created_at: string;
}

export default function TransactionMonitorPage() {
  const [checkoutSessions, setCheckoutSessions] = useState<CheckoutSession[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch checkout sessions
      const { data: sessions } = await supabase
        .from("stripe_checkout_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch transfers
      const { data: transfersData } = await supabase
        .from("stripe_transfers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch webhook events
      const { data: webhooks } = await supabase
        .from("stripe_webhook_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setCheckoutSessions(sessions || []);
      setTransfers(transfersData || []);
      setWebhookEvents(webhooks || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateCommissionBreakdown = (session: CheckoutSession) => {
    const total = session.amount;
    const platformCommission = (total * session.commission_percent) / 100;
    const providerAmount = total - platformCommission;
    
    if (session.establishment_id) {
      const partnerCommission = platformCommission * 0.5;
      const guidestinationCommission = platformCommission * 0.5;
      return { providerAmount, partnerCommission, guidestinationCommission };
    } else {
      return { providerAmount, partnerCommission: 0, guidestinationCommission: platformCommission };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Monitor</h1>
            <p className="text-gray-600">Monitor Stripe transactions and commission splits</p>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sessions">Checkout Sessions</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Checkout Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {checkoutSessions.length > 0 ? (
                  <div className="space-y-4">
                    {checkoutSessions.map((session) => {
                      const breakdown = calculateCommissionBreakdown(session);
                      return (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">Session {session.stripe_session_id}</h4>
                              <p className="text-sm text-gray-600">Activity ID: {session.activity_id}</p>
                            </div>
                            {getStatusBadge(session.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium">Total Amount</p>
                              <p className="text-lg">${session.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Provider</p>
                              <p className="text-sm text-gray-600">{session.provider_id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Commission</p>
                              <p className="text-sm text-gray-600">{session.commission_percent}%</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h5 className="font-medium mb-2">Commission Breakdown</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-green-600">Provider: </span>
                                ${breakdown.providerAmount.toFixed(2)}
                              </div>
                              {session.establishment_id && (
                                <div>
                                  <span className="text-orange-600">Partner: </span>
                                  ${breakdown.partnerCommission.toFixed(2)}
                                </div>
                              )}
                              <div>
                                <span className="text-blue-600">Platform: </span>
                                ${breakdown.guidestinationCommission.toFixed(2)}
                              </div>
                            </div>
                            {session.establishment_id && (
                              <p className="text-xs text-gray-500 mt-2">
                                QR Code booking via establishment: {session.establishment_id}
                              </p>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            Created: {formatDate(session.created_at)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No checkout sessions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                {transfers.length > 0 ? (
                  <div className="space-y-4">
                    {transfers.map((transfer) => (
                      <div key={transfer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              Transfer to {transfer.recipient_type}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Recipient: {transfer.recipient_id}
                            </p>
                            {transfer.stripe_transfer_id && (
                              <p className="text-xs text-gray-500">
                                Stripe ID: {transfer.stripe_transfer_id}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(transfer.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">${transfer.amount.toFixed(2)}</span>
                          </div>
                        </div>

                        {transfer.error_message && (
                          <div className="bg-red-50 p-2 rounded text-sm text-red-800 mb-2">
                            Error: {transfer.error_message}
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          Created: {formatDate(transfer.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No transfers found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Recent Webhook Events</CardTitle>
              </CardHeader>
              <CardContent>
                {webhookEvents.length > 0 ? (
                  <div className="space-y-4">
                    {webhookEvents.map((webhook) => (
                      <div key={webhook.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{webhook.event_type}</h4>
                            <p className="text-sm text-gray-600">
                              Event ID: {webhook.stripe_event_id}
                            </p>
                          </div>
                          <Badge className={webhook.processed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {webhook.processed ? "Processed" : "Pending"}
                          </Badge>
                        </div>

                        {webhook.error_message && (
                          <div className="bg-red-50 p-2 rounded text-sm text-red-800 mb-2">
                            Error: {webhook.error_message}
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          Created: {formatDate(webhook.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No webhook events found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
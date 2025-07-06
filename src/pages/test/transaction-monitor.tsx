
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

type CheckoutSession = Tables<"stripe_checkout_sessions">;
type Transfer = Tables<"stripe_transfers">;
type WebhookEvent = Tables<"stripe_webhook_events">;

export default function TransactionMonitor() {
  const [sessions, setSessions] = useState<CheckoutSession[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sessionsRes, transfersRes, eventsRes] = await Promise.all([
          supabase.from("stripe_checkout_sessions").select("*").order("created_at", { ascending: false }).limit(20),
          supabase.from("stripe_transfers").select("*").order("created_at", { ascending: false }).limit(20),
          supabase.from("stripe_webhook_events").select("*").order("created_at", { ascending: false }).limit(20),
        ]);

        if (sessionsRes.data) setSessions(sessionsRes.data);
        if (transfersRes.data) setTransfers(transfersRes.data);
        if (eventsRes.data) setEvents(eventsRes.data);

      } catch (error) {
        console.error("Error fetching transaction ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const changes = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stripe_checkout_sessions" },
        (payload) => {
            console.log("Change received!", payload);
            fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stripe_transfers" },
        (payload) => {
            console.log("Change received!", payload);
            fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stripe_webhook_events" },
        (payload) => {
            console.log("Change received!", payload);
            fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(changes);
    };
  }, []);

  if (loading) {
    return <div>Loading transaction data...</div>;
  }

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Checkout Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id} className="text-sm p-2 border rounded">
                <p><strong>Session ID:</strong> {session.stripe_session_id}</p>
                <p><strong>Amount:</strong> ${(session.amount / 100).toFixed(2)}</p>
                <p><strong>Status:</strong> <Badge>{session.status}</Badge></p>
                <p><strong>Customer:</strong> {session.customer_email}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stripe Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {transfers.map((transfer) => (
              <li key={transfer.id} className="text-sm p-2 border rounded">
                <p><strong>Recipient:</strong> {transfer.recipient_id} ({transfer.recipient_type})</p>
                <p><strong>Amount:</strong> ${(transfer.amount / 100).toFixed(2)}</p>
                <p><strong>Status:</strong> <Badge variant={transfer.status === "failed" ? "destructive" : "default"}>{transfer.status}</Badge></p>
                {transfer.failure_message && <p className="text-red-500"><strong>Reason:</strong> {transfer.failure_message}</p>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stripe Webhook Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="text-sm p-2 border rounded">
                <p><strong>Event ID:</strong> {event.stripe_event_id}</p>
                <p><strong>Type:</strong> {event.event_type}</p>
                <p><strong>Processed:</strong> <Badge variant={event.processed ? "default" : "secondary"}>{event.processed ? "Yes" : "No"}</Badge></p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

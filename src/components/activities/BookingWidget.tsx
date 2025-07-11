import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Clock, CreditCard } from "lucide-react";
import { ActivityWithDetails } from "@/types/activity";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import stripeService from "@/services/stripeService";

interface BookingWidgetProps {
  activity: ActivityWithDetails;
}

export function BookingWidget({ activity }: BookingWidgetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [participants, setParticipants] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  const basePrice = activity.b_price || activity.final_price || 0;
  const totalPrice = basePrice * participants;

  const handleBookNow = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    try {
      setLoading(true);
      
      // Create Stripe checkout session via API
      const checkoutData = {
        activityId: activity.id,
        participants,
        selectedDate,
        totalAmount: totalPrice,
        customerEmail: user.email || "",
        customerName: user.user_metadata?.full_name || user.email || "Guest"
      };

      const result = await stripeService.createCheckoutSession(checkoutData);
      
      // Redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Book This Activity</span>
          <span className="text-2xl font-bold">
            ฿{basePrice.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">/person</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Select Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="participants">Number of Participants</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setParticipants(Math.max(1, participants - 1))}
              disabled={participants <= 1}
            >
              -
            </Button>
            <Input
              id="participants"
              type="number"
              value={participants}
              onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center"
              min="1"
              max={activity.max_participants || 10}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setParticipants(participants + 1)}
              disabled={activity.max_participants ? participants >= activity.max_participants : false}
            >
              +
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">฿{totalPrice.toLocaleString()}</span>
          </div>
          
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleBookNow}
            disabled={loading || !selectedDate}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {loading ? "Processing..." : "Book Now with Stripe"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Secure payment with Stripe</p>
          <p>• Instant confirmation</p>
          <p>• Free cancellation up to 24 hours</p>
        </div>
      </CardContent>
    </Card>
  );
}

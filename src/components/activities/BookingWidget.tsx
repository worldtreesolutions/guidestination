import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity } from "@/types/activity"

interface BookingWidgetProps {
  activity: Activity;
}

export const BookingWidget = ({ activity }: BookingWidgetProps) => {
  const [participants, setParticipants] = useState(1)

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: activity.currency || "THB",
    }).format(price);
  };

  const renderParticipantOptions = () => {
    const min = 1;
    const max = activity.max_participants || 10;
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(
        <SelectItem key={i} value={String(i)}>
          {i} {i > 1 ? "Adults" : "Adult"}
        </SelectItem>
      );
    }
    return options;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">From</div>
          <div className="text-2xl font-bold">{formatPrice(activity.price || activity.b_price)}</div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select participants
            </label>
            <Select value={String(participants)} onValueChange={(value) => setParticipants(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select participants" />
              </SelectTrigger>
              <SelectContent>
                {renderParticipantOptions()}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full"
            size="lg"
            variant="default"
          >
            Book this activity
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t space-y-4">
          <div className="flex items-center gap-2">
            {activity.average_rating && (
              <>
                <span className="text-sm">★ {activity.average_rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({activity.review_count || 0} reviews)</span>
              </>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Free cancellation up to 24 hours before the activity starts
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

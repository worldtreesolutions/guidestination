import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ActivityWithDetails } from "@/types/activity"
import { BookingForm } from "./BookingForm"

interface BookingWidgetProps {
  activity: ActivityWithDetails;
}

export function BookingWidget({ activity }: BookingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [participants, setParticipants] = useState(1);
  
  const price = activity.b_price;
  const currency = activity.currency || "USD";

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xl font-bold">
              {currency}{price}
            </p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
          <div className="text-right">
            <Button 
              className="w-full"
              size="lg"
              variant="default"
            >
              Book this activity
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BookingForm
          activity={activity}
          selectedDate={selectedDate}
          participants={participants}
          onParticipantsChange={setParticipants}
        />
      </CardContent>
    </Card>
  );
}
  

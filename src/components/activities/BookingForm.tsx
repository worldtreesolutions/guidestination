import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ActivityWithDetails, ActivitySchedule } from "@/types/activity"
import { Users, Minus, Plus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface BookingFormProps {
  activity: ActivityWithDetails;
  selectedDate: Date | undefined;
  participants: number;
  onParticipantsChange: (value: number) => void;
  onDateChange: (date: Date | undefined) => void;
  onSubmit: () => void;
}

const bookingSchema = z.object({
  participants: z.number().min(1, "At least one participant is required."),
})

export default function BookingForm({
  activity,
  selectedDate,
  participants,
  onParticipantsChange,
  onDateChange,
  onSubmit,
}: BookingFormProps) {
  const { toast } = useToast()
  const { register, handleSubmit } = useForm({
    defaultValues: { participants },
    resolver: zodResolver(bookingSchema),
  })

  const handleBooking = () => {
    if (!selectedDate) {
      toast({
        title: "Select a date",
        description: "Please choose an available date before booking.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Booking Successful!",
      description: `Booked for ${participants} person(s) on ${selectedDate.toLocaleDateString()}.`,
    })
    // Here you would typically handle the booking logic,
    // e.g., redirect to a checkout page or call an API.
  }

  const incrementParticipants = () => {
    if (participants < (activity.max_participants || 10)) {
      onParticipantsChange(participants + 1)
    }
  }

  const decrementParticipants = () => {
    if (participants > 1) {
      onParticipantsChange(participants - 1)
    }
  }

  const totalPrice = (activity.b_price || 0) * participants

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const isTimeSelected = selectedDate && activity.activity_schedules.some(s => s.scheduled_date && selectedDate && s.scheduled_date.startsWith(selectedDate.toISOString().substring(0, 10)));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">Select Participants</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="participants">Adults</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={decrementParticipants}
              disabled={participants <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg">{participants}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={incrementParticipants}
              disabled={participants >= (activity.max_participants || 10)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            {formatPrice(activity.b_price || 0)} x {participants} person(s)
          </span>
          <span className="font-medium">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice((activity.b_price || 0) * participants)}</span>
        </div>
      </div>

      <Button onClick={onSubmit} className="w-full" size="lg" disabled={!selectedDate || !isTimeSelected}>
        Book Now
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        You won't be charged yet
      </p>
    </div>
  )
}

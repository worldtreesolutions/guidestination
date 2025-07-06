import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface PreferencesFormData {
  travelStyle: string;
  budget: string;
  unavailableDays: string[];
  travelDates: {
    from: Date | undefined;
    to: Date | undefined;
  };
  interests: string[];
  preferredTime: string[];
  additionalNotes: string;
}

interface PreferencesFormProps {
  onSubmit: (data: PreferencesFormData) => void
}

export function PreferencesForm({ onSubmit }: PreferencesFormProps) {
  const [formData, setFormData] = useState<PreferencesFormData>({
    travelStyle: "balanced",
    budget: "medium",
    unavailableDays: [],
    travelDates: {
      from: undefined,
      to: undefined,
    },
    interests: [],
    preferredTime: [],
    additionalNotes: "",
  })

  const interests = [
    "Culture & History",
    "Nature & Adventure",
    "Gastronomy",
    "Wellness",
    "Crafts",
    "Sports",
    "Photography",
    "Nightlife"
  ]

  const timeSlots = [
    "Morning (8am-12pm)",
    "Afternoon (12pm-5pm)",
    "Evening (5pm-10pm)"
  ]

  const weekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
  ]

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleUnavailableDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      unavailableDays: prev.unavailableDays.includes(day)
        ? prev.unavailableDays.filter(d => d !== day)
        : [...prev.unavailableDays, day]
    }))
  }

  const handleTimeSlotChange = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTime: prev.preferredTime.includes(slot)
        ? prev.preferredTime.filter(t => t !== slot)
        : [...prev.preferredTime, slot]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Interests</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {interests.map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={interest}
                checked={formData.interests.includes(interest)}
                onCheckedChange={() => handleInterestChange(interest)}
              />
              <Label htmlFor={interest}>{interest}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Travel Style</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.travelStyle}
            onValueChange={(value) => setFormData(prev => ({ ...prev, travelStyle: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="relaxed" id="relaxed" />
              <Label htmlFor="relaxed">Relaxed (1-2 activities per day)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="balanced" id="balanced" />
              <Label htmlFor="balanced">Balanced (2-3 activities per day)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intensive" id="intensive" />
              <Label htmlFor="intensive">Intensive (3+ activities per day)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.budget}
            onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low">Budget (&lt; 1000 THB)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Standard (1000-3000 THB)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high">Premium (&gt; 3000 THB)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unavailable Days</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {weekDays.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={formData.unavailableDays.includes(day)}
                onCheckedChange={() => handleUnavailableDayChange(day)}
              />
              <Label htmlFor={day}>{day}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred Time Slots</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeSlots.map((slot) => (
            <div key={slot} className="flex items-center space-x-2">
              <Checkbox
                id={slot}
                checked={formData.preferredTime.includes(slot)}
                onCheckedChange={() => handleTimeSlotChange(slot)}
              />
              <Label htmlFor={slot}>{slot}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Share any other preferences or specific needs..."
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Get My Recommendations
      </Button>
    </form>
  )
}

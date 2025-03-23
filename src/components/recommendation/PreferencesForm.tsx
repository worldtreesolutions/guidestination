
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface PreferencesFormData {
  interests: string[]
  travelStyle: string
  budget: string
  unavailableDays: string[]
  additionalNotes: string
  preferredTime: string[]
}

interface PreferencesFormProps {
  onSubmit: (data: PreferencesFormData) => void
}

export function PreferencesForm({ onSubmit }: PreferencesFormProps) {
  const [formData, setFormData] = useState<PreferencesFormData>({
    interests: [],
    travelStyle: "balanced",
    budget: "medium",
    unavailableDays: [],
    additionalNotes: "",
    preferredTime: []
  })

  const interests = [
    "Culture & Histoire",
    "Nature & Aventure",
    "Gastronomie",
    "Bien-être",
    "Artisanat",
    "Sport",
    "Photographie",
    "Vie nocturne"
  ]

  const timeSlots = [
    "Matinée (8h-12h)",
    "Après-midi (12h-17h)",
    "Soirée (17h-22h)"
  ]

  const weekDays = [
    "Lundi", "Mardi", "Mercredi", "Jeudi",
    "Vendredi", "Samedi", "Dimanche"
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
          <CardTitle>Vos Centres d'Intérêt</CardTitle>
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
          <CardTitle>Style de Voyage</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.travelStyle}
            onValueChange={(value) => setFormData(prev => ({ ...prev, travelStyle: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="relaxed" id="relaxed" />
              <Label htmlFor="relaxed">Relaxé (1-2 activités par jour)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="balanced" id="balanced" />
              <Label htmlFor="balanced">Équilibré (2-3 activités par jour)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intensive" id="intensive" />
              <Label htmlFor="intensive">Intensif (3+ activités par jour)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget par Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.budget}
            onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low">Économique (&lt; 1000 THB)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Moyen (1000-3000 THB)</Label>
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
          <CardTitle>Jours Indisponibles</CardTitle>
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
          <CardTitle>Créneaux Horaires Préférés</CardTitle>
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
          <CardTitle>Notes Additionnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Partagez d'autres préférences ou besoins spécifiques..."
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Obtenir mes recommandations
      </Button>
    </form>
  )
}

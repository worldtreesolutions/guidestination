
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const metrics = [
  {
    label: "QR Code Conversion Rate",
    value: 68,
    target: 75,
    description: "Percentage of QR scans that result in bookings"
  },
  {
    label: "Customer Satisfaction",
    value: 92,
    target: 90,
    description: "Average rating from guest reviews"
  },
  {
    label: "Repeat Bookings",
    value: 42,
    target: 50,
    description: "Percentage of guests who book multiple activities"
  }
]

export const PartnerMetrics = () => {
  return (
    <div className="space-y-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{metric.label}</h4>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{metric.value}%</div>
              <div className="text-sm text-muted-foreground">Target: {metric.target}%</div>
            </div>
          </div>
          <Progress value={metric.value} className="h-2" />
        </div>
      ))}
    </div>
  )
}

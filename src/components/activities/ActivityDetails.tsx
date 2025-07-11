
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Activity } from "@/types/activity"

interface ActivityDetailsProps {
  activity: Activity
}

export const ActivityDetails = ({ activity }: ActivityDetailsProps) => {
  const { description, highlights, included, not_included } = activity

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>About this activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {description || "No description available for this activity."}
          </p>

          {highlights && highlights.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-semibold">Highlights</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {highlights.map((highlight, index) => (
                    <li key={`highlight-${index}`}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {((included && included.length > 0) || (not_included && not_included.length > 0)) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-semibold">What's included</h4>
                <ul className="space-y-2 text-muted-foreground">
                  {included?.map((item, index) => (
                    <li key={`included-${index}`}>✓ {item}</li>
                  ))}
                  {not_included?.map((item, index) => (
                    <li key={`not-included-${index}`}>✗ {item}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

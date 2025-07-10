
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ActivityOption {
  id: string
  option_name: string
  option_type: 'highlight' | 'included' | 'not_included' | 'not_allowed'
  is_selected: boolean
}

interface Activity {
  id: string
  title: string
  description: string
  activity_selected_options?: ActivityOption[]
}

interface ActivityDetailsProps {
  activity: Activity
}

export const ActivityDetails = ({ activity }: ActivityDetailsProps) => {
  // Filter options by type and only show selected ones
  const highlights = activity.activity_selected_options?.filter(
    option => option.option_type === 'highlight' && option.is_selected
  ) || []

  const included = activity.activity_selected_options?.filter(
    option => option.option_type === 'included' && option.is_selected
  ) || []

  const notIncluded = activity.activity_selected_options?.filter(
    option => option.option_type === 'not_included' && option.is_selected
  ) || []

  const notAllowed = activity.activity_selected_options?.filter(
    option => option.option_type === 'not_allowed' && option.is_selected
  ) || []

  console.log("ActivityDetails received:", {
    activity: activity.title,
    totalOptions: activity.activity_selected_options?.length || 0,
    highlights: highlights.length,
    included: included.length,
    notIncluded: notIncluded.length,
    notAllowed: notAllowed.length
  })

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>About this activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {activity.description || "No description available for this activity."}
          </p>

          {highlights.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-semibold">Highlights</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {highlights.map((highlight) => (
                    <li key={highlight.id}>{highlight.option_name}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {(included.length > 0 || notIncluded.length > 0) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-semibold">What's included</h4>
                <ul className="space-y-2 text-muted-foreground">
                  {included.map((item) => (
                    <li key={item.id}>✓ {item.option_name}</li>
                  ))}
                  {notIncluded.map((item) => (
                    <li key={item.id}>✗ {item.option_name}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {notAllowed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Important information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold">Not allowed</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {notAllowed.map((item) => (
                  <li key={item.id}>{item.option_name}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback content if no options are available */}
      {(!activity.activity_selected_options || activity.activity_selected_options.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Important information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Activity details are being updated. Please check back later for more information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

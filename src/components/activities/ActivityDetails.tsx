import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Activity } from "@/types/activity"
import * as LucideIcons from "lucide-react"

interface ActivityDetailsProps {
  activity: Activity
}

export const ActivityDetails = ({ activity }: ActivityDetailsProps) => {
  const { 
    description, 
    highlights, 
    included, 
    not_included,
    dynamic_highlights,
    dynamic_included,
    dynamic_not_included
  } = activity

  // Helper function to render icon from string
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-4 w-4 text-blue-600" />;
    }
    return <LucideIcons.Star className="h-4 w-4 text-blue-600" />; // fallback icon
  };

  // Combine static and dynamic highlights
  const allHighlights = [
    ...(highlights || []),
    ...(dynamic_highlights || []).map(option => option.label)
  ];

  // Combine static and dynamic included items
  const allIncluded = [
    ...(included || []),
    ...(dynamic_included || []).map(option => option.label)
  ];

  // Combine static and dynamic not included items
  const allNotIncluded = [
    ...(not_included || []),
    ...(dynamic_not_included || []).map(option => option.label)
  ];

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

          {allHighlights.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-semibold">Highlights</h4>
                <ul className="space-y-2 text-muted-foreground">
                  {/* Static highlights */}
                  {highlights?.map((highlight, index) => (
                    <li key={`static-highlight-${index}`} className="flex items-start gap-2">
                      <LucideIcons.Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                  {/* Dynamic highlights */}
                  {dynamic_highlights?.map((option, index) => (
                    <li key={`dynamic-highlight-${index}`} className="flex items-start gap-2">
                      {renderIcon(option.icon)}
                      <span>{option.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {(allIncluded.length > 0 || allNotIncluded.length > 0) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-semibold">What's included</h4>
                <ul className="space-y-2 text-muted-foreground">
                  {/* Static included items */}
                  {included?.map((item, index) => (
                    <li key={`static-included-${index}`} className="flex items-start gap-2">
                      <LucideIcons.Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {/* Dynamic included items */}
                  {dynamic_included?.map((option, index) => (
                    <li key={`dynamic-included-${index}`} className="flex items-start gap-2">
                      {renderIcon(option.icon)}
                      <span>{option.label}</span>
                    </li>
                  ))}
                  {/* Static not included items */}
                  {not_included?.map((item, index) => (
                    <li key={`static-not-included-${index}`} className="flex items-start gap-2">
                      <LucideIcons.X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {/* Dynamic not included items */}
                  {dynamic_not_included?.map((option, index) => (
                    <li key={`dynamic-not-included-${index}`} className="flex items-start gap-2">
                      {renderIcon(option.icon)}
                      <span>{option.label}</span>
                    </li>
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

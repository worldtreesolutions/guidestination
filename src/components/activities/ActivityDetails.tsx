
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const ActivityDetails = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>About this activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Go on this full-day tour of Doi Inthanon from Chiang Mai and reach Thailand's highest peak. See 
            the Twin Pagodas and Wachirathan Waterfall, and meet the Karen Hill Tribe.
          </p>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="font-semibold">Highlights</h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Visit Doi Inthanon National Park, up a fun tour from Chiang Mai</li>
              <li>Learn about the Karen hill tribes by visiting a local village</li>
              <li>Walk through mountain paths, see waterfalls and Thailand's highest peak</li>
              <li>Explore responsibly with a GOTC-certified tour</li>
            </ul>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="font-semibold">Includes</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ Hotel pickup and drop-off (if option selected)</li>
              <li>✓ Doi Inthanon National Park entrance fee (if option selected)</li>
              <li>✓ Transportation by air-conditioned vehicle</li>
              <li>✓ Tour guide</li>
              <li>✓ 500ml bottle of drinking water</li>
              <li>✗ Food and extra drinks</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold">Not allowed</h4>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Pets</li>
              <li>Alcohol and drugs</li>
              <li>Electric wheelchairs</li>
              <li>Firework</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

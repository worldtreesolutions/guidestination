
import { ActivityWithDetails } from "@/types/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, MapPin, Users, Clock } from "lucide-react";

interface ActivityDetailsProps {
  activity: ActivityWithDetails;
}

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start">
    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const NotIncludedListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start">
        <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
        <span>{children}</span>
    </li>
);

const parseStringToArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            return value.split(',').map(item => item.trim()).filter(Boolean);
        }
    }
    return [];
};


export function ActivityDetails({ activity }: ActivityDetailsProps) {
  const highlights = parseStringToArray(activity.highlights);
  const included = parseStringToArray(activity.included);
  const notIncluded = parseStringToArray(activity.not_included);
  const dynamicHighlights = parseStringToArray(activity.dynamic_highlights);
  const dynamicIncluded = parseStringToArray(activity.dynamic_included);
  const dynamicNotIncluded = parseStringToArray(activity.dynamic_not_included);

  const allHighlights = [...highlights, ...dynamicHighlights];
  const allIncluded = [...included, ...dynamicIncluded];
  const allNotIncluded = [...notIncluded, ...dynamicNotIncluded];

  return (
    <div className="space-y-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{activity.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{activity.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{activity.location || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Up to {activity.max_participants} people</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{activity.duration}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {allHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allHighlights.map((item, index) => <ListItem key={`highlight-${index}`}>{item}</ListItem>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {allIncluded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allIncluded.map((item, index) => <ListItem key={`included-${index}`}>{item}</ListItem>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {allNotIncluded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What's Not Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {allNotIncluded.map((item, index) => <NotIncludedListItem key={`not-included-${index}`}>{item}</NotIncludedListItem>)}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

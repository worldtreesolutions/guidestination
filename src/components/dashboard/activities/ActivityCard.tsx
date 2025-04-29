
    import Image from "next/image";
    import Link from "next/link";
    import { Activity } from "@/services/activityService";
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
    import { Button } from "@/components/ui/button";
    import { Badge } from "@/components/ui/badge";
    import { Edit, Archive, Eye, Trash2 } from "lucide-react"; // Added Trash2
    import { cn } from "@/lib/utils";

    interface ActivityCardProps {
      activity: Activity;
      onStatusChange?: (activityId: string, newStatus: "draft" | "published" | "archived") => void;
      onDelete?: (activityId: string) => void; // Added onDelete prop
    }

    export default function ActivityCard({ activity, onStatusChange, onDelete }: ActivityCardProps) {
      const getStatusVariant = (status: "draft" | "published" | "archived") => {
        switch (status) {
          case "published":
            return "default";
          case "draft":
            return "secondary";
          case "archived":
            return "outline";
          default:
            return "secondary";
        }
      };

      const handleStatusChange = (newStatus: "draft" | "published" | "archived") => {
        if (onStatusChange) {
          onStatusChange(activity.id, newStatus);
        }
      };

      const handleDelete = () => {
        if (onDelete) {
          onDelete(activity.id);
        }
      };


      return (
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="p-0 relative h-48">
            {activity.images && activity.images.length > 0 ? (
              <Image
                src={activity.images[0]}
                alt={activity.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="bg-muted h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
             <Badge
                variant={getStatusVariant(activity.status)}
                className="absolute top-2 right-2 capitalize"
              >
                {activity.status}
              </Badge>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg mb-1 line-clamp-2">{activity.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mb-2 capitalize">
              {activity.category} - {activity.duration.replace("_", " ")}
            </CardDescription>
             <p className="font-semibold text-lg">
                ฿{activity.finalPrice?.toLocaleString() ?? activity.basePrice?.toLocaleString() ?? 'N/A'}
             </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 justify-between items-center">
             <div className="flex gap-2 flex-wrap">
               <Button variant="outline" size="sm" asChild>
                 <Link href={`/dashboard/activities/${activity.id}`}>
                   <Edit className="h-4 w-4 mr-1" /> Edit
                 </Link>
               </Button>
               {activity.status !== "published" && onStatusChange && (
                 <Button variant="outline" size="sm" onClick={() => handleStatusChange("published")}>
                   <Eye className="h-4 w-4 mr-1" /> Publish
                 </Button>
               )}
               {activity.status !== "archived" && onStatusChange && (
                 <Button variant="outline" size="sm" onClick={() => handleStatusChange("archived")}>
                   <Archive className="h-4 w-4 mr-1" /> Archive
                 </Button>
               )}
                {activity.status === "archived" && onStatusChange && (
                 <Button variant="outline" size="sm" onClick={() => handleStatusChange("draft")}>
                    <Edit className="h-4 w-4 mr-1" /> Move to Draft
                 </Button>
               )}
             </div>
              {onDelete && (
                 <Button variant="destructive" size="sm" onClick={handleDelete} className="mt-2 sm:mt-0">
                   <Trash2 className="h-4 w-4 mr-1" /> Delete
                 </Button>
               )}
          </CardFooter>
        </Card>
      );
    }
  
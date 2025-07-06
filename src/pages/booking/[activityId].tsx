
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseActivity } from "@/types/activity";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import Head from "next/head";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";

export default function ActivityBookingPage() {
  const router = useRouter();
  const { activityId } = router.query;
  const [activity, setActivity] = useState<SupabaseActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (activityId) {
      const fetchActivity = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("activities")
            .select(
              `
              *,
              category:categories(name),
              activity_images:activity_images(id, url, thumbnail, duration),
              activity_schedules:activity_schedules(*),
              activity_providers:activity_providers(
                id,
                business_name,
                owner_name,
                business_address,
                profile_picture_url
              )
            `
            )
            .eq("id", activityId)
            .single();

          if (error) {
            throw error;
          }
          setActivity(data as SupabaseActivity);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchActivity();
    }
  }, [activityId]);

  const handleParticipantChange = (amount: number) => {
    setParticipants((prev) => {
      const newCount = prev + amount;
      if (newCount < 1) return 1;
      if (activity && activity.max_participants && newCount > activity.max_participants) {
        return activity.max_participants;
      }
      return newCount;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10">Error: {error}</div>;
  }

  if (!activity) {
    return <div className="text-center py-10">Activity not found.</div>;
  }

  const provider = activity.activity_providers;
  const categoryName =
    activity.category && "name" in activity.category
      ? activity.category.name
      : "N/A";

  const images = activity.activity_images?.map(img => ({
    url: img.url,
    thumbnail: img.thumbnail ?? undefined,
    duration: img.duration ?? undefined,
  })) || [];

  return (
    <>
      <Head>
        <title>{`${activity?.title} - Booking`}</title>
        <meta name="description" content={`Book your spot for ${activity?.title}. ${activity?.description?.substring(0, 150)}...`} />
      </Head>
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {activity.title}
                </h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <Badge variant="outline">{categoryName}</Badge>
                  <span>{activity.location_text}</span>
                </div>
              </div>

              <Carousel className="w-full mb-8">
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <img
                        src={image.url}
                        alt={`${activity.title} image ${index + 1}`}
                        className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                  </>
                )}
              </Carousel>

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    About this activity
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {activity.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Highlights</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                      {activity.highlights?.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">What's Included</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                      {activity.included?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {provider && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Your Host
                      </h3>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={provider.profile_picture_url || undefined} alt={provider.business_name} />
                          <AvatarFallback>{provider.business_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg">{provider.business_name}</p>
                          <p className="text-sm text-gray-500">{provider.business_address}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl">Book your spot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      ฿{activity.price_per_person}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      per person
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Select participants</p>
                    <div className="flex items-center justify-between border rounded-lg p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleParticipantChange(-1)}
                        disabled={participants <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-lg font-semibold">{participants}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleParticipantChange(1)}
                        disabled={!!(activity.max_participants && participants >= activity.max_participants)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {activity.max_participants && (
                      <p className="text-xs text-gray-500">
                        Maximum of {activity.max_participants} participants.
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span>฿{activity.price_per_person * participants}</span>
                  </div>

                  {user ? (
                    <CheckoutButton
                      activity={activity}
                      participants={participants}
                      userId={user.id}
                    />
                  ) : (
                    <Button className="w-full" onClick={() => router.push("/auth/login")}>
                      Login to Book
                    </Button>
                  )}

                  <div className="text-xs text-center text-gray-500">
                    Free cancellation up to 24 hours before the activity.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

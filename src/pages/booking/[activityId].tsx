
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "@/types/activity";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CheckoutButton from "@/components/stripe/CheckoutButton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

export default function ActivityBookingPage() {
  const router = useRouter();
  const { activityId } = router.query;
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("id", activityId)
          .single();

        if (error) throw error;
        setActivity(data as Activity);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (err) {
        setError("Failed to load activity details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  const handleParticipantChange = (increment: boolean) => {
    setParticipants((prev) => {
      const newCount = increment ? prev + 1 : prev - 1;
      if (newCount < 1) return 1;
      if (activity && newCount > activity.max_participants) return activity.max_participants;
      return newCount;
    });
  };

  const handleThumbnailClick = (image: string) => {
    setSelectedImage(image);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl font-semibold">{error}</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Activity not found.</div>
      </div>
    );
  }

  const checkoutData = {
    activityId: activity.id,
    providerId: activity.provider_id,
    amount: activity.price_per_person * participants,
    participants: participants,
    customerId: user?.id,
    successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/cancelled`,
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {selectedImage && (
              <div className="mb-4 relative">
                <Image
                  src={selectedImage}
                  alt={activity.title}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {activity.images?.map((image: string, index: number) => (
                <div key={index} className="flex-shrink-0 cursor-pointer" onClick={() => handleThumbnailClick(image)}>
                  <Image
                    src={image}
                    alt={`${activity.title} thumbnail ${index + 1}`}
                    width={100}
                    height={75}
                    className={`w-24 h-18 object-cover rounded-md border-2 ${selectedImage === image ? "border-primary" : "border-transparent"}`}
                  />
                </div>
              ))}
            </div>
            <h1 className="text-3xl font-bold mt-4">{activity.title}</h1>
            <div className="flex items-center mt-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              <span>{activity.rating}</span>
              <span className="mx-2">|</span>
              <MapPin className="w-5 h-5 mr-1" />
              <span>{activity.location}</span>
            </div>
            <p className="mt-4 text-lg">{activity.description}</p>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold">Highlights</h2>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {activity.highlights?.map((highlight: string, i: number) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-semibold">What's Included</h2>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {activity.included?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">Book Your Spot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${activity.price_per_person} <span className="text-base font-normal">/ person</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-semibold">Participants</span>
                  <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={() => handleParticipantChange(false)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{participants}</span>
                    <Button variant="outline" size="icon" onClick={() => handleParticipantChange(true)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 font-bold text-xl">
                  <span>Total</span>
                  <span>${(activity.price_per_person * participants).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <CheckoutButton checkoutData={checkoutData} />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

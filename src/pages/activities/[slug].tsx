import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ActivityDetails } from "@/components/activities/ActivityDetails";
import { Activity } from "@/types/activity";
import activityService from "@/services/activityService";
import { Skeleton } from "@/components/ui/skeleton";
import { GetServerSideProps, NextPage } from "next";

export default function ActivityPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (typeof slug !== "string") {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await activityService.getActivityBySlug(slug);
        if (data) {
          setActivity(data);
        } else {
          setError("Activity not found.");
        }
      } catch (err) {
        setError("Failed to load activity details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchActivity();
    }
  }, [slug]);

  const renderLoading = () => (
    <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );

  const renderError = () => (
    <div className="container py-8 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
      <p>{error}</p>
    </div>
  );

  const renderContent = () => {
    if (!activity) return null;

    const images = activity.image_url ? activity.image_url.split(",").map(s => s.trim()) : [];
    const videos = activity.video_url ? activity.video_url.split(",").map(s => s.trim()) : [];

    return (
      <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActivityDetails activity={activity} />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {loading ? renderLoading() : error ? renderError() : renderContent()}
      </main>
      <Footer />
    </div>
  );
}

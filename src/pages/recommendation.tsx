import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PreferencesForm, PreferencesFormData } from "@/components/recommendation/PreferencesForm";
import { recommendationService, RecommendedPlan } from "@/services/recommendationService";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Clock, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePlanning } from "@/contexts/PlanningContext";
import { useToast } from "@/hooks/use-toast";
import { GripVertical } from "lucide-react";
import { ScheduledActivity, ActivityWithDetails } from "@/types/activity";

interface SortableActivityItemProps {
  activity: ScheduledActivity;
  onRemove: (id: string) => void;
}

function SortableActivityItem({ activity, onRemove }: SortableActivityItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-4 p-2 bg-white rounded-lg shadow">
      <GripVertical className="cursor-grab" />
      <p>{activity.title}</p>
      <Button variant="ghost" size="sm" onClick={() => onRemove(activity.id)}>Remove</Button>
    </div>
  );
}

export default function RecommendationPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(null);
  const [recommendedPlan, setRecommendedPlan] = useState<RecommendedPlan | null>(null);
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const { addActivity, removeActivity } = usePlanning();
  const { toast } = useToast();

  const handlePreferencesSubmit = async (submittedPreferences: any) => {
    setLoading(true);
    setPreferences(submittedPreferences);
    const recommendations = await recommendationService.getRecommendations(
      submittedPreferences
    );
    
    const plan: RecommendedPlan = {
        activities: recommendations as any,
        totalPrice: recommendations.reduce((acc, act) => acc + (act.price || 0), 0),
        numberOfDays: 1,
    };
    setRecommendedPlan(plan);
    setLoading(false);
  };

  const handleAddActivity = (activity: ActivityWithDetails) => {
    const scheduledActivity: ScheduledActivity = {
      id: `${activity.id}-${new Date().toISOString()}`,
      title: activity.title,
      day: "monday", // placeholder
      time: "10:00", // placeholder
      activity: activity,
      date: new Date(), // placeholder
    };
    addActivity(scheduledActivity);
    setScheduledActivities(prev => [...prev, scheduledActivity]);
    toast({
        title: "Activity added to plan",
        description: `${activity.title} has been added to your plan.`
    })
  };

  const handleRemoveActivity = (id: string) => {
    removeActivity(id);
    setScheduledActivities(prev => prev.filter(act => act.id !== id));
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setScheduledActivities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <Head>
        <title>Personalized Recommendations - Guidestination</title>
        <meta name="description" content="Get personalized activity recommendations for your stay in Chiang Mai" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
              Personalized Planning
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PreferencesForm onSubmit={handlePreferencesSubmit} />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading && <p>Finding recommendations...</p>}
                    {recommendedPlan && (
                      <div className="space-y-4">
                        <DndContext
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={scheduledActivities}
                            strategy={verticalListSortingStrategy}
                          >
                            {scheduledActivities.map(activity => (
                              <SortableActivityItem key={activity.id} activity={activity} onRemove={handleRemoveActivity} />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

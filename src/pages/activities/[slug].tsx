import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ActivityDetails } from "@/components/activities/ActivityDetails";
import { ActivityGallery } from "@/components/activities/ActivityGallery";
import { ActivityReviews } from "@/components/activities/ActivityReviews";
import { AvailabilityCalendar } from "@/components/activities/AvailabilityCalendar";
import { ActivityChat } from "@/components/activities/ActivityChat";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ActivityWithDetails, ActivityScheduleInstance } from "@/types/activity";
import activityService from "@/services/activityService";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Star, Calendar, DollarSign, Shield, Award, Check, X, Info, Heart, Zap, Mountain, Navigation, MapPinIcon, Target, Wrench, AlertTriangle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, User } from "lucide-react";

export default function ActivityPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currency, convert } = useCurrency();
  const [activity, setActivity] = useState<ActivityWithDetails | null>(null);
  const [scheduleInstances, setScheduleInstances] = useState<ActivityScheduleInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSchedules, setShowSchedules] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ActivityScheduleInstance | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleScheduleSelect = (schedule: ActivityScheduleInstance) => {
    console.log('Schedule selected:', schedule);
    setSelectedSchedule(schedule);
    setSelectedDate(new Date(schedule.scheduled_date));
  };

  const handleBookNow = async (quantity: number) => {
    if (!selectedSchedule || !activity) {
      alert(t('activity.details.pleaseSelectDate'));
      return;
    }

    // Navigate to checkout summary page instead of directly to Stripe
    router.push({
      pathname: '/checkout/summary',
      query: {
        activityId: activity.id,
        scheduleId: selectedSchedule.id,
        quantity: quantity
      }
    });

    console.log('Book Now clicked:', { schedule: selectedSchedule, quantity });
  };

  const handleAddToCart = (quantity: number) => {
    if (!selectedSchedule || !activity) {
      alert('Please select a date and time first');
      return;
    }
    
    addToCart(activity, selectedSchedule, quantity);
    
    // The floating cart will automatically animate when items are added
    console.log('Add to Cart clicked:', { schedule: selectedSchedule, quantity });
  };

  useEffect(() => {
    const fetchActivityAndSchedules = async () => {
      if (typeof slug !== "string") {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        // Fetch activity details
        const activityData = await activityService.getActivityBySlug(slug);
        
        if (!activityData) {
          setError(`Activity not found. The activity "${slug}" may have been removed or the link is incorrect.`);
          return;
        }
        
        setActivity(activityData);

        // Fetch schedule instances for this activity
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("activity_schedule_instances")
          .select("*")
          .eq("activity_id", activityData.id)
          .eq("is_active", true)
          .gte("scheduled_date", new Date().toISOString().split('T')[0])
          .order("scheduled_date", { ascending: true });

        if (scheduleError) {
          console.error("Error fetching schedule instances:", scheduleError);
        } else {
          // Transform the data to match our type expectations
          const transformedScheduleData = (scheduleData || []).map(schedule => ({
            ...schedule,
            notes: null,
            available_spots: schedule.capacity - schedule.booked_count,
            price: schedule.price_override || activityData.b_price || 0
          } as ActivityScheduleInstance));
          setScheduleInstances(transformedScheduleData);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
        setError("Failed to load activity details. Please try refreshing the page or contact support if the problem persists.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchActivityAndSchedules();
    }
  }, [slug]);

  const renderLoading = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
      <div className="lg:col-span-3 space-y-6 lg:space-y-8">
        <Skeleton className="h-[300px] sm:h-[400px] w-full rounded-lg" />
        <Skeleton className="h-8 sm:h-12 w-3/4" />
        <Skeleton className="h-24 sm:h-32 w-full" />
        <Skeleton className="h-48 sm:h-64 w-full" />
        <Skeleton className="h-32 sm:h-48 w-full" />
      </div>
      <div className="lg:col-span-1 space-y-4 lg:space-y-6">
        <Skeleton className="h-64 sm:h-80 lg:h-96 w-full" />
        <Skeleton className="h-48 sm:h-64 w-full" />
      </div>
    </div>
  );

  const renderError = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-destructive mb-4">Activity Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">{error}</p>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">Browse All Activities</Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="w-full">
            {t('activity.details.goBack')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderActivityHeader = () => {
    if (!activity) return null;

    return (
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              {activity.average_rating && activity.average_rating >= 4.5 && (
                <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-1 w-fit">
                  {t('activity.details.topRated')}
                </Badge>
              )}
              {activity.average_rating && activity.average_rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{activity.average_rating}</span>
                  {activity.review_count && activity.review_count > 0 && (
                    <Link href="#reviews" className="text-blue-600 hover:underline text-sm">
                      {activity.review_count} {t('activity.details.reviews')}
                    </Link>
                  )}
                </div>
              )}
              {Array.isArray(activity.categories) && activity.categories.length > 0 && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  • {t('activity.details.activityProvider')}: <span className="font-medium">{activity.categories[0].name.replace(/_/g, ' ')}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t('activity.details.addToWishlist')}
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t('activity.details.share')}
              </Button>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{activity.title}</h1>
          
          {activity.description && (
            <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 max-w-4xl">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!activity) {
      return <div>Activity not found</div>;
    }

    // Normalize image sources into a flat array of strings.
    const images: string[] = (() => {
      const raw = (activity as any).image_url ?? (activity as any).image_urls ?? [];
      if (Array.isArray(raw)) {
        // Flatten up to 2 levels in case DB returned nested arrays and filter invalid values
        return raw.flat(2).filter((u: any) => typeof u === 'string' && u.trim() !== '');
      }
      if (typeof raw === 'string' && raw.trim() !== '') return [raw];
      return [];
    })();

    return (
      <div className="bg-white text-black min-h-screen">
        {renderActivityHeader()}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <div className="w-full">
              <ActivityGallery images={images} title={activity.title} videos={[]} />
            </div>
            
            {/* About this tour section */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">About this tour</h2>
              <ActivityDetails 
                activity={activity} 
                selectedSchedule={selectedSchedule}
                onBookNow={handleBookNow}
                onAddToCart={handleAddToCart}
              />
            </div>
            
            {/* Highlights and What's Included section */}
            <div className="space-y-6 sm:space-y-8">
              {(activity.highlights || activity.dynamic_highlights) && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 mb-4 text-yellow-800">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    {t('activity.details.experienceHighlights')}
                  </h3>
                  <ul className="space-y-3">
                    {activity.highlights && activity.highlights.split('\n').filter(Boolean).map((highlight, index) => (
                      <li key={`static-${index}`} className="flex items-start gap-3">
                        <div className="bg-green-500 rounded-full p-1 mt-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-800 leading-relaxed">{highlight.trim()}</span>
                      </li>
                    ))}
                    {activity.dynamic_highlights && (
                      (Array.isArray(activity.dynamic_highlights) 
                        ? activity.dynamic_highlights 
                        : (activity.dynamic_highlights as string).split('\n')
                      ).filter(Boolean).map((highlight, index) => (
                        <li key={`dynamic-${index}`} className="flex items-start gap-3">
                          <div className="bg-green-500 rounded-full p-1 mt-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm sm:text-base text-gray-800 leading-relaxed">{String(highlight).trim()}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
              
              {/* What's Included and Not Included Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What's Included */}
                {(activity.included || activity.dynamic_included) && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 mb-4 text-green-800">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      {t('activity.details.whatsIncluded')}
                    </h3>
                    <div className="space-y-3">
                      {activity.included && activity.included.split('\n').filter(Boolean).map((item, index) => (
                        <div key={`static-${index}`} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
                          <div className="bg-green-500 rounded-full p-1 mt-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-800">{item.trim()}</span>
                        </div>
                      ))}
                      {activity.dynamic_included && (
                        (Array.isArray(activity.dynamic_included) 
                          ? activity.dynamic_included 
                          : (activity.dynamic_included as string).split('\n')
                        ).filter(Boolean).map((item, index) => (
                          <div key={`dynamic-${index}`} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
                            <div className="bg-green-500 rounded-full p-1 mt-0.5">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-800">{String(item).trim()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {/* What's Not Included */}
                {(activity.not_included || activity.dynamic_not_included) && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 mb-4 text-red-800">
                      <div className="bg-red-500 p-2 rounded-lg">
                        <X className="h-5 w-5 text-white" />
                      </div>
                      {t('activity.details.notIncluded')}
                    </h3>
                    <div className="space-y-3">
                      {activity.not_included && activity.not_included.split('\n').filter(Boolean).map((item, index) => (
                        <div key={`static-${index}`} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
                          <div className="bg-red-500 rounded-full p-1 mt-0.5">
                            <X className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-800">{item.trim()}</span>
                        </div>
                      ))}
                      {activity.dynamic_not_included && (
                        (Array.isArray(activity.dynamic_not_included) 
                          ? activity.dynamic_not_included 
                          : (activity.dynamic_not_included as string).split('\n')
                        ).filter(Boolean).map((item, index) => (
                          <div key={`dynamic-${index}`} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
                            <div className="bg-red-500 rounded-full p-1 mt-0.5">
                              <X className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-800">{String(item).trim()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Important Information */}
            {(activity.min_age || activity.max_participants || activity.physical_effort_level || activity.languages || activity.cancellation_policy) && (
              <div className="border-t pt-6 sm:pt-8 space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold">{t('activity.details.importantInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('activity.details.activityRequirements')}</h4>
                    <ul className="space-y-1 text-gray-600">
                      {activity.min_age && activity.min_age > 0 && <li>• {t('activity.details.minimumAge')}: {activity.min_age} {t('activity.details.years')}</li>}
                      {activity.max_age && activity.max_age > 0 && <li>• {t('activity.details.maximumAge')}: {activity.max_age} {t('activity.details.years')}</li>}
                      {activity.max_participants && activity.max_participants > 0 && <li>• {t('activity.details.maximumGroupSize')}: {activity.max_participants} {t('activity.details.people')}</li>}
                      {activity.physical_effort_level && <li>• {t('activity.details.physicalEffort')}: {activity.physical_effort_level.replace(/_/g, ' ')} {t('activity.details.level')}</li>}
                      {activity.technical_skill_level && <li>• {t('activity.details.technicalSkill')}: {activity.technical_skill_level.replace(/_/g, ' ')} {t('activity.details.level')}</li>}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{t('activity.details.activityDetails')}</h4>
                    <ul className="space-y-1 text-gray-600">
                      {activity.languages && <li>• {t('activity.details.languages')}: {activity.languages.replace(/_/g, ' ')}</li>}
                      {activity.duration && <li>• {t('activity.details.duration')}: {activity.duration.replace(/_/g, ' ')}</li>}
                      {activity.instant_booking && <li>• {t('activity.details.instantBookingAvailable')}</li>}
                      {activity.includes_pickup && <li>• {t('activity.details.pickupServiceIncluded')}</li>}
                      {activity.includes_meal && <li>• {t('activity.details.mealIncluded')}</li>}
                    </ul>
                  </div>
                </div>
                {activity.cancellation_policy && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{t('activity.details.cancellationPolicy')}</h4>
                    <p className="text-xs text-gray-600">{activity.cancellation_policy.replace(/_/g, ' ')}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Selected Schedule Indicator */}
            {selectedSchedule && (
              <div className="border-t pt-6 sm:pt-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">{t('activity.details.selectedDateTimeTitle')}</h4>
                  </div>
                  <div className="text-sm text-green-700">
                    <p><strong>{t('activity.details.date')}:</strong> {new Date(selectedSchedule.scheduled_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><strong>{t('activity.details.time')}:</strong> {selectedSchedule.start_time} - {selectedSchedule.end_time}</p>
                    <p><strong>{t('activity.details.price')}:</strong> {currency} {Math.round(convert(selectedSchedule.price_override || activity.b_price || 0, currency)).toLocaleString()}</p>
                    <p><strong>{t('activity.details.availableSpots')}:</strong> {selectedSchedule.available_spots || 0}</p>
                  </div>
                </div>
              </div>
            )}
            
            {showSchedules && scheduleInstances.length > 0 && (
                <Card className="border" id="available-dates-section">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Available dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scheduleInstances.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedSchedule?.id === schedule.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">
                            {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {schedule.available_spots || 0} spots left
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">
                            {currency} {Math.round(convert(schedule.price_override || activity.final_price || 0, currency)).toLocaleString()}
                          </div>
                          <Button 
                            size="sm" 
                            className={`mt-1 text-xs ${
                              selectedSchedule?.id === schedule.id 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            onClick={() => handleScheduleSelect(schedule)}
                          >
                            {selectedSchedule?.id === schedule.id ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            {/* Schedule Overview */}
            {/*scheduleInstances.length > 0 && (
              <div className="border-t pt-6 sm:pt-8 space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold">{t('activity.details.upcomingDates')}</h3>
                <div className="space-y-3">
                  {scheduleInstances.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-center min-w-[50px] sm:min-w-[60px]">
                          <div className="text-xs sm:text-sm font-medium">
                            {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { 
                              weekday: 'short' 
                            })}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm sm:text-base">
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {schedule.available_spots || 0} {t('activity.details.spotsAvailable')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <div className="font-bold text-base sm:text-lg">
                          {activity.currency_code || "THB"} {(schedule.price_override || activity.final_price || 0).toLocaleString()}
                        </div>
                        <Button 
                          size="sm" 
                          className={`whitespace-nowrap ${
                            selectedSchedule?.id === schedule.id 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          onClick={() => handleScheduleSelect(schedule)}
                        >
                          {selectedSchedule?.id === schedule.id ? t('activity.details.selected') : t('activity.details.select')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )*/}
            
            <div id="reviews" className="pt-6 sm:pt-8">
              <ActivityReviews reviews={activity.reviews || []} />
            </div>
          </div>
          
          {/* Pricing and Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 sm:top-8 space-y-4 sm:space-y-6">
              {/* Pricing Card */}
              <Card className="border shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  {activity.b_price && (
                    <div className="mb-4">
                      {activity.discounts > 0 && (
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">{t('activity.details.saveUpTo')} {activity.discounts}%</div>
                      )}
                      <div className="flex items-baseline gap-2">
                        {activity.discounts > 0 && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            {activity.currency_code || "THB"} {Math.round((activity.b_price * (1 + activity.discounts / 100)) / 10) * 10}
                          </span>
                        )}
                        <span className="text-2xl sm:text-3xl font-bold text-red-600">
                          {currency} {Math.round(convert(Math.ceil(activity.final_price), currency)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 text-sm sm:text-lg font-semibold"
                    onClick={() => setShowSchedules(!showSchedules)}
                  >
                    {showSchedules ? t('activity.details.hideSchedules') : t('activity.details.checkAvailability')}
                  </Button>
                  
                 {/* <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 text-sm sm:text-lg font-semibold mt-3"
                    asChild
                  >
                    <Link href={`/booking/${activity.id}`}>
                      Book Now
                    </Link>
                  </Button>
                  */}
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    {activity.cancellation_policy && activity.cancellation_policy.toLowerCase().includes('free') && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>
                          {t('activity.details.freeCancellation')}
                          {(() => {
                            const policy = activity.cancellation_policy.toLowerCase();
                            const hourMatch = policy.match(/(\d+)\s*hours?\b/);
                            if (hourMatch) {
                              return ` (${hourMatch[1]} ${t('activity.details.hoursBefore')}`;
                            }
                            return '';
                          })()}
                        </span>
                      </div>
                    )}
                    {activity.instant_booking && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{t('activity.details.instantBooking')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Details */}
              <Card className="border">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">{t('activity.details.activityDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid gap-2 sm:gap-3 text-xs sm:text-sm">
                    {activity.duration && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">{t('activity.details.duration')}</span>
                        <span className="font-medium">{activity.duration.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {activity.max_participants && activity.max_participants > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">{t('activity.details.groupSize')}</span>
                        <span className="font-medium">{t('activity.details.upTo')} {activity.max_participants}</span>
                      </div>
                    )}
                    {activity.languages && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">{t('activity.details.languages')}</span>
                        <span className="font-medium">{activity.languages.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {activity.instant_booking && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">{t('activity.details.booking')}</span>
                        <span className="font-medium text-green-600">{t('activity.details.instant')}</span>
                      </div>
                    )}
                  </div>
                  
                  {(activity.min_age || activity.max_age) && (
                    <div className="border-t pt-3 sm:pt-4">
                      <h4 className="font-medium mb-2 text-sm">{t('activity.details.ageRequirements')}</h4>
                      <div className="text-xs sm:text-sm space-y-1">
                        {activity.min_age && activity.min_age > 0 && (
                          <div>{t('activity.details.minimumAge')}: {activity.min_age} {t('activity.details.years')}</div>
                        )}
                        {activity.max_age && activity.max_age > 0 && (
                          <div>{t('activity.details.maximumAge')}: {activity.max_age} {t('activity.details.years')}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {activity.cancellation_policy && (
                    <div className="border-t pt-3 sm:pt-4">
                      <h4 className="font-medium mb-2 text-sm">{t('activity.details.cancellationPolicy')}</h4>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {(() => {
                          const policy = activity.cancellation_policy.toLowerCase();
                          if (policy.includes('free')) {
                            const hourMatch = policy.match(/(\d+)\s*hours?\b/);
                            if (hourMatch) {
                              return `Free cancellation (${hourMatch[1]} hours) before activity start. ${activity.cancellation_policy.replace(/_/g, ' ')}`;
                            }
                          }
                          return activity.cancellation_policy.replace(/_/g, ' ');
                        })()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Schedules 
              {showSchedules && scheduleInstances.length > 0 && (
                <Card className="border" id="available-dates-section">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Available dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scheduleInstances.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedSchedule?.id === schedule.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">
                            {new Date(schedule.scheduled_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {schedule.available_spots || 0} spots left
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">
                            {currency} {(schedule.price_override || activity.final_price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                          <Button 
                            size="sm" 
                            className={`mt-1 text-xs ${
                              selectedSchedule?.id === schedule.id 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            onClick={() => handleScheduleSelect(schedule)}
                          >
                            {selectedSchedule?.id === schedule.id ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}*/}

              {/* Requirements Section */}
              {(activity.min_age || activity.max_age || activity.physical_effort_level || activity.technical_skill_level || 
                activity.pickup_location_formatted_address || activity.meeting_point || activity.dropoff_location_formatted_address) && (
                <Card className="border">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Requirements & Meeting Points</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Age & Skill Requirements */}
                    {(activity.min_age || activity.max_age || activity.physical_effort_level || activity.technical_skill_level) && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">Requirements</h4>
                        {activity.min_age && activity.min_age > 0 && (
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600">Min Age</span>
                            <span className="text-xs font-medium">{activity.min_age} years</span>
                          </div>
                        )}
                        {activity.max_age && activity.max_age > 0 && (
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600">Max Age</span>
                            <span className="text-xs font-medium">{activity.max_age} years</span>
                          </div>
                        )}
                        {activity.physical_effort_level && (
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Mountain className="h-3 w-3" />
                              Physical Level
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              activity.physical_effort_level.toLowerCase() === 'easy' ? 'bg-green-100 text-green-800' :
                              activity.physical_effort_level.toLowerCase() === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              activity.physical_effort_level.toLowerCase() === 'challenging' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.physical_effort_level.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                        {activity.technical_skill_level && (
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Wrench className="h-3 w-3" />
                              {t('activity.details.skillLevel')}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              activity.technical_skill_level?.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                              activity.technical_skill_level?.toLowerCase() === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              activity.technical_skill_level?.toLowerCase() === 'advanced' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.technical_skill_level?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Meeting Points */}
                    {(activity.pickup_location_formatted_address || activity.meeting_point || activity.dropoff_location_formatted_address) && (
                      <div className="space-y-3 border-t pt-3">
                        <h4 className="font-medium text-sm text-gray-700">{t('activity.details.meetingPoints')}</h4>
                        {activity.pickup_location_formatted_address && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              <MapPinIcon className="h-3 w-3" />
                              {t('activity.details.pickupPoint')}
                            </div>
                            <div className="text-xs text-gray-800 pl-4">{activity.pickup_location_formatted_address.replace(/_/g, ' ')}</div>
                          </div>
                        )}
                        {activity.meeting_point && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {t('activity.details.meetingPoint')}
                            </div>
                            <div className="text-xs text-gray-800 pl-4">{activity.meeting_point.replace(/_/g, ' ')}</div>
                          </div>
                        )}
                        {activity.dropoff_location_formatted_address && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {t('activity.details.dropoffPoint')}
                            </div>
                            <div className="text-xs text-gray-800 pl-4">{activity.dropoff_location_formatted_address.replace(/_/g, ' ')}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Calendar Widget */}
              <Card className="border">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Select date and time</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <AvailabilityCalendar 
                    activityId={String(activity.id)} 
                    scheduleData={scheduleInstances}
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      setSelectedDate(date || null);
                      // Find the schedule for this date
                      if (date) {
                        const dateStr = date.toISOString().split('T')[0];
                        const schedule = scheduleInstances.find(s => s.scheduled_date === dateStr);
                        if (schedule) {
                          setSelectedSchedule(schedule);
                        }
                      } else {
                        setSelectedSchedule(null);
                      }
                    }}
                  />
                </CardContent>
              </Card>
              
              <div className="hidden lg:block">
                <ActivityChat activity={activity} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Chat - Only show on smaller screens */}
        <div className="lg:hidden container mx-auto px-4 sm:px-6 pb-6 mb-20">
          <ActivityChat activity={activity} />
        </div>

        {/* Mobile Booking Bar - Sticky bottom on small screens */}
        {selectedSchedule && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-600">
                  {new Date(selectedSchedule.scheduled_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} • {selectedSchedule.start_time}
                </div>
                <div className="font-bold text-blue-600">
                  {currency} {(selectedSchedule.price_override || Math.ceil(activity.final_price) || activity.b_price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddToCart(1)}
                  className="border-blue-600 text-blue-600"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => handleBookNow(1)}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {loading ? renderLoading() : error ? renderError() : renderContent()}
        {/* Floating Check Availability Button (mobile only) - hidden when a date is selected */}
        {!loading && !error && !selectedSchedule && (
          <div className="fixed left-0 right-0 bottom-0 z-50 sm:hidden flex justify-center items-center pointer-events-none">
            <button
              className="w-[90vw] max-w-xs mb-4 bg-blue-600 text-white rounded-full px-6 py-3 shadow-xl font-semibold text-base pointer-events-auto"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
              onClick={() => {
                setShowSchedules(true);
                setTimeout(() => {
                  const el = document.getElementById('available-dates-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 50);
              }}
            >
              {t('activity.details.checkAvailability')}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

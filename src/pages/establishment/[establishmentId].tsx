import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  Users, 
  Calendar,
  ArrowRight,
  QrCode,
  ExternalLink,
  CheckCircle,
  Clock4
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { referralService } from "@/services/referralService";

// Define types based on actual database structure
interface EstablishmentData {
  id: string;
  name?: string;
  establishment_name?: string; // Legacy field name support
  type?: string;
  establishment_type?: string; // Legacy field name support
  description?: string;
  address?: string;
  establishment_address?: string; // Legacy field name support
  phone?: string;
  establishment_phone?: string; // Legacy field name support
  email?: string;
  establishment_email?: string; // Legacy field name support
  number_of_rooms?: number;
  verification_status?: string;
  verification_notes?: string;
  created_at?: string;
  updated_at?: string;
  location_lat?: number | null;
  location_lng?: number | null;
  place_id?: string | null;
  onboarding_status?: string;
  onboarding_fee_paid?: boolean;
  material_fee_paid?: boolean;
  total_onboarding_cost?: number;
  onboarding_paid_at?: string | null;
  onboarding_payment_reference?: string | null;
  image_url?: string | null;
  partner_id?: string;
}

// Local interface for activity data from database query
interface ActivityFromDB {
  id: number;
  title: string;
  description: string;
  image_url: string[] | string;
  pickup_location: string;
  dropoff_location: string;
  discounts: number;
  max_participants: number;
  highlights: string;
  included: string;
  b_price: number;
  final_price: number;
  currency_code: string;
  average_rating: number;
  instant_booking: boolean;
  categories: {
    name: string;
  } | null;
  establishment_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  slug?: string;
  duration?: string;
  location?: string;
}

interface EstablishmentPageProps {
  establishment: EstablishmentData | null;
  activities: ActivityFromDB[];
}

export default function EstablishmentPage({ establishment: initialEstablishment, activities: initialActivities }: EstablishmentPageProps) {
  const router = useRouter();
  const { establishmentId } = router.query;
  const [establishment, setEstablishment] = useState<EstablishmentData | null>(initialEstablishment);
  const [activities, setActivities] = useState<ActivityFromDB[]>(initialActivities);
  const [loading, setLoading] = useState(!initialEstablishment);
  const [showQrLinkingConfirmation, setShowQrLinkingConfirmation] = useState(false);
  const [linkingStatus, setLinkingStatus] = useState<'linking' | 'success' | 'error'>('linking');

  useEffect(() => {
    // Track QR scan visit and link establishment for 15 days
    const trackQrScanAndLink = async () => {
      if (typeof establishmentId === "string" && establishment) {
        try {
          setLinkingStatus('linking');
          setShowQrLinkingConfirmation(true);

          // Track visit using our referral service (sets 15-day expiry automatically)
          await referralService.trackVisit(establishmentId, {
            source: 'qr_code',
            establishment_name: establishment.name,
            scan_timestamp: new Date().toISOString(),
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            referrer_url: typeof document !== 'undefined' ? document.referrer : undefined,
          });

          setLinkingStatus('success');
          
          console.log(`✅ Customer linked to ${establishment.name} for 15 days via QR scan`);
        } catch (error) {
          console.error("Error tracking QR visit:", error);
          setLinkingStatus('error');
        }
      }
    };

    if (establishment && establishmentId) {
      trackQrScanAndLink();
    }
  }, [establishmentId, establishment]);

  useEffect(() => {
    // Fetch data client-side if not provided by SSR
    const fetchEstablishmentData = async () => {
      if (initialEstablishment || !establishmentId) return;

      try {
        setLoading(true);
        
        // Fetch establishment details
        const { data: establishmentData, error: establishmentError } = await supabase
          .from("establishments")
          .select("*")
          .eq("id", String(establishmentId))
          .single();

        if (establishmentError) {
          console.error("Error fetching establishment:", establishmentError);
          return;
        }

        setEstablishment(establishmentData as any); // Type assertion since DB structure varies

        // Fetch activities related to this establishment (simplified to avoid TS issues)
        try {
          const response = await fetch('/api/activities/by-establishment?' + 
            new URLSearchParams({ establishmentId: String(establishmentId) }));
          
          if (response.ok) {
            const activitiesData = await response.json();
            setActivities(activitiesData);
          } else {
            console.error("Error fetching activities");
            setActivities([]);
          }
        } catch (error) {
          console.error("Error fetching activities:", error);
          setActivities([]);
        }
      } catch (error) {
        console.error("Error fetching establishment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentData();
  }, [establishmentId, initialEstablishment]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-48 w-full mb-8 rounded-lg" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Establishment Not Found</h1>
            <p className="text-gray-600 mb-8">
              The establishment you're looking for doesn't exist or may have been removed.
            </p>
            <Button asChild size="lg">
              <Link href="/">Browse Activities</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Head>
        <title>{establishment.name || establishment.establishment_name} - Wandering Thailand</title>
        <meta name="description" content={`Discover activities and experiences offered by ${establishment.name || establishment.establishment_name}`} />
      </Head>

      <Navbar />

      {/* QR Linking Confirmation Modal */}
      {showQrLinkingConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {linkingStatus === 'linking' && (
                  <Clock4 className="h-12 w-12 text-blue-500 animate-spin" />
                )}
                {linkingStatus === 'success' && (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                )}
                {linkingStatus === 'error' && (
                  <QrCode className="h-12 w-12 text-red-500" />
                )}
              </div>
              <CardTitle className="text-xl">
                {linkingStatus === 'linking' && 'Linking Your Account...'}
                {linkingStatus === 'success' && 'Successfully Linked!'}
                {linkingStatus === 'error' && 'Linking Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {linkingStatus === 'linking' && (
                <p className="text-gray-600">
                  Connecting you to {establishment?.name || 'this establishment'}...
                </p>
              )}
              {linkingStatus === 'success' && (
                <>
                  <p className="text-gray-600">
                    You're now connected to <strong>{establishment?.name}</strong> for the next 15 days.
                  </p>
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    💰 Any activity you book during this period will earn this establishment a commission!
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowQrLinkingConfirmation(false)}
                      className="w-full"
                    >
                      Continue Browsing Activities
                    </Button>
                    <Button 
                      variant="outline" 
                      asChild
                      className="w-full"
                    >
                      <Link href="/">Browse All Activities</Link>
                    </Button>
                  </div>
                </>
              )}
              {linkingStatus === 'error' && (
                <>
                  <p className="text-gray-600">
                    There was an issue linking your account. You can still browse activities.
                  </p>
                  <Button 
                    onClick={() => setShowQrLinkingConfirmation(false)}
                    className="w-full"
                  >
                    Continue Anyway
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{establishment.name || establishment.establishment_name}</h1>
                  <Badge className="bg-green-600 text-white">
                    <QrCode className="h-3 w-3 mr-1" />
                    QR Partner
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{establishment.address || establishment.establishment_address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Activities
            </h2>
            <p className="text-gray-600 text-lg">
              Discover amazing experiences recommended by {establishment.name || establishment.establishment_name}
            </p>
          </div>

          {activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activities.map((activity) => (
                <Link 
                  key={activity.id} 
                  href={`/activities/${activity.slug || `activity-${activity.id}`}`}
                  className="group cursor-pointer block hover:shadow-lg transition-shadow duration-300 rounded-lg p-1 hover:bg-gray-50"
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[4/3] mb-3 transform group-hover:scale-[1.02] transition-transform duration-300">
                    {(() => {
                      const imageUrl = activity.image_url as any;
                      const firstImage = Array.isArray(imageUrl) 
                        ? (imageUrl.length > 0 ? imageUrl[0] : null)
                        : imageUrl;
                      
                      return firstImage ? (
                        <img
                          src={firstImage}
                          alt={activity.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.log(`Image failed to load: ${firstImage}`);
                            (e.target as HTMLImageElement).src = "/placeholder-activity.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-lg font-semibold">
                            {activity.title.charAt(0)}
                          </span>
                        </div>
                      );
                    })()}
                    
                    {/* Multiple images indicator */}
                    {(() => {
                      const imageUrl = activity.image_url as any;
                      const imageCount = Array.isArray(imageUrl) ? imageUrl.length : (imageUrl ? 1 : 0);
                      return imageCount > 1 ? (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-black/70 text-white rounded-full text-xs font-medium">
                            +{imageCount - 1} more
                          </span>
                        </div>
                      ) : null;
                    })()}
                    
                    {/* Top badges */}
                    <div className="absolute top-2 left-2">
                      {activity.discounts > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                          {activity.discounts}% OFF
                        </span>
                      )}
                    </div>
                    {!Array.isArray(activity.image_url) || activity.image_url.length <= 1 ? (
                      <div className="absolute top-2 right-2">
                        {activity.average_rating && activity.average_rating >= 4.5 && (
                          <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                            ⭐ Top Rated
                          </span>
                        )}
                      </div>
                    ) : null}
                    
                    {/* Category badge */}
                    {activity.categories?.name && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                          {activity.categories.name.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {activity.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {activity.location || activity.pickup_location || 'Location not specified'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-400 mr-1">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">{activity.average_rating || '4.5'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {(activity.final_price || activity.b_price) ? Math.ceil(activity.final_price || activity.b_price) : 'TBA'} {activity.currency_code || 'THB'}
                      </span>
                      <span className="text-sm text-gray-500">/person</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activities Available</h3>
                <p className="text-gray-600 mb-6">
                  {establishment.name} hasn't listed any activities yet. Check back soon!
                </p>
                <Button asChild>
                  <Link href="/">Browse All Activities</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white/50 backdrop-blur-sm border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Get in Touch with {establishment.name}
              </h2>
              <p className="text-gray-600 mb-8">
                Have questions about their activities or need assistance with your booking?
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Globe className="h-4 w-4 mr-2" />
                    Browse All Activities
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { establishmentId } = context.params!;

  // Ensure establishmentId is a string
  const id = Array.isArray(establishmentId) ? establishmentId[0] : establishmentId;

  try {
    // Fetch establishment details
    const { data: establishmentData, error: establishmentError } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", id)
      .single();

    if (establishmentError || !establishmentData) {
      console.error("Error fetching establishment:", establishmentError);
      return {
        props: {
          establishment: null,
          activities: [],
        },
      };
    }

    // Fetch activities related to this establishment using the API
    let activitiesData: ActivityFromDB[] = [];
    try {
      // Use the same API endpoint that the client-side uses
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3000'; // Default port, will be adjusted by Next.js
      
      // Try different common ports for development
      const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006];
      let response: Response | null = null;
      
      for (const port of ports) {
        try {
          const url = `http://localhost:${port}/api/activities/by-establishment?establishmentId=${id}`;
          console.log(`Trying to fetch activities from: ${url}`);
          response = await fetch(url);
          if (response.ok) {
            console.log(`Successfully connected to port ${port}`);
            break;
          }
        } catch (error) {
          console.log(`Port ${port} not available, trying next...`);
          continue;
        }
      }
      
      if (response && response.ok) {
        activitiesData = await response.json();
        console.log(`Fetched ${activitiesData.length} activities from database`);
      } else {
        console.log('Using fallback: direct database query');
        // Fallback: direct database query if API not available
        
        // Try to get activities through establishment_activities junction table
        const { data: establishmentActivities, error: junctionError } = await supabase
          .from("establishment_activities")
          .select("activity_id")
          .eq("establishment_id", id);

        if (!junctionError && establishmentActivities && establishmentActivities.length > 0) {
          const activityIds = establishmentActivities.map(ea => ea.activity_id);
          
          const { data: specificActivities, error: activitiesError } = await supabase
            .from("activities")
            .select("*")
            .in("id", activityIds)
            .eq("is_active", true);

          if (!activitiesError && specificActivities) {
            activitiesData = specificActivities.map(activity => ({
              ...activity,
              establishment_id: id,
              slug: `activity-${activity.id}`,
              categories: activity.category ? { name: activity.category } : null,
              location: activity.address || "Thailand"
            }));
          }
        }
        
        // If still no activities, try provider_id match
        if (activitiesData.length === 0) {
          const { data: providerActivities, error: providerError } = await supabase
            .from("activities")
            .select("*")
            .eq("provider_id", id)
            .eq("is_active", true);

          if (!providerError && providerActivities) {
            activitiesData = providerActivities.map(activity => ({
              ...activity,
              establishment_id: id,
              slug: `activity-${activity.id}`,
              categories: activity.category ? { name: activity.category } : null,
              location: activity.address || "Thailand"
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      activitiesData = [];
    }

    return {
      props: {
        establishment: establishmentData,
        activities: activitiesData,
      },
    };
  } catch (error) {
    console.error("Error fetching establishment data:", error);
    return {
      props: {
        establishment: null,
        activities: [],
      },
    };
  }
};

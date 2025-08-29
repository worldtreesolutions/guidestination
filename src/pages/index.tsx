import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CategoryNav from "@/components/home/CategoryNav";
import SearchBar from "@/components/home/SearchBar";
import activityService from "@/services/activityService";
import { categoryService, Category } from "@/services/categoryService";
import { ActivityForHomepage } from "@/types/activity";
import { ShoppingCart, Heart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingActionButtons } from "@/components/layout/FloatingActionButtons";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import customerService from "@/services/customerService";
import Head from "next/head";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currency, convert, rates } = useCurrency();

  const [activities, setActivities] = useState<ActivityForHomepage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if services are available and have required methods
        if (!activityService || typeof activityService.getActivitiesForHomepage !== 'function') {
          throw new Error("Activity service not properly initialized. Please check your Supabase configuration.");
        }
        
        if (!categoryService || typeof categoryService.getAllCategories !== 'function') {
          throw new Error("Category service not properly initialized. Please check your Supabase configuration.");
        }
        
        // Fetch both activities and categories with individual error handling
        let activitiesData: ActivityForHomepage[] = [];
        let categoriesData: Category[] = [];
        
        try {
          activitiesData = await activityService.getActivitiesForHomepage();
          console.log("Activities fetched successfully:", activitiesData.length, "activities");
          console.log("Sample activity data:", activitiesData[0]);
        } catch (activityError) {
          console.error("Failed to fetch activities:", activityError);
          activitiesData = [];
        }
        
        try {
          categoriesData = await categoryService.getAllCategories();
          console.log("Categories fetched successfully:", categoriesData.length, "categories");
        } catch (categoryError) {
          console.error("Failed to fetch categories:", categoryError);
          categoriesData = [];
        }
        
        setActivities(activitiesData || []);
        setCategories(categoriesData || []);
        
        console.log("Final state - Activities:", activitiesData.length, "Categories:", categoriesData.length);
        
        // If both failed, show error
        if (activitiesData.length === 0 && categoriesData.length === 0) {
          setError("Unable to load data. Please check your Supabase configuration.");
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Set empty arrays as fallback
        setActivities([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWishlistToggle = async (activityId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      alert('Please log in to add items to your wishlist');
      return;
    }

    try {
      const isInWishlist = wishlistItems.includes(activityId);
      
      if (isInWishlist) {
        await customerService.removeFromWishlist(user.id, activityId);
        setWishlistItems(prev => prev.filter(id => id !== activityId));
      } else {
        await customerService.addToWishlist(user.id, activityId);
        setWishlistItems(prev => [...prev, activityId]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // More specific error messaging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to update wishlist: ${errorMessage}. Please try again.`);
    }
  };

  // Re-fetch wishlist when user changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          console.log('=== HOMEPAGE WISHLIST FETCH START ===');
          console.log('Fetching wishlist for user:', user.id);
          const userWishlist = await customerService.getWishlist(user.id);
          console.log('Wishlist fetched successfully:', userWishlist);
          const activityIds = userWishlist.map(item => item.activity_id);
          console.log('Activity IDs for wishlist:', activityIds);
          setWishlistItems(activityIds);
          console.log('=== HOMEPAGE WISHLIST FETCH END ===');
        } catch (wishlistError) {
          console.error("Failed to fetch wishlist:", wishlistError);
          // Don't alert here as it's during page load
        }
      } else {
        console.log('No user logged in, clearing wishlist');
        setWishlistItems([]);
      }
    };

    fetchWishlist();
  }, [user]);

  // Filter activities based on selected category
  const filteredActivities = selectedCategoryId 
    ? activities.filter(activity => {
        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
        if (!selectedCategory) return false;
        
        // Check if activity has this category (either in categories array or as primary category_name)
        return activity.categories?.some(cat => cat.name === selectedCategory.name) ||
               activity.category_name === selectedCategory.name;
      })
    : activities;

  // Group all activities by category for Netflix-style display
  const groupedActivities = activities.reduce((acc, activity) => {
    // Handle multiple categories per activity
    if (activity.categories && activity.categories.length > 0) {
      activity.categories.forEach(category => {
        const categoryName = category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        // Avoid duplicates
        if (!acc[categoryName].some(a => a.id === activity.id)) {
          acc[categoryName].push(activity);
        }
      });
    } else {
      // Fallback to single category_name
      const category = activity.category_name || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(activity);
    }
    return acc;
  }, {} as Record<string, ActivityForHomepage[]>);

  // Get categories that have activities
  const categoriesWithActivities = categories.filter(category => 
    activities.some(activity => 
      activity.categories?.some(cat => cat.name === category.name) ||
      activity.category_name === category.name
    )
  );

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Handler for search bar
  const handleSearch = async ({ destination, date, guests }: { destination: string; date?: Date; guests: string }) => {
    setLoading(true);
    setError(null);
    try {
      // Log the search parameters
      console.log('[Search Debug] Search triggered with:', {
        destination,
        date,
        guests
      });
      // Call the backend search method
      const results = await activityService.searchActivities(destination, date, guests);
      // Log the returned activities
      console.log('[Search Debug] Activities returned:', Array.isArray(results) ? results.length : 0, results);
      setActivities(results || []);
      if (!results || results.length === 0) {
        console.warn('[Search Debug] No activities found for search:', { destination, date, guests });
      }
    } catch (err) {
      console.error('[Search Debug] Error during searchActivities:', err);
      setError('Failed to search activities. Please try again.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black w-full">
      <Head>
        <title>{t('seo.title') || 'Guidestination - Discover Amazing Activities'}</title>
        <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </Head>
      <Navbar />
      <main className="relative">
        {/* Search Section */}
        <section className="w-full py-6 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>

        {/* Category Navigation */}
        <section className="w-full py-2 sm:py-4 bg-white border-t border-gray-200">
          <div className="flex justify-center items-center w-full px-1 sm:px-4">
            <div className="w-full max-w-6xl flex justify-center">
              <CategoryNav 
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={selectedCategoryId}
              />
            </div>
          </div>
        </section>

        <div className="w-full px-1 sm:px-0 py-4 sm:py-8">
          {/* Welcome Message Demonstrating Enhanced Translation with Interpolation */}
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                {t('home.welcomeMessage', { userName: user.email?.split('@')[0] || 'Guest' })}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {t('home.activitiesCount', { count: activities.length })}
              </p>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-500 text-base sm:text-lg">Loading activities...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-gray-500">Please check your Supabase configuration and try again.</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.
              </p>
            </div>
          )}
          {!loading && !error && (
            <>
              {selectedCategoryId ? (
                // Show filtered activities for selected category
                <section className="bg-white rounded-lg shadow-sm p-2 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-1 sm:gap-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'} Activities
                    </h2>
                    <Link href="/activities">
                      <Button variant="outline" className="text-xs sm:text-base text-blue-600 border-blue-600 hover:bg-blue-50 px-2 sm:px-4 py-1 sm:py-2">
                        View All
                      </Button>
                    </Link>
                  </div>
                  {filteredActivities.length > 0 ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                      {filteredActivities.map((activity) => (
                        <div key={activity.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[3/4] mb-1 sm:mb-3">
                            {(() => {
                              // Handle image_url as array or string
                              const imageUrl = activity.image_url as any;
                              let firstImage = '';
                              
                              if (Array.isArray(imageUrl)) {
                                const flattenedUrls = imageUrl.flat(2);
                                const validImages = flattenedUrls.filter((url: any) => url && typeof url === 'string' && url.trim() !== '');
                                firstImage = validImages.length > 0 ? validImages[0] : '';
                              } else if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                                firstImage = imageUrl;
                              }
                              
                              return firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={activity.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                  <span className="text-white text-lg font-semibold">
                                    {activity.title.charAt(0)}
                                  </span>
                                </div>
                              );
                            })()}
                            <div className="absolute top-2 right-2">
                              <button 
                                onClick={(e) => handleWishlistToggle(activity.id, e)}
                                className={`p-1.5 rounded-full shadow-md transition-colors ${
                                  wishlistItems.includes(activity.id) 
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${wishlistItems.includes(activity.id) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                            {activity.category_name && (
                              <div className="absolute bottom-2 left-2">
                                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                                  {activity.category_name}
                                </span>
                              </div>
                            )}
                          </div>
                          <Link href={`/activities/${activity.slug || `activity-${activity.id}`}`}>
                            <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 text-base sm:text-lg">
                              {activity.title}
                            </h3>
                          </Link>
                          <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-2">{activity.location || 'Location not specified'}</p>
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
                                {(() => {
                                  const price = typeof activity.final_price === 'number' ? activity.final_price : Number(activity.final_price);
                                  if (!price || isNaN(price)) return 'TBA';
                                  const converted = convert(price, currency as any);
                                  return `${converted && !isNaN(converted) ? Math.round(converted).toLocaleString() : 'TBA'} ${currency}`;
                                })()}
                              </span>
                              <span className="text-sm text-gray-500">/person</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">
                        No activities available in {categories.find(c => c.id === selectedCategoryId)?.name || 'this category'}.
                      </p>
                    </div>
                  )}
                </section>
              ) : (
                // Show all activities in grid format (like the reference)
                <>
                  {activities.length > 0 && (
                    <section className="mb-6 sm:mb-12">
                      <div className="flex items-center mb-4 sm:mb-8 px-1 sm:px-4">
                        <div>
                          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Recommended from us</h2>
                          <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-base">Discover our top-rated experiences</p>
                        </div>
                      </div>
                      <div
                        className="overflow-x-auto w-full sm:w-screen relative"
                        style={{ WebkitOverflowScrolling: 'touch', overflowY: 'hidden', overflowX: 'auto', scrollbarWidth: 'auto', msOverflowStyle: 'auto', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
                      >
                        <div
                          className="flex flex-row gap-2 sm:gap-6 min-w-max"
                          style={{ minHeight: '100%', height: '100%' }}
                        >
                          {activities.slice(0, 10).map((activity) => (
                            <div key={activity.id} className="group cursor-pointer w-40 sm:w-64 flex-shrink-0">
                              <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[3/4] mb-1 sm:mb-3">
                                {(() => {
                                  // Handle image_url as array or string
                                  const imageUrl = activity.image_url as any;
                                  let firstImage = '';
                                  
                                  if (Array.isArray(imageUrl)) {
                                    const flattenedUrls = imageUrl.flat(2);
                                    const validImages = flattenedUrls.filter((url: any) => url && typeof url === 'string' && url.trim() !== '');
                                    firstImage = validImages.length > 0 ? validImages[0] : '';
                                  } else if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                                    firstImage = imageUrl;
                                  }
                                  
                                  return firstImage ? (
                                    <img
                                      src={firstImage}
                                      alt={activity.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        // Hide the image and show fallback
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          const fallback = parent.querySelector('.fallback-bg') as HTMLElement;
                                          if (fallback) {
                                            fallback.style.display = 'flex';
                                          }
                                        }
                                      }}
                                    />
                                  ) : null;
                                })()}
                                <div className="fallback-bg w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center" style={{display: 'none'}}>
                                  <span className="text-white text-lg font-semibold">
                                    {activity.title.charAt(0)}
                                  </span>
                                </div>
                                <div className="absolute top-2 right-2">
                                  <button 
                                    onClick={(e) => handleWishlistToggle(activity.id, e)}
                                    className={`p-1.5 rounded-full shadow-md transition-colors ${
                                      wishlistItems.includes(activity.id) 
                                        ? 'bg-red-500 text-white hover:bg-red-600' 
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    <Heart className={`w-4 h-4 ${wishlistItems.includes(activity.id) ? 'fill-current' : ''}`} />
                                  </button>
                                </div>
                                {activity.category_name && (
                                  <div className="absolute bottom-2 left-2">
                                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                                      {activity.category_name}
                                    </span>
                                  </div>
                                )}
                                {/* Popular badge */}
                                <div className="absolute top-2 left-2">
                                  <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                                    popular
                                  </span>
                                </div>
                              </div>
                              <Link href={`/activities/${activity.slug || `activity-${activity.id}`}`}>
                                <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 text-base sm:text-lg">
                                  {activity.title}
                                </h3>
                              </Link>
                              <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-2">{activity.location || 'Location not specified'}</p>
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
                                    {(() => {
                                      const price = typeof activity.final_price === 'number' ? activity.final_price : Number(activity.final_price);
                                      if (!price || isNaN(price)) return 'TBA';
                                      const converted = convert(price, currency as any);
                                      return `${converted && !isNaN(converted) ? Math.round(converted).toLocaleString() : 'TBA'} ${currency}`;
                                    })()}
                                  </span>
                                  <span className="text-sm text-gray-500">/person</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}
                  
                  {/* Category sections */}
                  {categoriesWithActivities.map((category) => {
                    const categoryActivities = groupedActivities[category.name] || [];
                    if (categoryActivities.length === 0) return null;
                    return (
                      <section key={category.id} className="mb-6 sm:mb-12 w-full">
                        <div className="flex items-center mb-2 sm:mb-6 px-1 sm:px-4">
                          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{category.name}</h2>
                        </div>
                        <div
                          className="overflow-x-auto w-full sm:w-screen relative"
                          style={{ WebkitOverflowScrolling: 'touch', overflowY: 'hidden', overflowX: 'auto', scrollbarWidth: 'auto', msOverflowStyle: 'auto', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
                        >
                          <div
                            className="flex flex-row gap-2 sm:gap-6 min-w-max"
                            style={{ minHeight: '100%', height: '100%' }}
                          >
                            {categoryActivities.map((activity) => (
                              <div key={activity.id} className="group cursor-pointer w-40 sm:w-64 flex-shrink-0">
                                <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[3/4] mb-1 sm:mb-3">
                                  {(() => {
                                    // Handle image_url as array or string
                                    const imageUrl = activity.image_url as any;
                                    let firstImage = '';
                                    
                                    if (Array.isArray(imageUrl)) {
                                      const flattenedUrls = imageUrl.flat(2);
                                      const validImages = flattenedUrls.filter((url: any) => url && typeof url === 'string' && url.trim() !== '');
                                      firstImage = validImages.length > 0 ? validImages[0] : '';
                                    } else if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                                      firstImage = imageUrl;
                                    }
                                    
                                    return firstImage ? (
                                      <img
                                        src={firstImage}
                                        alt={activity.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          // Hide the image and show fallback
                                          e.currentTarget.style.display = 'none';
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            const fallback = parent.querySelector('.fallback-bg') as HTMLElement;
                                            if (fallback) {
                                              fallback.style.display = 'flex';
                                            }
                                          }
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                  <div className="fallback-bg w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center" style={{display: 'none'}}>
                                    <span className="text-white text-lg font-semibold">
                                      {activity.title.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="absolute top-2 right-2">
                                    <button 
                                      onClick={(e) => handleWishlistToggle(activity.id, e)}
                                      className={`p-1.5 rounded-full shadow-md transition-colors ${
                                        wishlistItems.includes(activity.id) 
                                          ? 'bg-red-500 text-white hover:bg-red-600' 
                                          : 'bg-white text-gray-600 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Heart className={`w-4 h-4 ${wishlistItems.includes(activity.id) ? 'fill-current' : ''}`} />
                                    </button>
                                  </div>
                                  {activity.category_name && (
                                    <div className="absolute bottom-2 left-2">
                                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                                        {activity.category_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Link href={`/activities/${activity.slug || `activity-${activity.id}`}`}>
                                  <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 text-base sm:text-lg">
                                    {activity.title}
                                  </h3>
                                </Link>
                                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-2">{activity.location || 'Location not specified'}</p>
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
                                      {(() => {
                                        const price = typeof activity.final_price === 'number' ? activity.final_price : Number(activity.final_price);
                                        if (!price || isNaN(price)) return 'TBA';
                                        const converted = convert(price, currency as any);
                                        return `${converted && !isNaN(converted) ? Math.round(converted).toLocaleString() : 'TBA'} ${currency}`;
                                      })()}
                                    </span>
                                    <span className="text-sm text-gray-500">/person</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                  
                  {activities.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-500 text-lg">No activities available at the moment.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        This might be due to Supabase configuration issues or no data in the database.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="fixed bottom-24 right-4 sm:bottom-4 z-50 transition-all duration-300">
          <Button size="icon" className="rounded-full w-14 h-14 shadow-lg bg-white">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cartGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#eb1951" />
                  <stop offset="1" stopColor="#faaa15" />
                </linearGradient>
              </defs>
              <path d="M6 6h15l-1.5 9h-13z" stroke="url(#cartGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="20" r="1" fill="url(#cartGradient)" />
              <circle cx="18" cy="20" r="1" fill="url(#cartGradient)" />
              <path d="M6 6L4 2H2" stroke="url(#cartGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
        <div className="fixed bottom-4 right-4 z-40 sm:z-50 transition-all duration-300">
          <FloatingActionButtons />
        </div>
      </main>
      <Footer />
    </div>
  );
}

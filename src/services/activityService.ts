// Mock data service for activities

export interface Activity {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  basePrice: number;
  finalPrice: number;
  maxParticipants: number;
  includesPickup: boolean;
  pickupLocations?: string;
  includesMeal: boolean;
  mealDescription?: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  meetingPoint: string;
  languages: string[];
  images: string[];
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
}

export interface Booking {
  id: string;
  activityId: string;
  activityTitle: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  timeSlot?: string;
  participants: number;
  totalAmount: number;
  providerAmount: number;
  platformFee: number;
  totalPrice?: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

// Mock activities data
const mockActivities: Activity[] = [
  {
    id: "act-1",
    providerId: "provider-123",
    title: "Doi Suthep Temple & Hmong Village Tour",
    description: "Explore the beautiful Doi Suthep temple and visit an authentic Hmong village.",
    category: "culture",
    duration: "half_day",
    basePrice: 1500,
    finalPrice: 1800,
    maxParticipants: 10,
    includesPickup: true,
    pickupLocations: "All hotels in Chiang Mai Old City",
    includesMeal: true,
    mealDescription: "Traditional Thai lunch at a local restaurant",
    highlights: [
      "Visit the sacred Doi Suthep temple",
      "Explore an authentic Hmong hill tribe village",
      "Panoramic views of Chiang Mai city",
      "Learn about local culture and traditions"
    ],
    included: [
      "Hotel pickup and drop-off",
      "English-speaking guide",
      "Entrance fees",
      "Lunch",
      "Bottled water"
    ],
    notIncluded: [
      "Gratuities",
      "Personal expenses",
      "Travel insurance"
    ],
    meetingPoint: "Your hotel lobby or Tha Phae Gate for those outside pickup zone",
    languages: ["English", "Thai"],
    images: ["https://images.unsplash.com/photo-1563492065599-3520f775eeed"],
    status: "published",
    createdAt: "2025-01-15T08:30:00Z",
    updatedAt: "2025-01-15T08:30:00Z",
    rating: 4.8,
    reviewCount: 24
  },
  {
    id: "act-2",
    providerId: "provider-123",
    title: "Traditional Thai Cooking Class with Organic Farm Visit",
    description: "Learn to cook authentic Thai dishes after picking fresh ingredients from our organic farm.",
    category: "cooking",
    duration: "half_day",
    basePrice: 1200,
    finalPrice: 1440,
    maxParticipants: 8,
    includesPickup: true,
    pickupLocations: "All hotels in Chiang Mai city area",
    includesMeal: true,
    mealDescription: "You'll eat what you cook! Full meal with 4 dishes.",
    highlights: [
      "Visit our organic farm and pick fresh ingredients",
      "Learn to cook 4 authentic Thai dishes",
      "Take home a recipe book",
      "Small group ensures personal attention"
    ],
    included: [
      "Hotel pickup and drop-off",
      "All ingredients and cooking equipment",
      "Recipe book",
      "Meal (what you cook)",
      "Soft drinks and water"
    ],
    notIncluded: [
      "Alcoholic beverages",
      "Gratuities"
    ],
    meetingPoint: "Your hotel lobby",
    languages: ["English", "Thai", "Chinese"],
    images: ["https://images.unsplash.com/photo-1544025162-d76694265947"],
    status: "published",
    createdAt: "2025-01-20T09:15:00Z",
    updatedAt: "2025-01-20T09:15:00Z",
    rating: 5,
    reviewCount: 36
  }
];

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: "book-1",
    activityId: "act-1",
    activityTitle: "Doi Suthep Temple & Hmong Village Tour",
    customerId: "cust-1",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    date: "2025-04-15",
    time: "09:00",
    timeSlot: "Morning (9:00 AM)",
    participants: 2,
    totalAmount: 3600,
    providerAmount: 3000,
    platformFee: 600,
    totalPrice: 3600,
    status: "confirmed",
    createdAt: "2025-04-01T14:30:00Z"
  },
  {
    id: "book-2",
    activityId: "act-2",
    activityTitle: "Traditional Thai Cooking Class with Organic Farm Visit",
    customerId: "cust-2",
    customerName: "Emma Johnson",
    customerEmail: "emma@example.com",
    date: "2025-04-16",
    time: "10:00",
    timeSlot: "Morning (10:00 AM)",
    participants: 4,
    totalAmount: 5760,
    providerAmount: 4800,
    platformFee: 960,
    totalPrice: 5760,
    status: "confirmed",
    createdAt: "2025-04-02T09:45:00Z"
  },
  {
    id: "book-3",
    activityId: "act-1",
    activityTitle: "Doi Suthep Temple & Hmong Village Tour",
    customerId: "cust-3",
    customerName: "Michael Wong",
    customerEmail: "michael@example.com",
    date: "2025-04-20",
    time: "09:00",
    timeSlot: "Morning (9:00 AM)",
    participants: 3,
    totalAmount: 5400,
    providerAmount: 4500,
    platformFee: 900,
    totalPrice: 5400,
    status: "pending",
    createdAt: "2025-04-03T16:20:00Z"
  }
];

// Activity service functions
export const activityService = {
  // Get all activities for a provider
  getActivitiesByProvider: async (providerId: string): Promise<Activity[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockActivities.filter(activity => activity.providerId === providerId);
  },

  // Get a single activity by ID
  getActivityById: async (activityId: string): Promise<Activity | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const activity = mockActivities.find(a => a.id === activityId);
    return activity || null;
  },

  // Create a new activity
  createActivity: async (activityData: Partial<Activity>): Promise<Activity> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      providerId: activityData.providerId || "provider-123",
      title: activityData.title || "New Activity",
      description: activityData.description || "",
      category: activityData.category || "adventure",
      duration: activityData.duration || "half_day",
      basePrice: activityData.basePrice || 0,
      finalPrice: (activityData.basePrice || 0) * 1.2, // 20% commission
      maxParticipants: activityData.maxParticipants || 10,
      includesPickup: activityData.includesPickup || false,
      pickupLocations: activityData.pickupLocations,
      includesMeal: activityData.includesMeal || false,
      mealDescription: activityData.mealDescription,
      highlights: activityData.highlights || [],
      included: activityData.included || [],
      notIncluded: activityData.notIncluded || [],
      meetingPoint: activityData.meetingPoint || "",
      languages: activityData.languages || ["English"],
      images: activityData.images || [],
      status: activityData.status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockActivities.push(newActivity);
    return newActivity;
  },

  // Update an activity
  updateActivity: async (activityId: string, updates: Partial<Activity>): Promise<Activity> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockActivities.findIndex(a => a.id === activityId);
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    const updatedActivity = {
      ...mockActivities[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    mockActivities[index] = updatedActivity;
    return updatedActivity;
  },

  // Delete an activity
  deleteActivity: async (activityId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockActivities.findIndex(a => a.id === activityId);
    if (index !== -1) {
      mockActivities.splice(index, 1);
    }
  },

  // Get bookings for a provider
  getBookingsByProvider: async (providerId: string): Promise<Booking[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all activities for this provider
    const providerActivities = mockActivities.filter(a => a.providerId === providerId);
    const providerActivityIds = providerActivities.map(a => a.id);
    
    // Return bookings for these activities
    return mockBookings.filter(booking => providerActivityIds.includes(booking.activityId));
  },

  // Get earnings data for a provider
  getProviderEarnings: async (providerId: string): Promise<{
    total: number;
    monthly: { month: string; amount: number }[];
    pending: number;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Get all confirmed/completed bookings for this provider's activities
    const providerActivities = mockActivities.filter(a => a.providerId === providerId);
    const providerActivityIds = providerActivities.map(a => a.id);
    
    const relevantBookings = mockBookings.filter(
      booking => providerActivityIds.includes(booking.activityId) && 
      (booking.status === "confirmed" || booking.status === "completed")
    );
    
    const pendingBookings = mockBookings.filter(
      booking => providerActivityIds.includes(booking.activityId) && 
      booking.status === "pending"
    );
    
    // Calculate total earnings
    const totalEarnings = relevantBookings.reduce((sum, booking) => sum + booking.providerAmount, 0);
    const pendingEarnings = pendingBookings.reduce((sum, booking) => sum + booking.providerAmount, 0);
    
    // Generate monthly data (mock data for demonstration)
    const monthlyEarnings = [
      { month: "Jan", amount: 12500 },
      { month: "Feb", amount: 18700 },
      { month: "Mar", amount: 22300 },
      { month: "Apr", amount: totalEarnings }
    ];
    
    return {
      total: totalEarnings,
      monthly: monthlyEarnings,
      pending: pendingEarnings
    };
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: string): Promise<Booking> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockBookings.findIndex(b => b.id === bookingId);
    if (index === -1) {
      throw new Error("Booking not found");
    }
    
    mockBookings[index].status = status as "pending" | "confirmed" | "completed" | "cancelled";
    return mockBookings[index];
  }
};
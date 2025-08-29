// TypeScript interface for translation keys - this ensures type safety
export interface TranslationKeys {
  // SEO
  'seo.title': string
  'seo.description': string
  
  // Navigation
  'nav.home': string
  'nav.activities': string
  'nav.planning': string
  'nav.login': string
  'nav.logout': string
  'nav.register': string
  'nav.listActivities': string
  'nav.becomePartner': string
  
  // Homepage Hero
  'hero.title': string
  'hero.subtitle': string
  'hero.searchPlaceholder': string
  'hero.searchButton': string
  
  // Homepage Sections
  'home.recommendedTitle': string
  'home.recommendedSubtitle': string
  'home.viewAll': string
  'home.popular': string
  'home.noActivities': string
  'home.loadingActivities': string
  
  // Activity Cards
  'activity.perPerson': string
  'activity.popular': string
  'activity.addToWishlist': string
  'activity.removeFromWishlist': string
  'activity.rating': string
  'activity.locationNotSpecified': string
  'activity.priceNotAvailable': string
  
  // Categories
  'category.all': string
  'category.adventure': string
  'category.nature': string
  'category.culture': string
  'category.artCraft': string
  'category.photography': string
  'category.sport': string
  'category.cooking': string
  
  // Common
  'common.loading': string
  'common.error': string
  'common.search': string
  'common.book': string
  'common.cancel': string
  'common.confirm': string
  'common.save': string
  'common.close': string
  'common.next': string
  'common.previous': string
  'common.back': string
  
  // Auth
  'auth.loginRequired': string
  'auth.pleaseLogin': string
  
  // Wishlist
  'wishlist.addSuccess': string
  'wishlist.removeSuccess': string
  'wishlist.error': string
  
  // Errors
  'error.fetchActivities': string
  'error.fetchCategories': string
  'error.supabaseConfig': string
  'error.genericMessage': string
}

// Helper type for nested translation access
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

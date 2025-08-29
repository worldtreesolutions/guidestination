const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mzsgmplevvyeromzvcjf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c2dtcGxldnZ5ZXJvbXp2Y2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODQ4OTYsImV4cCI6MjA2MTY2MDg5Nn0.krX9VBqcizNzHFIOia7EXPmxCNrLSwTPz3PnDYpgShI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWishlist() {
  console.log('=== TESTING WISHLIST FUNCTIONALITY ===')
  
  // Test 1: Check if wishlist table exists and has data
  console.log('\n1. Checking wishlist table...')
  const { data: wishlistData, error: wishlistError } = await supabase
    .from('wishlist')
    .select('*')
    .limit(5)
  
  console.log('Wishlist data:', wishlistData)
  console.log('Wishlist error:', wishlistError)
  
  // Test 2: Check if activities table exists and has data
  console.log('\n2. Checking activities table...')
  const { data: activitiesData, error: activitiesError } = await supabase
    .from('activities')
    .select('id, title, image_url, b_price, currency_code')
    .limit(5)
  
  console.log('Activities data:', activitiesData)
  console.log('Activities error:', activitiesError)
  
  // Test 3: Check specific activity that has a price
  console.log('\n3. Checking specific activity with price...')
  const { data: activityWithPrice, error: activityError } = await supabase
    .from('activities')
    .select('id, title, image_url, b_price, currency_code, meeting_point, average_rating')
    .eq('id', 65) // This one has a price according to our test
    .single()
  
  console.log('Activity with price:', activityWithPrice)
  console.log('Activity error:', activityError)
  
  // Test 5: Check specific activity that's in the wishlist
  console.log('\n5. Checking activity ID 68 from wishlist...')
  const { data: activityFromWishlist, error: wishlistActivityError } = await supabase
    .from('activities')
    .select('id, title, image_url, b_price, currency_code, meeting_point, average_rating')
    .eq('id', 68) // This one is in the wishlist
    .single()
  
  console.log('Activity from wishlist:', activityFromWishlist)
  console.log('Wishlist activity error:', wishlistActivityError)
  
  // Test 6: Test the exact query that the profile page uses
  console.log('\n6. Testing exact profile page query...')
  const customer_id = 'fdd6b827-b8b4-4068-b6c8-6a848e053903' // The test customer
  const wishlistResult = await supabase
    .from("wishlist")
    .select("*")
    .eq("customer_id", customer_id)
  
  console.log('Customer wishlist:', wishlistResult.data)
  
  if (wishlistResult.data && wishlistResult.data.length > 0) {
    const firstItem = wishlistResult.data[0]
    console.log('\n7. Testing activity fetch for first wishlist item...')
    const activityResult = await supabase
      .from('activities')
      .select('id, title, description, image_url, b_price, meeting_point, average_rating, currency_code')
      .eq('id', firstItem.activity_id)
      .single()
    
    console.log('Activity result:', activityResult)
  }
}

testWishlist().catch(console.error)

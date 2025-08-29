const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mzsgmplevvyeromzvcjf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c2dtcGxldnZ5ZXJvbXp2Y2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODQ4OTYsImV4cCI6MjA2MTY2MDg5Nn0.krX9VBqcizNzHFIOia7EXPmxCNrLSwTPz3PnDYpgShI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFinalPrice() {
  console.log('=== TESTING FINAL_PRICE FIELD ===')
  
  // Test final_price field availability and values
  const { data: activities, error } = await supabase
    .from('activities')
    .select('id, title, b_price, final_price, currency_code')
    .limit(10)
  
  console.log('Activities with pricing data:')
  if (activities) {
    activities.forEach(activity => {
      const roundedFinalPrice = activity.final_price ? Math.ceil(activity.final_price) : null
      console.log(`ID: ${activity.id}, Title: ${activity.title}`)
      console.log(`  b_price: ${activity.b_price}`)
      console.log(`  final_price: ${activity.final_price}`)
      console.log(`  rounded final_price: ${roundedFinalPrice}`)
      console.log(`  currency: ${activity.currency_code}`)
      console.log('  ---')
    })
  }
  
  if (error) {
    console.error('Error:', error)
  }
}

testFinalPrice().catch(console.error)

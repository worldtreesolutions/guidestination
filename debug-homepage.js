const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mzsgmplevvyeromzvcjf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c2dtcGxldnZ5ZXJvbXp2Y2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODQ4OTYsImV4cCI6MjA2MTY2MDg5Nn0.krX9VBqcizNzHFIOia7EXPmxCNrLSwTPz3PnDYpgShI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkHomepageActivities() {
  console.log('=== CHECKING HOMEPAGE ACTIVITIES ===')
  
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .eq('status', 1)
    .limit(4);

  console.log('Query error:', error);
  console.log('Total activities found:', data?.length);
  
  data?.forEach((activity, index) => {
    console.log(`\n--- Activity ${index + 1} ---`);
    console.log(`ID: ${activity.id}`);
    console.log(`Title: ${activity.title}`);
    console.log(`Active: ${activity.is_active}, Status: ${activity.status}`);
    console.log(`Image URL type: ${typeof activity.image_url}`);
    console.log(`Image URL is array: ${Array.isArray(activity.image_url)}`);
    console.log(`Image URL value:`, JSON.stringify(activity.image_url, null, 2));
    
    // Test flattening logic
    if (Array.isArray(activity.image_url)) {
      const flattened = activity.image_url.flat(2);
      const valid = flattened.filter(url => url && typeof url === 'string' && url.trim() !== '');
      console.log(`Flattened:`, flattened);
      console.log(`Valid URLs:`, valid);
    }
  });
}

checkHomepageActivities().catch(console.error);

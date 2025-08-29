// Test direct image access
const testUrl = "https://mzsgmplevvyeromzvcjf.supabase.co/storage/v1/object/public/media/8f07173c-b6bf-482a-8c2c-90efcd82d4f1/images/1754641465211_9e8xwhf2uqf.png";

console.log("Testing image URL:", testUrl);

fetch(testUrl)
  .then(response => {
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    console.log("URL accessible:", response.ok);
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });

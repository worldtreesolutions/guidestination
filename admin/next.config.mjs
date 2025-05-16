
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This ensures the admin portal can be deployed as a standalone app
  basePath: process.env.NODE_ENV === 'production' ? '/admin' : '',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  // Allow images from these domains
  images: {
    domains: ['images.unsplash.com', 'unsplash.com', 'pexels.com', 'pixabay.com', 'giphy.com', 'wikimedia.org']
  }
};

export default nextConfig;

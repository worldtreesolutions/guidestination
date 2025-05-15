
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'pexels.com'
      },
      {
        protocol: 'https',
        hostname: 'pixabay.com'
      },
      {
        protocol: 'https',
        hostname: 'giphy.com'
      },
      {
        protocol: 'https',
        hostname: 'wikimedia.org'
      }
    ]
  }
}

export default nextConfig

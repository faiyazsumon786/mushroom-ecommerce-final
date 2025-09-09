/** @type {import('next').NextConfig} */
const nextConfig = {
  // আপনার পুরনো images কনফিগারেশনটি এখানে থাকবে
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // --- নতুন এই অংশটি যোগ করুন ---
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // -----------------------------
};

module.exports = nextConfig;
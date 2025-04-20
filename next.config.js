/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dka575ofm4ao0.cloudfront.net',
        pathname: '/pages-transactional_logos/**',
      },
    ],
  },
};

module.exports = nextConfig; 
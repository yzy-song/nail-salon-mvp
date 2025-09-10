import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    // 还可以加上你常用的本地域名或其他IP
    '192.168.1.78', // 你的局域网IP
    '192.168.1.148', // 你的局域网IP
  ],
};

export default nextConfig;

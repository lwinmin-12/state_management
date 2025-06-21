import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'https://api.balldontlie.io/v1/:path*',
          },
        ]
      },
};

export default nextConfig;

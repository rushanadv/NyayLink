import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async redirects() {
    return [
      {
        source: "/login/client",
        destination: "/auth/login?intent=client",
        permanent: false,
      },
      {
        source: "/login/lawyer",
        destination: "/auth/login?intent=lawyer",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

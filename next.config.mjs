const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/v1/migrations": ["./infra/migrations/**/*"],
    },
  },
};

export default nextConfig;
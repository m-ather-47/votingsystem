/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/", // when user visits /
        destination: "/voter/login", // send them here
        permanent: true, // true = 308 permanent redirect, false = 307 temporary
      },
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

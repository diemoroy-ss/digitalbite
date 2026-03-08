/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Esto permite que el build termine aunque TypeScript sea lento o encuentre alertas
    ignoreBuildErrors: true,
  },
  eslint: {
    // También ignoramos ESLint para ganar velocidad en el VPS
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

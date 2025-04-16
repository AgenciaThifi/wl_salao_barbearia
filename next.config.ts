/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configura o diretório base para as páginas
  pagesDir: 'src/pages',
  // Você pode adicionar outras opções de configuração aqui
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.instagram.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

module.exports = nextConfig;

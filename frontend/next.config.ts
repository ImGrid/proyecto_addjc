import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // standalone genera una carpeta autocontenida para deployment en VM/Docker
  // Incluye solo los archivos necesarios sin depender de node_modules completo
  output: 'standalone',
};

export default nextConfig;

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 4321,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'seo-shenanigans-production.up.railway.app',
      '.up.railway.app'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4321,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'seo-shenanigans-production.up.railway.app',
      '.up.railway.app'
    ]
  }
});

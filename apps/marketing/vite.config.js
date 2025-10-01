import { defineConfig } from 'vite';
import { getAllowedHosts } from './config/allowed-hosts.mjs';

const allowedHosts = getAllowedHosts();

export default defineConfig({
  server: {
    host: true,
    port: process.env.PORT || 4321,
    allowedHosts
  },
  preview: {
    host: true,
    port: process.env.PORT || 4321,
    allowedHosts: [...allowedHosts, 'seo-shenanigans-production.up.railway.app']
  }
});

import { defineConfig } from 'vite';

const baseAllowedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '.up.railway.app'];

const envAllowedHosts = [
  process.env.RAILWAY_STATIC_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN,
  process.env.RAILWAY_PRIVATE_DOMAIN,
  process.env.RAILWAY_URL,
  process.env.URL,
  process.env.DEPLOY_URL,
  process.env.SITE,
  process.env.PUBLIC_ALLOWED_HOSTS,
  'seo-shenanigans-production.up.railway.app',
  'swedish-wedding-seo-production-af51.up.railway.app'
];

const normaliseHosts = (values) => {
  const hosts = new Set(baseAllowedHosts);

  values
    .flatMap((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return String(value)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    })
    .forEach((entry) => {
      try {
        // Accept bare hostnames and full URLs.
        const url = entry.includes('://') ? new URL(entry) : new URL(`http://${entry}`);
        hosts.add(url.host);
      } catch {
        hosts.add(entry);
      }
    });

  return Array.from(hosts);
};

const derivedAllowedHosts = normaliseHosts(envAllowedHosts);
const allowAllHosts = process.env.VITE_STRICT_ALLOWED_HOSTS === 'true' ? derivedAllowedHosts : true;

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 4321,
    allowedHosts: allowAllHosts
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4321,
    allowedHosts: allowAllHosts
  }
});

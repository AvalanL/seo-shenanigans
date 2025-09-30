const STATIC_HOSTS = [
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  '.up.railway.app',
  'seo-shenanigans-production.up.railway.app',
  'swedish-wedding-seo-production-af51.up.railway.app'
];

const ENV_HOST_SOURCES = [
  process.env.RAILWAY_STATIC_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN,
  process.env.RAILWAY_PRIVATE_DOMAIN,
  process.env.RAILWAY_URL,
  process.env.URL,
  process.env.DEPLOY_URL,
  process.env.SITE,
  process.env.PUBLIC_ALLOWED_HOSTS
];

const stripProtocol = (value) => value.replace(/^[a-z]+:\/\//i, '');

const stripPath = (value) => value.split('/')[0];

const stripPort = (value) => {
  if (value.startsWith('[')) {
    // IPv6 literals may include colons; keep the address intact.
    const closing = value.indexOf(']');
    return closing === -1 ? value : value.slice(0, closing + 1);
  }
  return value.split(':')[0];
};

const normaliseHost = (value) => stripPort(stripPath(stripProtocol(value)));

export const getAllowedHosts = () => {
  const hosts = new Set();

  for (const entry of [...STATIC_HOSTS, ...ENV_HOST_SOURCES]) {
    if (!entry) continue;

    const parts = Array.isArray(entry)
      ? entry
      : String(entry)
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

    for (const part of parts) {
      try {
        const candidate = normaliseHost(part);
        if (candidate) {
          hosts.add(candidate);
        }
      } catch {
        // Ignore malformed entries but keep the raw host as a fallback.
        hosts.add(part);
      }
    }
  }

  return Array.from(hosts);
};

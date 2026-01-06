/**
 * Cloudflare Worker for subdomain routing to Pages with Edge Caching
 *
 * This worker handles *.yourdomain.com and proxies to your Pages deployment.
 * Uses Cloudflare's edge cache to minimize Worker invocations.
 *
 * Setup:
 * 1. Create a Worker in Cloudflare dashboard
 * 2. Paste this code
 * 3. Add route: *.yourdomain.com/* (NOT the root domain)
 * 4. Set environment variables:
 *    - PAGES_DOMAIN: your-project.pages.dev
 *    - APP_DOMAIN: yourdomain.com
 *    - CACHE_TTL: 3600 (optional, default 1 hour)
 */

// Paths that should never be cached (authentication, API, forms)
const NO_CACHE_PATHS = [
  '/app',        // Admin panel
  '/sign_in',
  '/sign_out',
  '/auth',
  '/api',
];

// Check if path should bypass cache
function shouldBypassCache(pathname) {
  return NO_CACHE_PATHS.some(p => pathname.startsWith(p));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Only cache GET requests
    if (request.method !== 'GET') {
      return handleRequest(request, env, hostname, url);
    }

    // Skip cache for dynamic paths
    if (shouldBypassCache(url.pathname)) {
      return handleRequest(request, env, hostname, url);
    }

    // Create cache key based on full URL (includes subdomain)
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    // Check edge cache first
    let response = await cache.match(cacheKey);
    if (response) {
      // Cache HIT - return cached response (Worker still invoked but no origin fetch)
      return response;
    }

    // Cache MISS - fetch from origin
    response = await handleRequest(request, env, hostname, url);

    // Only cache successful responses
    if (response.status === 200) {
      const cacheTTL = parseInt(env.CACHE_TTL) || 3600; // Default 1 hour

      // Clone response and add cache headers
      const responseToCache = new Response(response.body, response);
      responseToCache.headers.set('Cache-Control', `public, max-age=${cacheTTL}`);

      // Store in edge cache (non-blocking)
      ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));

      return responseToCache;
    }

    return response;
  },
};

async function handleRequest(request, env, hostname, url) {
  const pagesUrl = env.PAGES_DOMAIN || 'your-project.pages.dev';
  const appDomain = env.APP_DOMAIN || 'yourdomain.com';

  // Extract subdomain
  let subdomain = null;
  if (hostname.endsWith(appDomain) && hostname !== appDomain && hostname !== `www.${appDomain}`) {
    subdomain = hostname.slice(0, -(appDomain.length + 1));
  }

  // If no subdomain, proxy as-is
  if (!subdomain) {
    const pagesRequestUrl = new URL(url.pathname + url.search, `https://${pagesUrl}`);
    return fetch(new Request(pagesRequestUrl, request));
  }

  // Rewrite path to /site/* for subdomain requests
  const sitePath = url.pathname === '/' ? '/site' : `/site${url.pathname}`;
  const pagesRequestUrl = new URL(sitePath + url.search, `https://${pagesUrl}`);

  // Clone headers and add X-Forwarded-Host
  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', hostname);

  const newRequest = new Request(pagesRequestUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'manual',
  });

  return fetch(newRequest);
}

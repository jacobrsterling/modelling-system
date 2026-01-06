/**
 * Cloudflare Worker for subdomain routing to Pages
 *
 * This worker handles *.yourdomain.com and proxies to your Pages deployment.
 * It rewrites paths to /site/* for subdomain requests.
 *
 * Setup:
 * 1. Create a Worker in Cloudflare dashboard
 * 2. Paste this code
 * 3. Add route: *.yourdomain.com/* (NOT the root domain)
 * 4. Set environment variables:
 *    - PAGES_DOMAIN: your-project.pages.dev
 *    - APP_DOMAIN: yourdomain.com
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Your configuration (set as environment variables in Worker settings)
    const pagesUrl = env.PAGES_DOMAIN || 'your-project.pages.dev';
    const appDomain = env.APP_DOMAIN || 'yourdomain.com';

    // Extract subdomain
    let subdomain = null;
    if (hostname.endsWith(appDomain) && hostname !== appDomain && hostname !== `www.${appDomain}`) {
      subdomain = hostname.slice(0, -(appDomain.length + 1)); // +1 for the dot
    }

    // If no subdomain (shouldn't happen if routes are configured correctly), proxy as-is
    if (!subdomain) {
      const pagesRequestUrl = new URL(url.pathname + url.search, `https://${pagesUrl}`);
      return fetch(new Request(pagesRequestUrl, request));
    }

    // Rewrite path to /site/* for subdomain requests
    // This matches the SvelteKit route structure
    const sitePath = url.pathname === '/' ? '/site' : `/site${url.pathname}`;
    const pagesRequestUrl = new URL(sitePath + url.search, `https://${pagesUrl}`);

    // Clone headers and add X-Forwarded-Host
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-Host', hostname);

    // Create new request
    const newRequest = new Request(pagesRequestUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'manual',
    });

    // Fetch from Pages
    const response = await fetch(newRequest);

    // Clone response to modify headers if needed
    const newResponse = new Response(response.body, response);

    return newResponse;
  },
};

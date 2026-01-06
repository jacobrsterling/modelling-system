import { PUBLIC_APP_DOMAIN } from "$env/static/public"
import type { Reroute } from "@sveltejs/kit"

/**
 * Extract subdomain from hostname for rerouting
 */
function extractSubdomain(hostname: string): string | null {
  const hostWithoutPort = hostname.split(':')[0]
  const appDomainWithoutPort = PUBLIC_APP_DOMAIN.split(':')[0]

  if (!hostWithoutPort.endsWith(appDomainWithoutPort)) {
    // Custom domain - will be handled by siteResolver in hooks.server.ts
    return '__custom__'
  }

  const subdomain = hostWithoutPort.slice(0, -(appDomainWithoutPort.length + 1))

  if (!subdomain || subdomain === 'www') {
    return null
  }

  return subdomain
}

/**
 * Reroute requests based on subdomain
 * - Main domain: normal routing
 * - Subdomain: route to /site/[...path]
 */
export const reroute: Reroute = ({ url }) => {
  const hostname = url.hostname + (url.port ? `:${url.port}` : '')
  const subdomain = extractSubdomain(hostname)

  // No subdomain = main domain, use normal routing
  if (!subdomain) {
    return url.pathname
  }

  // Subdomain or custom domain - reroute to /site/* internally
  // The actual path stays the same for the user
  const sitePath = url.pathname === '/' ? '/site' : `/site${url.pathname}`
  return sitePath
}

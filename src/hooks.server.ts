// src/hooks.server.ts
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
  PUBLIC_APP_DOMAIN,
} from "$env/static/public"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"
import type { Site } from "./app.d"

export const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" })
          })
        },
      },
    },
  )

  event.locals.supabaseServiceRole = createClient(
    PUBLIC_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } },
  )

  // https://github.com/supabase/auth-js/issues/888#issuecomment-2189298518
  if ("suppressGetSessionWarning" in event.locals.supabase.auth) {
    // @ts-expect-error - suppressGetSessionWarning is not part of the official API
    event.locals.supabase.auth.suppressGetSessionWarning = true
  } else {
    console.warn(
      "SupabaseAuthClient#suppressGetSessionWarning was removed. See https://github.com/supabase/auth-js/issues/888.",
    )
  }

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null, amr: null }
    }

    const {
      data: { user },
      error: userError,
    } = await event.locals.supabase.auth.getUser()
    if (userError) {
      // JWT validation has failed
      return { session: null, user: null, amr: null }
    }

    const { data: aal, error: amrError } =
      await event.locals.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (amrError) {
      return { session, user, amr: null }
    }

    return { session, user, amr: aal.currentAuthenticationMethods }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version"
    },
  })
}

// Not called for prerendered marketing pages so generally okay to call on ever server request
// Next-page CSR will mean relatively minimal calls to this hook
const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  return resolve(event)
}

/**
 * Extract subdomain from hostname
 * Examples:
 *   - "site1.lvh.me:5173" → "site1"
 *   - "site1.myapp.com" → "site1"
 *   - "lvh.me:5173" → null (main domain)
 *   - "www.myapp.com" → null (www is not a site)
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present for comparison
  const hostWithoutPort = hostname.split(':')[0]
  const appDomainWithoutPort = PUBLIC_APP_DOMAIN.split(':')[0]

  // Check if hostname ends with the app domain
  if (!hostWithoutPort.endsWith(appDomainWithoutPort)) {
    // Could be a custom domain - return special marker
    return `__custom__:${hostWithoutPort}`
  }

  // Extract the subdomain part
  const subdomain = hostWithoutPort.slice(0, -(appDomainWithoutPort.length + 1)) // +1 for the dot

  // No subdomain or www = main domain
  if (!subdomain || subdomain === 'www') {
    return null
  }

  return subdomain
}

/**
 * Resolve site from subdomain or custom domain
 */
const siteResolver: Handle = async ({ event, resolve }) => {
  // Initialize site as null
  event.locals.site = null

  // Check for X-Forwarded-Host header (set by Cloudflare Worker for subdomain routing)
  const forwardedHost = event.request.headers.get('X-Forwarded-Host')
  const hostname = forwardedHost || (event.url.hostname + (event.url.port ? `:${event.url.port}` : ''))
  const subdomainOrCustom = extractSubdomain(hostname)

  // No subdomain = main domain, no site resolution needed
  if (!subdomainOrCustom) {
    return resolve(event)
  }

  let site: Site | null = null

  if (subdomainOrCustom.startsWith('__custom__:')) {
    // Custom domain lookup
    const customDomain = subdomainOrCustom.slice('__custom__:'.length)
    const { data } = await event.locals.supabase
      .from('sites')
      .select('*')
      .eq('custom_domain', customDomain)
      .eq('status', 1) // Only active sites
      .single()
    site = data
  } else {
    // Subdomain lookup
    const { data } = await event.locals.supabase
      .from('sites')
      .select('*')
      .eq('subdomain', subdomainOrCustom)
      .eq('status', 1) // Only active sites
      .single()
    site = data
  }

  event.locals.site = site

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard, siteResolver)

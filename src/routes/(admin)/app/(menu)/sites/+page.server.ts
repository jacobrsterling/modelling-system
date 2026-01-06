import { redirect, fail } from "@sveltejs/kit"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({
  locals: { supabase, safeGetSession },
}) => {
  const { session } = await safeGetSession()
  if (!session) {
    redirect(303, "/")
  }

  const { data: sites, error } = await supabase
    .from("sites")
    .select("*")
    .order("reference", { ascending: true })

  if (error) {
    console.error("Error fetching sites:", error)
  }

  return {
    sites: sites || [],
  }
}

export const actions: Actions = {
  createSite: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession()
    if (!session) {
      redirect(303, "/")
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const subdomain = formData.get("subdomain") as string
    const customDomain = formData.get("customDomain") as string
    const status = parseInt(formData.get("status") as string) || 1

    // Validation
    if (!name || name.trim().length === 0) {
      return fail(400, {
        errorMessage: "Site name is required",
        errorFields: ["name"],
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    if (!subdomain || subdomain.trim().length === 0) {
      return fail(400, {
        errorMessage: "Subdomain is required",
        errorFields: ["subdomain"],
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    // Validate subdomain format (alphanumeric and hyphens, no leading/trailing hyphens)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
    if (!subdomainRegex.test(subdomain.trim().toLowerCase())) {
      return fail(400, {
        errorMessage: "Subdomain must be lowercase alphanumeric with hyphens (no leading/trailing hyphens)",
        errorFields: ["subdomain"],
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    // Validate custom domain format if provided
    if (customDomain && customDomain.trim().length > 0) {
      const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
      if (!domainRegex.test(customDomain.trim())) {
        return fail(400, {
          errorMessage: "Invalid domain format",
          errorFields: ["customDomain"],
          name,
          subdomain,
          customDomain,
          status,
        })
      }
    }

    const { error } = await supabase
      .from("sites")
      .insert({
        name: name.trim(),
        subdomain: subdomain.trim().toLowerCase(),
        custom_domain: customDomain?.trim() || null,
        status,
      })

    if (error) {
      console.error("Error creating site:", error)
      return fail(500, {
        errorMessage: error.message || "Failed to create site",
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    return {
      success: true,
      name,
    }
  },

  updateSite: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession()
    if (!session) {
      redirect(303, "/")
    }

    const formData = await request.formData()
    const siteId = formData.get("siteId") as string
    const name = formData.get("name") as string
    const subdomain = formData.get("subdomain") as string
    const customDomain = formData.get("customDomain") as string
    const status = parseInt(formData.get("status") as string)

    // Validation
    if (!name || name.trim().length === 0) {
      return fail(400, {
        errorMessage: "Site name is required",
        errorFields: ["name"],
        siteId,
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    if (!subdomain || subdomain.trim().length === 0) {
      return fail(400, {
        errorMessage: "Subdomain is required",
        errorFields: ["subdomain"],
        siteId,
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
    if (!subdomainRegex.test(subdomain.trim().toLowerCase())) {
      return fail(400, {
        errorMessage: "Subdomain must be lowercase alphanumeric with hyphens (no leading/trailing hyphens)",
        errorFields: ["subdomain"],
        siteId,
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    // Validate custom domain format if provided
    if (customDomain && customDomain.trim().length > 0) {
      const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
      if (!domainRegex.test(customDomain.trim())) {
        return fail(400, {
          errorMessage: "Invalid domain format",
          errorFields: ["customDomain"],
          siteId,
          name,
          subdomain,
          customDomain,
          status,
        })
      }
    }

    const { error } = await supabase
      .from("sites")
      .update({
        name: name.trim(),
        subdomain: subdomain.trim().toLowerCase(),
        custom_domain: customDomain?.trim() || null,
        status,
      })
      .eq("id", siteId)

    if (error) {
      console.error("Error updating site:", error)
      return fail(500, {
        errorMessage: error.message || "Failed to update site",
        siteId,
        name,
        subdomain,
        customDomain,
        status,
      })
    }

    return {
      success: true,
      siteId,
      name,
    }
  },

  deleteSite: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession()
    if (!session) {
      redirect(303, "/")
    }

    const formData = await request.formData()
    const siteId = formData.get("siteId") as string

    if (!siteId) {
      return fail(400, {
        errorMessage: "Site ID is required",
      })
    }

    const { error } = await supabase
      .from("sites")
      .delete()
      .eq("id", siteId)

    if (error) {
      console.error("Error deleting site:", error)
      return fail(500, {
        errorMessage: error.message || "Failed to delete site",
      })
    }

    return {
      success: true,
      deleted: true,
    }
  },
}

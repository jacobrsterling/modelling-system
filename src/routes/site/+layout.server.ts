import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals }) => {
  // If no site was resolved, show 404
  // This happens when accessing via subdomain but site doesn't exist or is inactive
  if (!locals.site) {
    throw error(404, {
      message: "Site not found",
    })
  }

  return {
    site: locals.site,
  }
}

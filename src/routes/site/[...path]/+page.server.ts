import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
  // The path parameter contains the rest of the URL
  // e.g., if user visits site1.example.com/about/team, path = "about/team"
  return {
    path: params.path,
  }
}

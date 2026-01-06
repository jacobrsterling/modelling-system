import { Session, SupabaseClient, type AMREntry } from "@supabase/supabase-js"
import { Database } from "./DatabaseDefinitions"

// Site type for multisite support
export type Site = {
  id: string
  reference: number
  name: string
  subdomain: string
  custom_domain: string | null
  status: number
  created_at: string
  updated_at: string
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      supabaseServiceRole: SupabaseClient<Database>
      safeGetSession: () => Promise<{
        session: Session | null
        user: User | null
        amr: AMREntry[] | null
      }>
      session: Session | null
      user: User | null
      // Multisite: populated when accessing via subdomain
      site: Site | null
    }
    interface PageData {
      session: Session | null
      site?: Site | null
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}

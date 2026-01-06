<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card"
  import { Alert, AlertDescription } from "$lib/components/ui/alert"

  let { data } = $props()
  let { supabase } = data

  onMount(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      // Redirect to app after successful login
      if (event === "SIGNED_IN") {
        // Small delay to ensure auth state is propagated
        setTimeout(() => {
          goto("/app")
        }, 100)
      }
    })

    return () => authListener.subscription.unsubscribe()
  })
</script>

<svelte:head>
  <title>Sign In - EP Dealer Portal</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <Card class="w-[400px]">
    <CardHeader>
      <CardTitle class="text-2xl font-bold text-center">EP Dealer Portal</CardTitle>
    </CardHeader>
    <CardContent>
      {#if $page.url.searchParams.get("verified") == "true"}
        <Alert class="mb-4">
          <AlertDescription>
            Email verified! Please sign in.
          </AlertDescription>
        </Alert>
      {/if}

      <Auth
        supabaseClient={data.supabase}
        view="sign_in"
        redirectTo={`${data.url}/auth/callback`}
        providers={oauthProviders}
        socialLayout="horizontal"
        showLinks={false}
        appearance={sharedAppearance}
        additionalData={undefined}
      />

      <div class="mt-4 space-y-2 text-center text-sm">
        <a href="/forgot_password" class="text-primary hover:underline block">
          Forgot password?
        </a>
        <div class="text-muted-foreground">
          Don't have an account?
          <a href="/sign_up" class="text-primary hover:underline ml-1">
            Create account
          </a>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

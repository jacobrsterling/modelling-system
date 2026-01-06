<script lang="ts">
  import type { PageData } from "./$types"
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card"
  import { Globe, Hash } from "lucide-svelte"

  let { data }: { data: PageData } = $props()
</script>

<div class="flex items-center justify-center min-h-screen p-4">
  <Card class="w-full max-w-md">
    <CardHeader class="text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Globe class="h-8 w-8 text-primary" />
      </div>
      <CardTitle class="text-2xl">{data.site.name}</CardTitle>
      <CardDescription>
        Welcome to this site
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-3 text-sm">
        <div class="flex items-center gap-2 text-muted-foreground">
          <Hash class="h-4 w-4" />
          <span>Site ID: #{data.site.reference}</span>
        </div>
        <div class="flex items-center gap-2 text-muted-foreground">
          <Globe class="h-4 w-4" />
          <span>Subdomain: {data.site.subdomain}</span>
        </div>
        {#if data.site.custom_domain}
          <div class="flex items-center gap-2 text-muted-foreground">
            <Globe class="h-4 w-4" />
            <span>Custom domain: {data.site.custom_domain}</span>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>
</div>

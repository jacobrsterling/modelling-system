<script lang="ts">
  import type { PageData } from "./$types"
  import { page } from "$app/stores"

  let { data }: { data: PageData } = $props()

  // Get the actual path the user sees (not the internal /site/... path)
  let currentPath = $derived($page.url.pathname)
</script>

<div class="flex items-center justify-center min-h-screen p-4">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">{data.site.name}</h1>
    <p class="text-muted-foreground mb-4">Page: {currentPath}</p>
    <p class="text-sm text-muted-foreground">
      This is a placeholder for site-specific pages.
    </p>
  </div>
</div>

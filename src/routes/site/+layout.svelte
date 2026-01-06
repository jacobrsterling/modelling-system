<script lang="ts">
  import "../../app.css"
  import type { LayoutData } from "./$types"

  let { data, children }: { data: LayoutData; children: any } = $props()
</script>

<svelte:head>
  <title>{data.site.name}</title>
</svelte:head>

<div class="min-h-screen bg-background">
  {@render children()}
</div>

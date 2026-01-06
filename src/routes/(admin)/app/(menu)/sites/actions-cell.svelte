<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Pencil, Trash2 } from "lucide-svelte"
  import { getContext } from "svelte"
  import type { Site } from "./columns"

  type Props = {
    site: Site
  }

  let { site }: Props = $props()

  const openEditDialog = getContext<(site: Site) => void>('openEditDialog')
  const openDeleteDialog = getContext<(site: Site) => void>('openDeleteDialog')
</script>

<div class="flex items-center gap-1">
  <Button
    variant="ghost"
    size="sm"
    onclick={() => openEditDialog(site)}
    title="Edit site"
  >
    <Pencil class="h-4 w-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    onclick={() => openDeleteDialog(site)}
    title="Delete site"
    class="text-red-600 hover:text-red-700 hover:bg-red-50"
  >
    <Trash2 class="h-4 w-4" />
  </Button>
</div>

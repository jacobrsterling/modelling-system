<script lang="ts">
  type Props = {
    status: number
  }

  let { status }: Props = $props()

  const statusConfig: Record<number, { label: string; class: string }> = {
    0: { label: "Inactive", class: "bg-gray-100 text-gray-700" },
    1: { label: "Active", class: "bg-green-100 text-green-700" },
  }

  const config = $derived(statusConfig[status] || statusConfig[0])
</script>

<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {config.class}">
  {config.label}
</span>

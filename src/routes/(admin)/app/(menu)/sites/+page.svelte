<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { Label } from "$lib/components/ui/label"
  import PageHeader from "$lib/components/page-header.svelte"
  import PageTitle from "$lib/components/page-title.svelte"
  import { Plus } from "lucide-svelte"
  import { enhance } from "$app/forms"
  import type { PageData, ActionData } from "./$types"
  import DataTable from "./data-table.svelte"
  import { columns, type Site } from "./columns"
  import { setContext } from "svelte"

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let dialogOpen = $state(false)
  let editDialogOpen = $state(false)
  let deleteDialogOpen = $state(false)
  let isSubmitting = $state(false)
  let editingSite = $state<Site | null>(null)
  let deletingSite = $state<Site | null>(null)

  let selectedStatus = $state("1")
  let editSelectedStatus = $state("1")

  function openEditDialog(site: Site) {
    editingSite = { ...site }
    editSelectedStatus = String(site.status)
    editDialogOpen = true
  }

  function openDeleteDialog(site: Site) {
    deletingSite = site
    deleteDialogOpen = true
  }

  // Set context for actions cell to access
  setContext('openEditDialog', openEditDialog)
  setContext('openDeleteDialog', openDeleteDialog)

  $effect(() => {
    if (form?.success) {
      dialogOpen = false
      editDialogOpen = false
      deleteDialogOpen = false
      editingSite = null
      deletingSite = null
      selectedStatus = "1"
    }
  })
</script>

<PageTitle title="Sites" />

<div class="space-y-6">
  <PageHeader title="Sites" description="Manage sites in your multisite network">
    {#snippet children()}
      <Dialog.Root bind:open={dialogOpen}>
        <Dialog.Trigger>
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            Add Site
          </Button>
        </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Create New Site</Dialog.Title>
          <Dialog.Description>
            Add a new site to your multisite network.
          </Dialog.Description>
        </Dialog.Header>
        <form
          method="POST"
          action="?/createSite"
          use:enhance={() => {
            isSubmitting = true
            return async ({ update }) => {
              await update()
              isSubmitting = false
            }
          }}
        >
          <div class="grid gap-4 py-4">
            {#if form?.errorMessage && !form?.siteId}
              <div class="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {form.errorMessage}
              </div>
            {/if}
            <div class="grid gap-2">
              <Label for="name">Site Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="My Site"
                value={form?.name || ""}
                required
                class={form?.errorFields?.includes("name") ? "border-red-500" : ""}
              />
            </div>
            <div class="grid gap-2">
              <Label for="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                name="subdomain"
                type="text"
                placeholder="my-site"
                value={form?.subdomain || ""}
                required
                class={form?.errorFields?.includes("subdomain") ? "border-red-500" : ""}
              />
              <p class="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
            <div class="grid gap-2">
              <Label for="customDomain">Custom Domain (optional)</Label>
              <Input
                id="customDomain"
                name="customDomain"
                type="text"
                placeholder="example.com"
                value={form?.customDomain || ""}
                class={form?.errorFields?.includes("customDomain") ? "border-red-500" : ""}
              />
              <p class="text-xs text-muted-foreground">
                Leave empty to use the subdomain only
              </p>
            </div>
            <div class="grid gap-2">
              <Label for="status">Status</Label>
              <select
                id="status"
                name="status"
                bind:value={selectedStatus}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
          <Dialog.Footer>
            <Button type="button" variant="outline" onclick={() => dialogOpen = false}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Site"}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
      </Dialog.Root>
    {/snippet}
  </PageHeader>

  <!-- Edit Site Dialog -->
  <Dialog.Root bind:open={editDialogOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Edit Site</Dialog.Title>
        <Dialog.Description>
          Update site information.
        </Dialog.Description>
      </Dialog.Header>
      <form
        method="POST"
        action="?/updateSite"
        use:enhance={() => {
          isSubmitting = true
          return async ({ update }) => {
            await update()
            isSubmitting = false
          }
        }}
      >
        <input type="hidden" name="siteId" value={editingSite?.id || ""} />
        <div class="grid gap-4 py-4">
          {#if form?.errorMessage && form?.siteId === editingSite?.id}
            <div class="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {form.errorMessage}
            </div>
          {/if}
          <div class="grid gap-2">
            <Label for="edit-name">Site Name</Label>
            <Input
              id="edit-name"
              name="name"
              type="text"
              placeholder="My Site"
              value={editingSite?.name || ""}
              required
              class={form?.errorFields?.includes("name") && form?.siteId === editingSite?.id ? "border-red-500" : ""}
            />
          </div>
          <div class="grid gap-2">
            <Label for="edit-subdomain">Subdomain</Label>
            <Input
              id="edit-subdomain"
              name="subdomain"
              type="text"
              placeholder="my-site"
              value={editingSite?.subdomain || ""}
              required
              class={form?.errorFields?.includes("subdomain") && form?.siteId === editingSite?.id ? "border-red-500" : ""}
            />
            <p class="text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="edit-customDomain">Custom Domain (optional)</Label>
            <Input
              id="edit-customDomain"
              name="customDomain"
              type="text"
              placeholder="example.com"
              value={editingSite?.custom_domain || ""}
              class={form?.errorFields?.includes("customDomain") && form?.siteId === editingSite?.id ? "border-red-500" : ""}
            />
          </div>
          <div class="grid gap-2">
            <Label for="edit-status">Status</Label>
            <select
              id="edit-status"
              name="status"
              bind:value={editSelectedStatus}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>
        <Dialog.Footer>
          <Button type="button" variant="outline" onclick={() => editDialogOpen = false}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Delete Site Confirmation -->
  <Dialog.Root bind:open={deleteDialogOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Delete Site</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete "{deletingSite?.name}"? This action cannot be undone.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => deleteDialogOpen = false}>
          Cancel
        </Button>
        <form
          method="POST"
          action="?/deleteSite"
          use:enhance={() => {
            isSubmitting = true
            return async ({ update }) => {
              await update()
              isSubmitting = false
            }
          }}
          class="inline"
        >
          <input type="hidden" name="siteId" value={deletingSite?.id || ""} />
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </form>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <Card>
    <CardHeader>
      <CardTitle>All Sites</CardTitle>
      <CardDescription>
        Total sites: {data.sites.length}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <DataTable data={data.sites} {columns} />
    </CardContent>
  </Card>
</div>

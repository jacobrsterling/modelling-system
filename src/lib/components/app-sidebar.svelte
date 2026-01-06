<script lang="ts">
  import { Home, Settings, LogOut, BarChart3, Users, AlertCircle, ScrollText, UserCircle, Globe } from "lucide-svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Button } from "$lib/components/ui/button";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";

  interface Props {
    variant?: "sidebar" | "floating" | "inset";
    siteTitle?: string;
  }

  let { variant = "sidebar", siteTitle = "App" }: Props = $props();
  let currentPath = $derived($page.url.pathname);
  let isImpersonating = $derived($page.data.isImpersonating);
  let originalUserEmail = $derived($page.data.originalUserEmail);
  let currentUserEmail = $derived($page.data.session?.user?.email);

  const sidebar = useSidebar();

  function navigate(url: string) {
    return (e: MouseEvent) => {
      e.preventDefault();
      goto(url);
      // Close mobile sidebar after navigation
      if (sidebar.isMobile) {
        sidebar.setOpenMobile(false);
      }
    };
  }
</script>

<Sidebar.Root {variant}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href="/" onclick={navigate("/")} {...props}>
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{siteTitle}</span>
                <span class="truncate text-xs text-muted-foreground">Under development</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={currentPath === "/app"}>
              {#snippet child({ props })}
                <a href="/app" onclick={navigate("/app")} {...props}>
                  <Home class="size-4" />
                  <span>Dashboard</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={currentPath.includes("/users")}>
              {#snippet child({ props })}
                <a href="/app/users" onclick={navigate("/app/users")} {...props}>
                  <Users class="size-4" />
                  <span>Users</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={currentPath.includes("/sites")}>
              {#snippet child({ props })}
                <a href="/app/sites" onclick={navigate("/app/sites")} {...props}>
                  <Globe class="size-4" />
                  <span>Sites</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={currentPath.includes("/logs")}>
              {#snippet child({ props })}
                <a href="/app/logs" onclick={navigate("/app/logs")} {...props}>
                  <ScrollText class="size-4" />
                  <span>Logs</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={currentPath === "/app/settings"}>
              {#snippet child({ props })}
                <a href="/app/settings" onclick={navigate("/app/settings")} {...props}>
                  <Settings class="size-4" />
                  <span>Settings</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton isActive={currentPath === "/app/account" || currentPath.startsWith("/app/account/")}>
              {#snippet child({ props })}
                <a href="/app/account" onclick={navigate("/app/account")} {...props}>
                  <UserCircle class="size-4" />
                  <span>Account</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer>
    {#if isImpersonating}
      <div class="px-3 py-2 mb-2">
        <div class="bg-amber-100 border border-amber-300 rounded-lg p-3 space-y-2">
          <div class="flex items-start gap-2">
            <AlertCircle class="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-amber-900">Impersonating</p>
              <p class="text-xs text-amber-700 truncate">{currentUserEmail}</p>
            </div>
          </div>
          <form method="POST" action="/app/users?/stopImpersonation" use:enhance class="w-full">
            <Button type="submit" variant="outline" size="sm" class="w-full text-xs h-7">
              Stop
            </Button>
          </form>
        </div>
      </div>
    {/if}
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton>
          {#snippet child({ props })}
            <a href="/app/sign_out" onclick={navigate("/app/sign_out")} {...props}>
              <LogOut class="size-4" />
              <span>Sign Out</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>

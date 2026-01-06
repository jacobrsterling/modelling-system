<script lang="ts" generics="TData, TValue">
  import {
    type ColumnDef,
    type PaginationState,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
  } from "@tanstack/table-core"
  import { Input } from "$lib/components/ui/input"
  import { Button } from "$lib/components/ui/button"
  import * as Table from "$lib/components/ui/table"
  import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table"
  import { Search, ChevronLeft, ChevronRight } from "lucide-svelte"

  type DataTableProps<TData, TValue> = {
    data: TData[]
    columns: ColumnDef<TData, TValue>[]
  }

  let { data, columns }: DataTableProps<TData, TValue> = $props()

  let sorting = $state<SortingState>([])
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 50 })
  let globalFilter = $state("")

  function globalFilterFn(row: any, columnId: string, filterValue: string) {
    const searchValue = filterValue.toLowerCase()

    const allValues = row.getAllCells().map((cell: any) => {
      const value = cell.getValue()
      return String(value || '').toLowerCase()
    })

    return allValues.some(val => val.includes(searchValue))
  }

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: globalFilterFn,
    state: {
      get sorting() {
        return sorting
      },
      get pagination() {
        return pagination
      },
      get globalFilter() {
        return globalFilter
      },
    },
    onSortingChange: (updater) => {
      if (updater instanceof Function) {
        sorting = updater(sorting)
      } else {
        sorting = updater
      }
    },
    onPaginationChange: (updater) => {
      if (updater instanceof Function) {
        pagination = updater(pagination)
      } else {
        pagination = updater
      }
    },
    onGlobalFilterChange: (updater) => {
      if (updater instanceof Function) {
        globalFilter = updater(globalFilter)
      } else {
        globalFilter = updater
      }
    },
  })
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="relative">
        <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search sites..."
          value={globalFilter ?? ""}
          oninput={(e) => table.setGlobalFilter(e.currentTarget.value)}
          class="pl-8 w-[300px]"
        />
      </div>
    </div>
  </div>

  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup}
          <Table.Row>
            {#each headerGroup.headers as header}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#if table.getRowModel().rows?.length}
          {#each table.getRowModel().rows as row}
            <Table.Row>
              {#each row.getVisibleCells() as cell}
                <Table.Cell class={cell.column.columnDef.meta?.cellClass}>
                  <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                </Table.Cell>
              {/each}
            </Table.Row>
          {/each}
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
              No sites found
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex items-center justify-between">
    <div class="text-sm text-muted-foreground">
      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      ({table.getFilteredRowModel().rows.length} total sites)
    </div>
    <div class="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanPreviousPage()}
        onclick={() => table.previousPage()}
      >
        <ChevronLeft class="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanNextPage()}
        onclick={() => table.nextPage()}
      >
        Next
        <ChevronRight class="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
</div>

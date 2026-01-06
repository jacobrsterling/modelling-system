import type { ColumnDef } from "@tanstack/table-core"
import { formatDate } from "$lib/utils"
import { renderComponent } from "$lib/components/ui/data-table"
import StatusBadge from "./status-badge.svelte"
import ActionsCell from "./actions-cell.svelte"

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

export const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "reference",
    header: "ID",
    cell: ({ row }) => `#${row.getValue("reference")}`,
    meta: {
      cellClass: "font-mono text-muted-foreground"
    }
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.getValue("name"),
    meta: {
      cellClass: "font-medium"
    }
  },
  {
    accessorKey: "subdomain",
    header: "Subdomain",
    cell: ({ row }) => row.getValue("subdomain"),
    meta: {
      cellClass: "font-mono text-sm"
    }
  },
  {
    accessorKey: "custom_domain",
    header: "Custom Domain",
    cell: ({ row }) => row.getValue("custom_domain") || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as number
      return renderComponent(StatusBadge, { status })
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
    meta: {
      cellClass: "text-sm"
    }
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => formatDate(row.getValue("updated_at")),
    meta: {
      cellClass: "text-sm"
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return renderComponent(ActionsCell, { site: row.original })
    },
  },
]

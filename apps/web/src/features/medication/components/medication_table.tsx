import { Link } from '@tanstack/react-router'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArchiveIcon, ChevronDownIcon, ChevronUpIcon, MoreHorizontalIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Frame, FrameFooter } from '@/components/ui/frame'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToggleArchiveMedicationMutation } from '../mutations'
import type { Medication } from '../types'

const columns: ColumnDef<Medication>[] = [
  {
    accessorKey: 'id',
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground">#{row.getValue('id')}</div>
    ),
    header: '#',
    size: 60,
  },
  {
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className="font-medium">
        <Link
          to="/dashboard/medications/$medicationId"
          params={{ medicationId: row.original.id.toString() }}
          className="hover:underline"
        >
          {row.getValue('name')}
        </Link>
      </div>
    ),
    header: 'Nom',
    size: 180,
  },
  {
    accessorKey: 'dosage',
    header: 'Dosage',
  },
  {
    accessorKey: 'form',
    header: 'Forme',
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    size: 80,
    cell: ({ row }) => {
      const { mutate: toggleArchive, isPending } = useToggleArchiveMedicationMutation(
        row.original.active
      )

      return (
        <div className="flex flex-row flex-wrap justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            onClick={() => toggleArchive(row.original.id)}
          >
            <ArchiveIcon />
          </Button>
        </div>
      )
    },
  },
]

interface MedicationTableProps {
  data: Medication[]
}

export function MedicationTable({ data }: MedicationTableProps) {
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: false,
      id: 'id',
    },
  ])

  const table = useReactTable({
    columns,
    data: data,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  })

  return (
    <Card className="p-0">
      <CardPanel className="p-0">
        <Frame className="w-full bg-transparent">
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnSize = header.column.getSize()
                    return (
                      <TableHead
                        key={header.id}
                        style={columnSize ? { width: `${columnSize}px` } : undefined}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                header.column.getToggleSortingHandler()?.(e)
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: (
                                <ChevronUpIcon
                                  aria-hidden="true"
                                  className="size-4 shrink-0 opacity-72"
                                />
                              ),
                              desc: (
                                <ChevronDownIcon
                                  aria-hidden="true"
                                  className="size-4 shrink-0 opacity-72"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow data-state={row.getIsSelected() ? 'selected' : undefined} key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={columns.length}>
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <MoreHorizontalIcon />
                        </EmptyMedia>
                        <EmptyTitle>Pas encore de médicaments</EmptyTitle>
                        <EmptyDescription>
                          Utilisez le formulaire ci-dessous pour ajouter vos médicaments.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <FrameFooter className="p-2">
            <div className="flex items-center justify-between gap-2">
              {/* Results range selector */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <p className="text-muted-foreground text-sm">Voir</p>
                <Select
                  items={Array.from({ length: table.getPageCount() }, (_, i) => {
                    const start = i * table.getState().pagination.pageSize + 1
                    const end = Math.min(
                      (i + 1) * table.getState().pagination.pageSize,
                      table.getRowCount()
                    )
                    const pageNum = i + 1
                    return { label: `${start}-${end}`, value: pageNum }
                  })}
                  onValueChange={(value) => {
                    table.setPageIndex((value as number) - 1)
                  }}
                  value={table.getState().pagination.pageIndex + 1}
                >
                  <SelectTrigger
                    aria-label="Select result range"
                    className="w-fit min-w-none"
                    size="sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {Array.from({ length: table.getPageCount() }, (_, i) => {
                      const start = i * table.getState().pagination.pageSize + 1
                      const end = Math.min(
                        (i + 1) * table.getState().pagination.pageSize,
                        table.getRowCount()
                      )
                      const pageNum = i + 1
                      return (
                        <SelectItem key={pageNum} value={pageNum}>
                          {`${start}-${end}`}
                        </SelectItem>
                      )
                    })}
                  </SelectPopup>
                </Select>
                <p className="text-muted-foreground text-sm">
                  sur <strong className="font-medium text-foreground">{table.getRowCount()}</strong>{' '}
                  résultats
                </p>
              </div>

              {/* Pagination */}
              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="sm:*:[svg]:hidden"
                      render={
                        <Button
                          disabled={!table.getCanPreviousPage()}
                          onClick={() => table.previousPage()}
                          size="sm"
                          variant="outline"
                        />
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className="sm:*:[svg]:hidden"
                      render={
                        <Button
                          disabled={!table.getCanNextPage()}
                          onClick={() => table.nextPage()}
                          size="sm"
                          variant="outline"
                        />
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </FrameFooter>
        </Frame>
      </CardPanel>
    </Card>
  )
}

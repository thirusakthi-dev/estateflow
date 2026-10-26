"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import {
  Search,
  X,
  FileSpreadsheet,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  FilterX,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";

import { compareValues, downloadExcel } from "./data-table-utils";

import type { DataTableProps, DataTableColumn } from "./data-table-types";

type SortState = {
  columnId: string;
  direction: "asc" | "desc";
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  filters = [],
  actions = [],
  toolbar,
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no records to display.",
  emptyIcon = Inbox,
  emptyAction,
  pagination,
  exportable = true,
  exportFileName = "export",
  minWidth = "850px",
  rowActions,
  onSearchChange,
  onFiltersChange,
}: DataTableProps<T>) {
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState | null>(null);
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(10);

  const serverPaginated = Boolean(pagination);

  const hasActiveFilters =
    search.trim().length > 0 || Object.values(filterValues).some(Boolean);

  const resetPage = () => {
    setLocalPage(1);

    if (serverPaginated) {
      pagination?.onPageChange(1);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterValues({});
    setSort(null);
    setLocalPage(1);

    onSearchChange?.("");
    onFiltersChange?.({});

    if (serverPaginated) {
      pagination?.onPageChange(1);
    }
  };

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = data.filter((row) => {
      const matchesSearch =
        !query ||
        (searchKeys
          ? searchKeys.some((key) =>
              String(row[key] ?? "")
                .toLowerCase()
                .includes(query),
            )
          : columns.some((column) => {
              if (column.searchable === false) return false;

              const value = column.accessor
                ? row[column.accessor]
                : column.exportValue?.(row);

              return String(value ?? "")
                .toLowerCase()
                .includes(query);
            }));

      const matchesFilters = filters.every((filter) => {
        const selectedValue = filterValues[filter.id];

        return (
          !selectedValue || String(filter.getValue(row) ?? "") === selectedValue
        );
      });

      return matchesSearch && matchesFilters;
    });

    if (!sort) return result;

    const column = columns.find((item) => item.id === sort.columnId);

    if (!column) return result;

    return [...result].sort((first, second) => {
      const getValue = (row: T) => {
        if (column.sortValue) {
          return column.sortValue(row);
        }

        if (column.accessor) {
          return row[column.accessor] as
            | string
            | number
            | Date
            | null
            | undefined;
        }

        return undefined;
      };

      const comparison = compareValues(getValue(first), getValue(second));

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [data, search, searchKeys, columns, filters, filterValues, sort]);

  const pageSize = serverPaginated
    ? (pagination?.pageSize ?? 10)
    : localPageSize;

  const currentPage = serverPaginated ? pagination!.page : localPage;

  const totalPages = serverPaginated
    ? Math.max(1, pagination!.totalPages)
    : Math.max(1, Math.ceil(filteredData.length / localPageSize));

  const totalRecords = serverPaginated
    ? (pagination!.totalRecords ?? data.length)
    : filteredData.length;

  const displayedData = serverPaginated
    ? filteredData
    : filteredData.slice((localPage - 1) * pageSize, localPage * pageSize);

  const startRecord =
    displayedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(
    (currentPage - 1) * pageSize + displayedData.length,
    totalRecords,
  );

  const changeSearch = (value: string) => {
    setSearch(value);
    resetPage();
    onSearchChange?.(value);
  };

  const changeFilter = (filterId: string, value: string) => {
    const nextValues = {
      ...filterValues,
      [filterId]: value,
    };

    setFilterValues(nextValues);
    resetPage();
    onFiltersChange?.(nextValues);
  };

  const changeSort = (column: DataTableColumn<T>) => {
    const sortable =
      column.sortable ?? Boolean(column.accessor || column.sortValue);

    if (!sortable) return;

    setSort((previous) => {
      if (previous?.columnId !== column.id) {
        return {
          columnId: column.id,
          direction: "asc",
        };
      }

      if (previous.direction === "asc") {
        return {
          columnId: column.id,
          direction: "desc",
        };
      }

      return null;
    });

    resetPage();
  };

  const changePageSize = (value: string) => {
    const nextSize = Number(value);

    if (!Number.isFinite(nextSize) || nextSize <= 0) return;

    if (serverPaginated) {
      pagination?.onPageSizeChange?.(nextSize);
      pagination?.onPageChange(1);
    } else {
      setLocalPageSize(nextSize);
      setLocalPage(1);
    }
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    if (serverPaginated) {
      pagination?.onPageChange(nextPage);
    } else {
      setLocalPage(nextPage);
    }
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      toast.warning({
        title: "Nothing to export",
        description: "No matching records are available.",
      });
      return;
    }

    try {
      downloadExcel(filteredData, columns, exportFileName);

      toast.success({
        title: "Export completed",
        description: `${filteredData.length} records exported.`,
      });
    } catch {
      toast.error({
        title: "Export failed",
        description: "Unable to export records. Please try again.",
      });
    }
  };

  const iconButtonClass =
    "inline-flex size-9 shrink-0 items-center justify-center " +
    "rounded-lg border border-border bg-background " +
    "text-muted-foreground shadow-sm transition-colors " +
    "hover:bg-surface hover:text-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-ring disabled:cursor-not-allowed " +
    "disabled:opacity-50";

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    row: T,
  ) => {
    if (!onRowClick) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };

  const hasResults = displayedData.length > 0;

  return (
    <div className="w-full min-w-0 space-y-3">
      {/* Search */}
      {searchable && (
        <div className="relative w-full min-w-0">
          <Input
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={Search}
            aria-label={searchPlaceholder}
            className={search ? "pr-10" : undefined}
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              title="Clear search"
              onClick={() => changeSearch("")}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      {/* Filters and actions */}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="w-full min-w-0 sm:w-auto sm:min-w-[130px] sm:max-w-[190px]"
            >
              <Select
                value={filterValues[filter.id] ?? ""}
                onChange={(value) => changeFilter(filter.id, value)}
                options={[
                  {
                    label: `All ${filter.label}`,
                    value: "",
                  },
                  ...filter.options,
                ]}
                placeholder={`All ${filter.label}`}
                clearable
              />
            </div>
          ))}

          {hasActiveFilters && (
            <Tooltip content="Clear search and filters">
              <button
                type="button"
                aria-label="Clear search and filters"
                onClick={clearFilters}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FilterX className="size-4" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            </Tooltip>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {toolbar}

          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Tooltip key={action.label} content={action.label}>
                <button
                  type="button"
                  aria-label={action.label}
                  title={action.label}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={iconButtonClass}
                >
                  {Icon && <Icon className="size-4" aria-hidden="true" />}
                </button>
              </Tooltip>
            );
          })}

          {exportable && (
            <Tooltip content="Export Excel">
              <button
                type="button"
                aria-label="Export Excel"
                title="Export Excel"
                onClick={exportToExcel}
                disabled={loading || !hasResults}
                className={iconButtonClass}
              >
                <FileSpreadsheet
                  className="size-4 text-emerald-500"
                  aria-hidden="true"
                />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Table */}
      <Card padding="none" animated={false}>
        <div className="min-h-[420px] w-full min-w-0">
          {loading ? (
            <div
              className="min-h-[420px] space-y-5 p-5"
              aria-label="Loading table"
              aria-busy="true"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton variant="text" width="22%" />
                  <Skeleton variant="text" width="28%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="15%" />
                </div>
              ))}
            </div>
          ) : !hasResults ? (
            <div className="flex min-h-[420px] items-center justify-center p-5">
              {hasActiveFilters ? (
                <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <FilterX className="size-6 text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                      No matching records
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try changing your search or filters.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={FilterX}
                    onClick={clearFilters}
                  >
                    Clear search &amp; filters
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  icon={emptyIcon}
                  actionLabel={emptyAction?.label}
                  onAction={emptyAction?.onClick}
                />
              )}
            </div>
          ) : (
            <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-border">
              <table
                className="w-full border-separate border-spacing-0 text-left text-sm"
                style={{ minWidth }}
              >
                <thead className="text-muted-foreground">
                  <tr>
                    {columns.map((column) => {
                      const sortable =
                        column.sortable ??
                        Boolean(column.accessor || column.sortValue);

                      const activeSort = sort?.columnId === column.id;

                      return (
                        <th
                          key={column.id}
                          scope="col"
                          className={[
                            "sticky top-0 z-20 whitespace-nowrap",
                            "border-b border-border bg-surface",
                            "px-4 py-3 font-medium",
                            column.headerClassName ?? "",
                          ].join(" ")}
                        >
                          {sortable ? (
                            <button
                              type="button"
                              onClick={() => changeSort(column)}
                              className="inline-flex items-center gap-2 text-left hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={`Sort by ${column.header}`}
                            >
                              {column.header}

                              {activeSort ? (
                                sort.direction === "asc" ? (
                                  <ArrowUp className="size-3.5 shrink-0 text-sky-500" />
                                ) : (
                                  <ArrowDown className="size-3.5 shrink-0 text-sky-500" />
                                )
                              ) : (
                                <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
                              )}
                            </button>
                          ) : (
                            column.header
                          )}
                        </th>
                      );
                    })}

                    {rowActions && (
                      <th
                        scope="col"
                        className="sticky right-0 top-0 z-30 w-20 border-b border-l border-border bg-surface px-3 py-3 text-right font-medium"
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {displayedData.map((row) => (
                    <tr
                      key={getRowId(row)}
                      onClick={() => onRowClick?.(row)}
                      onKeyDown={(event) => handleRowKeyDown(event, row)}
                      tabIndex={onRowClick ? 0 : undefined}
                      className={[
                        "group h-16 transition-colors hover:bg-surface/60",
                        onRowClick
                          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                          : "",
                      ].join(" ")}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={[
                            "border-b border-border px-4 py-3.5",
                            "align-middle text-foreground",
                            column.className ?? "",
                          ].join(" ")}
                        >
                          {column.cell
                            ? column.cell(row)
                            : column.accessor
                              ? String(row[column.accessor] ?? "—")
                              : "—"}
                        </td>
                      ))}

                      {rowActions && (
                        <td
                          className="sticky right-0 z-10 w-20 border-b border-l border-border bg-background px-3 py-2 text-right group-hover:bg-surface"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="flex flex-col gap-3 border-t border-border bg-surface/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <p>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {startRecord}
                </span>
                {"–"}
                <span className="font-medium text-foreground">{endRecord}</span>
                {" of "}
                <span className="font-medium text-foreground">
                  {totalRecords}
                </span>{" "}
                records
              </p>

              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap">Rows per page</span>

                <div className="w-20">
                  <Select
                    value={String(pageSize)}
                    onChange={changePageSize}
                    options={(pagination?.pageSizeOptions ?? [10, 25, 50]).map(
                      (size) => ({
                        label: String(size),
                        value: String(size),
                      }),
                    )}
                    disabled={serverPaginated && !pagination?.onPageSizeChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={ChevronLeft}
                  disabled={currentPage <= 1 || pagination?.disabled || loading}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  rightIcon={ChevronRight}
                  disabled={
                    currentPage >= totalPages || pagination?.disabled || loading
                  }
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

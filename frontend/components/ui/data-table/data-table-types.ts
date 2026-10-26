import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  exportValue?: (row: T) => string | number | boolean | null;
  searchable?: boolean;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date | null | undefined;
  className?: string;
  headerClassName?: string;
};

export type DataTableFilter<T> = {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  getValue: (row: T) => string | null | undefined;
};

export type DataTableAction = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  disabled?: boolean;
};

export type DataTablePagination = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  totalRecords?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;

  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];

  filters?: DataTableFilter<T>[];
  actions?: DataTableAction[];
  toolbar?: ReactNode;

  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };

  pagination?: DataTablePagination;

  exportable?: boolean;
  exportFileName?: string;
  minWidth?: string;

  rowActions?: (row: T) => ReactNode;

  onRefresh?: () => void | Promise<void>;
  onSearchChange?: (value: string) => void;
  onFiltersChange?: (values: Record<string, string>) => void;
};

"use client";

import { Search, X, FilterX } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type SearchFilterOption = {
  label: string;
  value: string;
};

export type SearchFilter = {
  key: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchFilterOption[];
  label: string;
  placeholder?: string;
  ariaLabel?: string;
};

type SearchFilterToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  filters?: SearchFilter[];
  onClear: () => void;
  hasFilters?: boolean;
};

export function SearchFilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchLabel = "Search",
  filters = [],
  onClear,
  hasFilters,
}: SearchFilterToolbarProps) {
  const hasActiveFilters =
    hasFilters ??
    Boolean(search.trim() || filters.some((filter) => filter.value));

  return (
    <div className="w-full min-w-0 space-y-3">
      {/* Search */}
      <div className="relative w-full min-w-0">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          leftIcon={Search}
          aria-label={searchLabel}
          className={search ? "pr-10" : undefined}
        />

        {search && (
          <button
            type="button"
            aria-label="Clear search"
            title="Clear search"
            onClick={() => onSearchChange("")}
            className={[
              "absolute right-2 top-1/2 flex size-7 -translate-y-1/2",
              "items-center justify-center rounded-md",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring",
            ].join(" ")}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <div
              key={filter.key}
              className="w-full min-w-0 sm:w-auto sm:min-w-[130px] sm:max-w-[190px]"
            >
              <Select
                value={filter.value}
                onChange={filter.onChange}
                options={[
                  {
                    label: `All ${filter.label}`,
                    value: "",
                  },
                  ...filter.options.filter((option) => option.value !== ""),
                ]}
                placeholder={filter.placeholder ?? `All ${filter.label}`}
                aria-label={filter.ariaLabel ?? filter.label}
                clearable
              />
            </div>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              aria-label="Clear search and filters"
              title="Clear search and filters"
              onClick={onClear}
              className={[
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2",
                "text-sm text-muted-foreground",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring",
              ].join(" ")}
            >
              <FilterX className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

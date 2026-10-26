"use client";

import { FilterX, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type ListFilterOption = {
  label: string;
  value: string;
};

export type ListFilterConfig = {
  key: string;
  value: string;
  onChange: (value: string) => void;
  options: ListFilterOption[];
  placeholder: string;
  ariaLabel: string;
};

type ListFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  filters?: ListFilterConfig[];
  onClear: () => void;
  hasFilters: boolean;
  clearLabel?: string;
  className?: string;
};

export function ListFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchLabel = "Search items",
  filters = [],
  onClear,
  hasFilters,
  clearLabel = "Clear filters",
  className = "",
}: ListFiltersProps) {
  return (
    <div
      className={[
        "w-full rounded-2xl border border-border bg-background p-4",
        className,
      ].join(" ")}
    >
      <div className="space-y-3">
        {/* Search always occupies its own row */}
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          leftIcon={Search}
          aria-label={searchLabel}
          containerClassName="w-full"
        />

        {/* Compact filter row */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <div key={filter.key} className="w-full sm:w-40">
                <Select
                  value={filter.value}
                  onChange={filter.onChange}
                  options={filter.options}
                  placeholder={filter.placeholder}
                  aria-label={filter.ariaLabel}
                />
              </div>
            ))}
          </div>
        )}

        {hasFilters && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              leftIcon={FilterX}
            >
              {clearLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

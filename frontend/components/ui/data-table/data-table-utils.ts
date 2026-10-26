import * as XLSX from "xlsx";
import type { DataTableColumn } from "./data-table-types";

export function compareValues(
  first: string | number | Date | null | undefined,
  second: string | number | Date | null | undefined,
) {
  if (first == null && second == null) return 0;
  if (first == null) return 1;
  if (second == null) return -1;

  const a = first instanceof Date ? first.getTime() : first;
  const b = second instanceof Date ? second.getTime() : second;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function downloadExcel<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  fileName: string,
) {
  const exportRows = rows.map((row) =>
    Object.fromEntries(
      columns.map((column) => {
        const value = column.exportValue
          ? column.exportValue(row)
          : column.accessor
            ? row[column.accessor]
            : "";

        return [column.header, value ?? ""];
      }),
    ),
  );

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

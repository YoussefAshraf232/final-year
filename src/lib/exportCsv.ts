export interface CsvColumn<T> {
  label: string;
  value: (row: T) => string | number | null | undefined;
}

const escapeCsvValue = (value: string | number | null | undefined) => {
  const normalized = value == null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

export function downloadCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]) {
  if (typeof window === "undefined") return;

  const header = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const body = rows
    .map((row) => columns.map((column) => escapeCsvValue(column.value(row))).join(","))
    .join("\n");
  const csv = [header, body].filter(Boolean).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get initials from a name (e.g., "John Doe" 101D)
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Sleep helper (useful for testing loading states)
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate a query string from an object
export function toQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (filtered.length === 0) return "";
  return "?" + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString();
}

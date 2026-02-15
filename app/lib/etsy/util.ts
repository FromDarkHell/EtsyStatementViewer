import { EtsyCSVRow } from "@/app/types/etsy";
import { parseISO, parse } from "date-fns";

export function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr === "--") return 0;
  const cleaned = amountStr.replace(/[$,]/g, "");
  return parseFloat(cleaned) || 0;
}

export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  try {
    // Try parsing "Month DD, YYYY" format
    return parse(dateStr, "MMMM dd, yyyy", new Date());
  } catch {
    try {
      return parse(dateStr, "MMM dd, yyyy", new Date());
    } catch {
      // Fallback to ISO parsing
      return parseISO(dateStr);
    }
  }
}

export function extractOrderNumber(row: EtsyCSVRow): string | undefined {
  let match = row.Info.match(/Order #(\d+)/);
  if (match) return match[1];

  match = row.Title.match(/Order #(\d+)/);
  if (match) return match[1];

  return undefined;
}

export function extractListingNumber(row: EtsyCSVRow): string | undefined {
  let match = row.Info.match(/Listing #(\d+)/);
  if (match) return match[1];

  match = row.Title.match(/Listing#(\d+)/);
  if (match) return match[1];

  return undefined;
}

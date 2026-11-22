import { Guest } from "@/types/event-form";

/**
 * Guest names may contain commas. Spreadsheet CSV exports wrap those cells
 * in quotes, so a row cannot be split on every comma.
 * If the name was saved without quotes, the last phone-like column is the
 * number and the earlier columns are joined back into the name.
 */
export function parseGuestCsv(text: string): Guest[] {
  const guests: Guest[] = [];

  for (const cells of parseCsvRows(text)) {
    const fields = cells.map((cell) => cell.trim());
    while (fields.length > 0 && fields[fields.length - 1] === "") fields.pop();
    while (fields.length > 0 && fields[0] === "") fields.shift();
    if (fields.length < 2) continue;

    let name: string;
    let whatsappNumber: string;

    if (fields.length > 2 && looksLikePhone(fields[fields.length - 1])) {
      name = fields.slice(0, -1).filter(Boolean).join(", ");
      whatsappNumber = fields[fields.length - 1];
    } else {
      name = fields[0];
      whatsappNumber = fields[1];
    }

    if (!name || !whatsappNumber || isHeaderRow(name, whatsappNumber)) continue;

    guests.push({ name, whatsapp_number: whatsappNumber });
  }

  return guests;
}

function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^[+\d][\d\s().-]*$/.test(value);
}

function isHeaderRow(name: string, whatsappNumber: string): boolean {
  const normalizedName = name.toLowerCase();
  const normalizedPhone = whatsappNumber.toLowerCase();
  const nameIsHeader = normalizedName === "name" || normalizedName === "guest" || normalizedName === "guest name";
  const phoneIsHeader =
    normalizedPhone.includes("whatsapp") ||
    normalizedPhone.includes("phone") ||
    normalizedPhone === "number" ||
    normalizedPhone === "mobile";
  return nameIsHeader && phoneIsHeader;
}

function parseCsvRows(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

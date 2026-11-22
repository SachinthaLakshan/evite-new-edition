export const GIFT_CURRENCY = "LKR";

export const SRI_LANKAN_BANKS = [
  "Bank of Ceylon",
  "People's Bank",
  "Commercial Bank of Ceylon",
  "Hatton National Bank (HNB)",
  "Sampath Bank",
  "National Development Bank (NDB)",
  "National Savings Bank (NSB)",
  "DFCC Bank",
  "Seylan Bank",
  "Nations Trust Bank",
  "Pan Asia Bank",
  "Union Bank",
  "Cargills Bank",
  "Amana Bank",
  "Standard Chartered Bank",
  "HSBC",
  "Other",
] as const;

export const GIFT_PRESET_MESSAGES = [
  "Wishing you a lifetime of love and happiness.",
  "Congratulations on your special day!",
  "With love and best wishes from our family.",
  "May your marriage be filled with joy.",
  "A small gift with our heartfelt blessings.",
] as const;

export const CUSTOM_GIFT_MESSAGE_VALUE = "__custom__";

export type BankAccountDraft = {
  id?: string;
  clientId: string;
  bank_name: string;
  custom_bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
};

export function emptyBankAccountDraft(): BankAccountDraft {
  return {
    clientId:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `bank-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    bank_name: "",
    custom_bank_name: "",
    account_name: "",
    account_number: "",
    branch: "",
  };
}

export function resolvedBankName(draft: BankAccountDraft): string {
  if (draft.bank_name === "Other") {
    return draft.custom_bank_name.trim();
  }
  return draft.bank_name.trim();
}

export function isBankAccountComplete(draft: BankAccountDraft): boolean {
  return Boolean(
    resolvedBankName(draft) &&
      draft.account_name.trim() &&
      draft.account_number.trim(),
  );
}

export function formatGiftAmount(amount: number, currency = GIFT_CURRENCY): string {
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function toBankAccountInsert(
  eventId: string,
  drafts: BankAccountDraft[],
) {
  return drafts.filter(isBankAccountComplete).map((draft, index) => ({
    event_id: eventId,
    bank_name: resolvedBankName(draft),
    account_name: draft.account_name.trim(),
    account_number: draft.account_number.trim(),
    branch: draft.branch.trim() || null,
    sort_order: index,
  }));
}

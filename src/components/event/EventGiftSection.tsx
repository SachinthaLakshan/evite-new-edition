"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventGiftSettings } from "@/components/event/EventGiftSettings";
import {
  BankAccountDraft,
  emptyBankAccountDraft,
  formatGiftAmount,
  isBankAccountComplete,
  SRI_LANKAN_BANKS,
  toBankAccountInsert,
} from "@/lib/gifts";

type EventGiftSectionProps = {
  eventId: string;
  giftsEnabled: boolean;
};

type GiftRow = {
  id: string;
  amount: number;
  currency: string;
  message: string | null;
  slip_path: string;
  created_at: string;
  attendees: { name: string } | { name: string }[] | null;
  event_bank_accounts: { bank_name: string; account_name: string } | { bank_name: string; account_name: string }[] | null;
};

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function draftsFromRows(
  rows: {
    id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    branch: string | null;
  }[],
): BankAccountDraft[] {
  if (rows.length === 0) return [emptyBankAccountDraft()];
  return rows.map((row) => {
    const known = (SRI_LANKAN_BANKS as readonly string[]).includes(row.bank_name);
    return {
      id: row.id,
      clientId: row.id,
      bank_name: known ? row.bank_name : "Other",
      custom_bank_name: known ? "" : row.bank_name,
      account_name: row.account_name,
      account_number: row.account_number,
      branch: row.branch || "",
    };
  });
}

export function EventGiftSection({ eventId, giftsEnabled }: EventGiftSectionProps) {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(giftsEnabled);
  const [accounts, setAccounts] = useState<BankAccountDraft[]>([emptyBankAccountDraft()]);
  const [isSaving, setIsSaving] = useState(false);
  const [openingSlipId, setOpeningSlipId] = useState<string | null>(null);

  const { data: bankRows = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ["event-bank-accounts", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_bank_accounts")
        .select("id, bank_name, account_name, account_number, branch, sort_order")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: gifts = [], isLoading: isLoadingGifts } = useQuery({
    queryKey: ["event-gifts", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_gifts")
        .select(
          "id, amount, currency, message, slip_path, created_at, attendees(name), event_bank_accounts(bank_name, account_name)",
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GiftRow[];
    },
  });

  useEffect(() => {
    setEnabled(giftsEnabled);
  }, [giftsEnabled]);

  useEffect(() => {
    setAccounts(draftsFromRows(bankRows));
  }, [bankRows]);

  const total = useMemo(
    () => gifts.reduce((sum, gift) => sum + Number(gift.amount || 0), 0),
    [gifts],
  );

  const handleSaveSettings = async () => {
    const completeAccounts = accounts.filter(isBankAccountComplete);
    if (enabled && completeAccounts.length === 0) {
      toast.error("Add at least one bank account before enabling cash gifts.");
      return;
    }

    setIsSaving(true);
    try {
      const { error: eventError } = await supabase
        .from("events")
        .update({ gifts_enabled: enabled })
        .eq("id", eventId);
      if (eventError) throw eventError;

      const keepIds = new Set(
        completeAccounts.map((account) => account.id).filter(Boolean) as string[],
      );
      const extraIds = bankRows
        .map((row) => row.id)
        .filter((id) => !keepIds.has(id));
      if (extraIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("event_bank_accounts")
          .delete()
          .eq("event_id", eventId)
          .in("id", extraIds);
        if (deleteError) throw deleteError;
      }

      for (const [index, account] of completeAccounts.entries()) {
        const payload = {
          event_id: eventId,
          bank_name: toBankAccountInsert(eventId, [account])[0].bank_name,
          account_name: account.account_name.trim(),
          account_number: account.account_number.trim(),
          branch: account.branch.trim() || null,
          sort_order: index,
        };
        if (account.id) {
          const { error } = await supabase
            .from("event_bank_accounts")
            .update(payload)
            .eq("id", account.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("event_bank_accounts").insert(payload);
          if (error) throw error;
        }
      }

      toast.success("Gift settings saved.");
      await queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["event-bank-accounts", eventId] });
    } catch (error) {
      console.error("Error saving gift settings:", error);
      toast.error("Failed to save gift settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const openSlip = async (gift: GiftRow) => {
    setOpeningSlipId(gift.id);
    try {
      const { data, error } = await supabase.storage
        .from("gift-slips")
        .createSignedUrl(gift.slip_path, 60);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error opening slip:", error);
      toast.error("Could not open the transfer slip.");
    } finally {
      setOpeningSlipId(null);
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" />
          Gift Section
        </CardTitle>
        <p className="text-sm text-gray-500">
          Cash gifts sent by bank transfer. Only you and admins can see this list.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingBanks ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading bank details...
          </div>
        ) : (
          <>
            <EventGiftSettings
              enabled={enabled}
              accounts={accounts}
              onEnabledChange={setEnabled}
              onAccountsChange={setAccounts}
            />
            <div className="flex justify-end">
              <Button type="button" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save gift settings"}
              </Button>
            </div>
          </>
        )}

        <div className="border-t pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900">Received gifts</h4>
            <p className="text-sm font-medium text-purple-700">
              Total: {formatGiftAmount(total)}
            </p>
          </div>

          {isLoadingGifts ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading gifts...
            </div>
          ) : gifts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No cash gifts yet. Guests will appear here after they submit a transfer slip.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Slip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gifts.map((gift) => {
                    const guest = asOne(gift.attendees);
                    const bank = asOne(gift.event_bank_accounts);
                    return (
                      <TableRow key={gift.id}>
                        <TableCell className="font-medium">{guest?.name || "Guest"}</TableCell>
                        <TableCell>{formatGiftAmount(Number(gift.amount), gift.currency)}</TableCell>
                        <TableCell className="max-w-[220px] whitespace-normal">
                          {gift.message || "—"}
                        </TableCell>
                        <TableCell>
                          {bank ? `${bank.bank_name} · ${bank.account_name}` : "—"}
                        </TableCell>
                        <TableCell>
                          {new Date(gift.created_at).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openSlip(gift)}
                            disabled={openingSlipId === gift.id}
                          >
                            {openingSlipId === gift.id ? "Opening..." : "View slip"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

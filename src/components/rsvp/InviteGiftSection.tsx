"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOM_GIFT_MESSAGE_VALUE,
  GIFT_CURRENCY,
  GIFT_PRESET_MESSAGES,
} from "@/lib/gifts";
import { isValidFileSize as isFileWithinLimit } from "@/lib/utils";

type InviteGiftSectionProps = {
  eventId?: string | null;
  giftsEnabled?: boolean | null;
  isVerified: boolean;
  attendeeId?: string | null;
};

export function InviteGiftSection({
  eventId,
  giftsEnabled,
  isVerified,
  attendeeId,
}: InviteGiftSectionProps) {
  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState<string>(GIFT_PRESET_MESSAGES[0]);
  const [customMessage, setCustomMessage] = useState("");
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const enabled = Boolean(giftsEnabled && eventId);

  const { data: accounts = [] } = useQuery({
    queryKey: ["public-event-bank-accounts", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_bank_accounts")
        .select("id, bank_name, account_name, account_number, branch")
        .eq("event_id", eventId as string)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled,
  });

  const message = useMemo(() => {
    if (preset === CUSTOM_GIFT_MESSAGE_VALUE) return customMessage.trim();
    return preset;
  }, [preset, customMessage]);

  if (!enabled) return null;

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy. Please copy it manually.");
    }
  };

  const handleSubmit = async () => {
    if (!eventId || !attendeeId) {
      toast.error("Verify your invitation before sending a gift.");
      return;
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid gift amount.");
      return;
    }
    if (!message) {
      toast.error("Choose or write a message.");
      return;
    }
    if (!slipFile) {
      toast.error("Upload a photo of the transfer slip.");
      return;
    }
    if (!isFileWithinLimit(slipFile, 5)) {
      toast.error("Slip image must be 5MB or smaller.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ext = slipFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const slipPath = `${eventId}/${attendeeId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("gift-slips")
        .upload(slipPath, slipFile, {
          contentType: slipFile.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("event_gifts").insert({
        event_id: eventId,
        attendee_id: attendeeId,
        bank_account_id: bankAccountId || accounts[0]?.id || null,
        amount: parsedAmount,
        currency: GIFT_CURRENCY,
        message,
        slip_path: slipPath,
      });
      if (insertError) throw insertError;

      setSubmitted(true);
      toast.success("Thank you. Your gift has been recorded.");
    } catch (error) {
      console.error("Error submitting gift:", error);
      toast.error("Could not submit the gift. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-xl mx-auto px-4 py-10">
      <div className="rounded-2xl bg-white/95 shadow-lg border border-black/5 p-6 space-y-5 text-left text-gray-900">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-50 text-amber-800">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Send a cash gift</h2>
            <p className="text-sm text-gray-600 mt-1">
              Transfer to one of the accounts below, then send the amount, a message, and a photo of the slip.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="rounded-xl border border-gray-200 p-4 space-y-2 bg-gray-50">
              <p className="font-semibold">{account.bank_name}</p>
              <p className="text-sm">{account.account_name}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-sm">{account.account_number}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyText(account.account_number, "Account number")}
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              {account.branch && <p className="text-xs text-gray-500">Branch: {account.branch}</p>}
            </div>
          ))}
        </div>

        {!isVerified || !attendeeId ? (
          <p className="text-sm text-gray-600">
            Confirm you are on the guest list first, then you can submit your gift here.
          </p>
        ) : submitted ? (
          <p className="text-sm font-medium text-green-700">
            Your gift is recorded. Thank you for your kindness.
          </p>
        ) : (
          <div className="space-y-4">
            {accounts.length > 1 && (
              <div className="space-y-2">
                <Label>Account you transferred to</Label>
                <Select value={bankAccountId || accounts[0]?.id} onValueChange={setBankAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bank_name} · {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="gift-amount">Amount ({GIFT_CURRENCY})</Label>
              <Input
                id="gift-amount"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <div className="flex flex-wrap gap-2">
                {GIFT_PRESET_MESSAGES.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => setPreset(text)}
                    className={`text-left text-xs rounded-full border px-3 py-2 transition ${
                      preset === text
                        ? "border-amber-700 bg-amber-50 text-amber-900"
                        : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {text}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPreset(CUSTOM_GIFT_MESSAGE_VALUE)}
                  className={`text-xs rounded-full border px-3 py-2 ${
                    preset === CUSTOM_GIFT_MESSAGE_VALUE
                      ? "border-amber-700 bg-amber-50 text-amber-900"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  Write my own
                </button>
              </div>
              {preset === CUSTOM_GIFT_MESSAGE_VALUE && (
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Write a personal message"
                  rows={3}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gift-slip">Transfer slip photo</Label>
              <Input
                id="gift-slip"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && !isFileWithinLimit(file, 5)) {
                    toast.error("Slip image must be 5MB or smaller.");
                    e.target.value = "";
                    return;
                  }
                  setSlipFile(file);
                }}
              />
            </div>

            <Button type="button" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send gift"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

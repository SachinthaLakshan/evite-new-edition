"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const COUNTRY_CODES = [
  { iso: "LK", dial: "94" },
  { iso: "IN", dial: "91" },
  { iso: "AE", dial: "971" },
  { iso: "GB", dial: "44" },
  { iso: "US", dial: "1" },
  { iso: "AU", dial: "61" },
  { iso: "SG", dial: "65" },
  { iso: "MY", dial: "60" },
  { iso: "QA", dial: "974" },
  { iso: "SA", dial: "966" },
];

type SavedReply = {
  name: string;
  dial: string;
  localNumber: string;
  attending: boolean;
  partySize: number;
};

function storageKey(eventId: string) {
  return `evite-open-rsvp:${eventId}`;
}

function readSavedReply(eventId: string): SavedReply | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(eventId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedReply;
    if (!parsed?.name || !parsed?.dial) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function OpenRsvpSection({
  event,
  children,
  tone = "light",
}: {
  event: { id?: string; open_rsvp?: boolean | null; is_active?: boolean | null } | null;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  if (event?.open_rsvp !== true) return <>{children}</>;
  return <OpenRsvpLaunch event={event} tone={tone} />;
}

function OpenRsvpLaunch({
  event,
  tone,
}: {
  event: { id?: string; is_active?: boolean | null };
  tone: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!event.id) return;
    setSaved(Boolean(readSavedReply(event.id)));
  }, [event.id]);

  const dark = tone === "dark";

  return (
    <>
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={event.is_active === false}
          className={
            dark
              ? "inline-flex h-9 items-center justify-center rounded-full border border-amber-300/80 bg-black/30 px-4 text-[15px] leading-none text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-50"
              : "inline-flex h-9 items-center justify-center rounded-full border border-[#C6A15A] bg-[#FBF6F1]/65 px-4 text-[13px] font-semibold uppercase leading-none tracking-[0.08em] text-[#1E4A42] transition hover:bg-[#FBF6F1] disabled:cursor-not-allowed disabled:opacity-50"
          }
          style={{ fontFamily: dark ? "Parisienne, cursive" : "'Cormorant Garamond', serif" }}
        >
          {saved ? "Update RSVP" : "Send RSVP"}
        </button>
        {saved ? (
          <p className={`text-xs ${dark ? "text-amber-100/80" : "text-[#3E6B5A]"}`}>
            Your reply is saved
          </p>
        ) : null}
        {event.is_active === false ? (
          <p className={`text-xs ${dark ? "text-amber-100/70" : "text-[#6E564C]"}`}>
            This invitation is not accepting replies yet
          </p>
        ) : null}
      </div>
      <OpenRsvpDialog
        eventId={event.id || ""}
        open={open}
        onOpenChange={setOpen}
        onSaved={() => setSaved(true)}
      />
    </>
  );
}

export function OpenRsvpDialog({
  eventId,
  open,
  onOpenChange,
  onSaved,
}: {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [name, setName] = useState("");
  const [dial, setDial] = useState("94");
  const [localNumber, setLocalNumber] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !eventId) return;
    const saved = readSavedReply(eventId);
    if (!saved) return;
    setName(saved.name);
    setDial(saved.dial);
    setLocalNumber(saved.localNumber);
    setAttending(saved.attending);
    setPartySize(saved.partySize);
  }, [open, eventId]);

  const submit = async () => {
    setError("");
    const trimmedName = name.trim();
    const digits = localNumber.replace(/\D/g, "").replace(/^0+/, "");
    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (digits.length < 7 || digits.length > 12) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }
    if (attending === null) {
      setError("Please choose whether you are attending.");
      return;
    }

    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc("submit_open_rsvp", {
      p_event_id: eventId,
      p_name: trimmedName,
      p_whatsapp: `+${dial}${digits}`,
      p_attending: attending,
      p_party_size: partySize,
    });
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message.replace(/^.*Exception:\s*/i, "") || "Could not send your RSVP.");
      return;
    }

    const reply: SavedReply = {
      name: trimmedName,
      dial,
      localNumber: digits,
      attending,
      partySize,
    };
    window.localStorage.setItem(storageKey(eventId), JSON.stringify(reply));
    onSaved?.();
    toast.success(attending ? "Your RSVP is saved. We can't wait to see you." : "Your RSVP is saved.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[80] max-h-[92dvh] overflow-y-auto border-[#1E4A42]/15 bg-[#F7F3EA] p-5 sm:max-w-[420px] sm:rounded-[28px]">
        <DialogTitle className="sr-only">Send RSVP</DialogTitle>
        <DialogDescription className="sr-only">
          Share your name, WhatsApp number, and whether you will attend.
        </DialogDescription>
        <form
          className="space-y-5 text-[#1E4A42]"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              maxLength={80}
              className="h-12 w-full rounded-2xl border border-[#1E4A42]/35 bg-[#FBF8F2] px-4 text-[15px] outline-none placeholder:text-[#1E4A42]/35 focus:border-[#1E4A42]"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium">WhatsApp Number</span>
            <div className="grid grid-cols-[108px_1fr] gap-3">
              <select
                value={dial}
                onChange={(event) => setDial(event.target.value)}
                aria-label="Country code"
                className="h-12 rounded-2xl border border-[#1E4A42]/35 bg-[#FBF8F2] px-2 text-sm outline-none focus:border-[#1E4A42]"
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.iso} value={country.dial}>
                    {country.iso} +{country.dial}
                  </option>
                ))}
              </select>
              <input
                value={localNumber}
                onChange={(event) => setLocalNumber(event.target.value)}
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="77 XXX XXXX"
                className="h-12 w-full rounded-2xl border border-[#1E4A42]/35 bg-[#FBF8F2] px-4 text-[15px] outline-none placeholder:text-[#1E4A42]/35 focus:border-[#1E4A42]"
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Will you be attending?</legend>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttending(true)}
                className={`h-14 rounded-2xl border text-sm transition ${
                  attending === true
                    ? "border-[#1E4A42] bg-[#1E4A42] text-[#F7F3EA]"
                    : "border-[#1E4A42]/40 bg-transparent text-[#1E4A42]"
                }`}
              >
                Joyfully Accept
              </button>
              <button
                type="button"
                onClick={() => setAttending(false)}
                className={`h-14 rounded-2xl border text-sm transition ${
                  attending === false
                    ? "border-[#1E4A42] bg-[#1E4A42] text-[#F7F3EA]"
                    : "border-[#1E4A42]/40 bg-transparent text-[#1E4A42]"
                }`}
              >
                Regretfully Decline
              </button>
            </div>
          </fieldset>

          <div className="space-y-2">
            <span className="text-sm font-medium">Number of Guests</span>
            <div className="flex items-center justify-center gap-6 py-1">
              <button
                type="button"
                aria-label="Fewer guests"
                disabled={partySize <= 1}
                onClick={() => setPartySize((value) => Math.max(1, value - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1E4A42]/30 text-xl text-[#1E4A42] disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-8 text-center text-3xl font-semibold">{partySize}</span>
              <button
                type="button"
                aria-label="More guests"
                disabled={partySize >= 20}
                onClick={() => setPartySize((value) => Math.min(20, value + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1E4A42]/30 text-xl text-[#1E4A42] disabled:opacity-40"
              >
                +
              </button>
            </div>
            {attending === false ? (
              <p className="text-center text-xs text-[#1E4A42]/70">
                A decline is saved, and these guests are not counted as attending.
              </p>
            ) : (
              <p className="text-center text-xs text-[#1E4A42]/70">
                Include yourself. Use the same WhatsApp number if you need to update this reply.
              </p>
            )}
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || !eventId}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#1E4A42] text-sm font-semibold tracking-[0.18em] text-[#1E4A42] transition hover:bg-[#1E4A42] hover:text-[#F7F3EA] disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {submitting ? "SENDING" : "SEND RSVP"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

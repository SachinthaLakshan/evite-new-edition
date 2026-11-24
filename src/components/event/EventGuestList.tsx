
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserIcon, UploadIcon } from "lucide-react";
import { Guest } from "@/types/event-form";
import { IndividualGuestForm } from "./guest-list/IndividualGuestForm";
import { CsvUploadForm } from "./guest-list/CsvUploadForm";
import { GuestListTable } from "./guest-list/GuestListTable";
import { SharedInviteLink } from "./SharedInviteLink";

interface EventGuestListProps {
  guests: Guest[];
  newGuest: Guest;
  guestInputMethod: "individual" | "csv";
  setGuestInputMethod: React.Dispatch<React.SetStateAction<"individual" | "csv">>;
  setNewGuest: React.Dispatch<React.SetStateAction<Guest>>;
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadTemplate: () => void;
  openRsvp?: boolean;
  onOpenRsvpChange?: (enabled: boolean) => void;
  eventId?: string;
  embedded?: boolean;
}

export const EventGuestList: React.FC<EventGuestListProps> = ({
  guests,
  newGuest,
  guestInputMethod,
  setGuestInputMethod,
  setNewGuest,
  setGuests,
  handleFileUpload,
  downloadTemplate,
  openRsvp = false,
  onOpenRsvpChange,
  eventId,
  embedded = false,
}) => {
  return (
    <div className={embedded ? "min-w-0 space-y-4" : "min-w-0 space-y-6 rounded-lg border bg-white p-4 shadow-sm sm:p-6"}>
      <div className="min-w-0 rounded-xl border border-[#1E4A42]/15 bg-[#F7F3EA] p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-base font-semibold text-[#1E4A42]">One link for every guest</h3>
            <p className="text-sm leading-relaxed text-[#1E4A42]/80">
              Share one invitation. Guests send their own RSVP. This stays off until you turn it on, so existing guest links are unchanged.
            </p>
          </div>
          <Switch
            checked={openRsvp}
            onCheckedChange={(checked) => onOpenRsvpChange?.(checked)}
            aria-label="Use one invitation link"
            className="mt-0.5 shrink-0"
          />
        </div>
        {openRsvp && eventId ? <SharedInviteLink eventId={eventId} /> : null}
        {openRsvp && !eventId ? (
          <p className="mt-3 text-sm leading-relaxed text-[#1E4A42]/80">
            After you create the event, the guest page will show one short link you can copy and send to everyone.
          </p>
        ) : null}
      </div>

      {openRsvp ? (
        <p className="text-sm text-gray-600">
          Guest-by-guest invites are hidden while this is on. Replies from the shared link appear in attendance, including how many people are coming.
          {guests.length > 0 ? " Names already typed here will not be added while the shared link is on." : ""}
        </p>
      ) : (
      <>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">Guest List</h2>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button
            type="button"
            variant={guestInputMethod === "individual" ? "default" : "outline"}
            onClick={() => setGuestInputMethod("individual")}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Individual
          </Button>
          <Button
            type="button"
            variant={guestInputMethod === "csv" ? "default" : "outline"}
            onClick={() => setGuestInputMethod("csv")}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {guestInputMethod === "individual" ? (
          <IndividualGuestForm
            newGuest={newGuest}
            setNewGuest={setNewGuest}
            setGuests={setGuests}
          />
        ) : (
          <CsvUploadForm
            handleFileUpload={handleFileUpload}
            downloadTemplate={downloadTemplate}
          />
        )}

        <GuestListTable guests={guests} setGuests={setGuests} />
      </div>
      </>
      )}
    </div>
  );
};

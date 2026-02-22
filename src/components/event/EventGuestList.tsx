
import React from "react";
import { Button } from "@/components/ui/button";
import { UserIcon, UploadIcon } from "lucide-react";
import { Guest } from "@/types/event-form";
import { IndividualGuestForm } from "./guest-list/IndividualGuestForm";
import { CsvUploadForm } from "./guest-list/CsvUploadForm";
import { GuestListTable } from "./guest-list/GuestListTable";

interface EventGuestListProps {
  guests: Guest[];
  newGuest: Guest;
  guestInputMethod: "individual" | "csv";
  setGuestInputMethod: React.Dispatch<React.SetStateAction<"individual" | "csv">>;
  setNewGuest: React.Dispatch<React.SetStateAction<Guest>>;
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  downloadTemplate: () => void;
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
}) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Guest List</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={guestInputMethod === "individual" ? "default" : "outline"}
            onClick={() => setGuestInputMethod("individual")}
            size="sm"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Individual
          </Button>
          <Button
            type="button"
            variant={guestInputMethod === "csv" ? "default" : "outline"}
            onClick={() => setGuestInputMethod("csv")}
            size="sm"
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
    </div>
  );
};

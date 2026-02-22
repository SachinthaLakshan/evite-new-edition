
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Guest } from "@/types/event-form";

interface IndividualGuestFormProps {
  newGuest: Guest;
  setNewGuest: React.Dispatch<React.SetStateAction<Guest>>;
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
}

export const IndividualGuestForm: React.FC<IndividualGuestFormProps> = ({
  newGuest,
  setNewGuest,
  setGuests,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="guest-name">Name</Label>
          <Input
            id="guest-name"
            placeholder="Guest name"
            value={newGuest.name}
            onChange={(e) =>
              setNewGuest((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="guest-email">Email</Label>
          <Input
            id="guest-email"
            type="email"
            placeholder="Email address"
            value={newGuest.email}
            onChange={(e) =>
              setNewGuest((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="guest-whatsapp">WhatsApp</Label>
          <Input
            id="guest-whatsapp"
            placeholder="WhatsApp number"
            value={newGuest.whatsapp_number}
            onChange={(e) =>
              setNewGuest((prev) => ({
                ...prev,
                whatsapp_number: e.target.value,
              }))
            }
          />
        </div>
      </div>
      <Button
        type="button"
        onClick={() => {
          if (!newGuest.name || (!newGuest.email && !newGuest.whatsapp_number)) {
            toast.error(
              "Please provide name and either email or WhatsApp number"
            );
            return;
          }
          setGuests((prev) => [...prev, newGuest]);
          setNewGuest({ name: "", email: "", whatsapp_number: "" });
          toast.success("Guest added successfully");
        }}
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        Add Guest
      </Button>
    </div>
  );
};

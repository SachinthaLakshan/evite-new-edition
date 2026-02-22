
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Guest } from "@/types/event-form";
import { getStatusColor } from "@/lib/utils";

interface GuestListTableProps {
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
}

export const GuestListTable: React.FC<GuestListTableProps> = ({
  guests,
  setGuests,
}) => {
  if (guests.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WhatsApp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {guests.map((guest, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{guest.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{guest.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {guest.whatsapp_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getStatusColor("pending")}>Pending</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() =>
                    setGuests((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

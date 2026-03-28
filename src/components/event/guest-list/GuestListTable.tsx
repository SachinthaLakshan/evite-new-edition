
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
    <div className="mt-8">
      {/* Desktop View Table */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
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
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{guest.name}</td>

                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
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

      {/* Mobile Stacked Card View */}
      <div className="md:hidden space-y-4">
        {guests.map((guest, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="font-semibold text-gray-900 text-lg">{guest.name}</div>
              <Badge className={getStatusColor("pending")}>Pending</Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-md border">

              {guest.whatsapp_number && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-500 w-20">WhatsApp:</span>
                  <span>{guest.whatsapp_number}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full justify-center h-10 border border-red-100"
                onClick={() => setGuests((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove Guest
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

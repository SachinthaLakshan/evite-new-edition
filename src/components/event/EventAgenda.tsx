import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

interface AgendaItem {
  time: string;
  description: string;
}

interface EventAgendaProps {
  agenda: AgendaItem[];
  newAgendaItem: AgendaItem;
  setNewAgendaItem: React.Dispatch<React.SetStateAction<AgendaItem>>;
  setAgenda: React.Dispatch<React.SetStateAction<AgendaItem[]>>;
  getMinTime: () => string;
  formDate: string;
  getMinDate: () => string;
}

export const EventAgenda: React.FC<EventAgendaProps> = ({
  agenda,
  newAgendaItem,
  setNewAgendaItem,
  setAgenda,
  getMinTime,
  formDate,
  getMinDate,
}) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Event Agenda</h2>
        <span className="text-sm text-gray-500">{agenda.length} items</span>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <Input
              type="time"
              value={newAgendaItem.time}
              onChange={(e) =>
                setNewAgendaItem((prev) => ({
                  ...prev,
                  time: e.target.value,
                }))
              }
              min={formDate === getMinDate() ? getMinTime() : undefined}
              placeholder="Time"
              className="w-full"
            />
          </div>
          <div className="col-span-2">
            <Input
              type="text"
              value={newAgendaItem.description}
              onChange={(e) =>
                setNewAgendaItem((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What's happening at this time?"
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                if (!newAgendaItem.time || !newAgendaItem.description) {
                  toast.error("Please fill in both time and description");
                  return;
                }
                setAgenda((prev) => [...prev, newAgendaItem]);
                setNewAgendaItem({ time: "", description: "" });
                toast.success("Agenda item added");
              }}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {agenda.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 font-medium text-sm text-gray-600">Time</div>
                <div className="col-span-8 font-medium text-sm text-gray-600">Description</div>
                <div className="col-span-2 font-medium text-sm text-gray-600">Action</div>
              </div>
            </div>
            <div className="divide-y">
              {agenda
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2 text-sm font-medium">
                        {item.time}
                      </div>
                      <div className="col-span-8 text-sm text-gray-600">
                        {item.description}
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            setAgenda((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

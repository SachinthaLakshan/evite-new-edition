"use client";

import React, { useState } from "react";
import { Event, EventStatus } from "@/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Trash2Icon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  InfoIcon,
  ExternalLinkIcon,
  Share2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  onDeleteEvent: (eventId: string) => Promise<void>;
  getStatusColor: (status: EventStatus) => string;
}

export function EventList({
  events,
  isLoading,
  onDeleteEvent,
  getStatusColor,
}: EventListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const router = useRouter();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No events found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating a new event.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card
            key={event.id}
            className="group cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedEvent(event)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge
                  variant="secondary"
                  className={getStatusColor(event.status)}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventToDelete(event.id);
                    setAlertDialogOpen(true);
                  }}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-2 group-hover:text-primary transition-colors">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              {event.attendees && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <UsersIcon className="h-4 w-4" />
                  <span>{event.attendees.length} attendees</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Are you sure you want to delete this event?</p>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (eventToDelete) {
                  await onDeleteEvent(eventToDelete);
                  setEventToDelete(null);
                }
                setAlertDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto scrollbar-thin p-4 sm:p-6">
            <DialogHeader className="mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <DialogTitle className="text-xl sm:text-2xl font-bold truncate">
                  {selectedEvent.title}
                </DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const baseUrl =
                      process.env.NEXT_PUBLIC_SITE_URL ||
                      process.env.NEXT_PUBLIC_BASE_URL ||
                      (typeof window !== "undefined" && window.location
                        ? window.location.origin
                        : "");
                    if (!baseUrl) {
                      toast.error("Unable to determine base URL to share.");
                      return;
                    }
                    const eventUrl = `${baseUrl}/response?eventId=${selectedEvent.id}`;
                    navigator.clipboard.writeText(eventUrl);
                    toast.success("Public Event link copied!");
                  }}
                >
                  <Share2Icon className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p className="text-gray-600">
                    {formatDate(selectedEvent.date)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-gray-600">{selectedEvent.location}</p>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <h3 className="font-medium">Story</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {selectedEvent.description.length > 100 ? selectedEvent.description.substring(0, 100) + "..." : selectedEvent.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Attendance Overview */}
              {selectedEvent.attendees &&
                selectedEvent.attendees.length > 0 && (
                  <div className="flex items-start gap-3">
                    <UsersIcon className="w-5 h-5 text-gray-500 mt-1" />
                    <div className="w-full">
                      <h3 className="font-medium">Attendance Overview</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        <div className="bg-amber-50/50 p-3 sm:p-4 rounded-xl text-center border border-amber-100/50">
                          <p className="text-xl sm:text-2xl font-bold text-amber-900">
                            {selectedEvent.attendees.length}
                          </p>
                          <p className="text-xs sm:text-sm text-amber-700/70">Total Guests</p>
                        </div>
                        <div className="bg-green-50/50 p-3 sm:p-4 rounded-xl text-center border border-green-100/50">
                          <p className="text-xl sm:text-2xl font-bold text-green-700">
                            {
                              selectedEvent.attendees.filter(
                                (a) => a.response === "accepted",
                              ).length
                            }
                          </p>
                          <p className="text-xs sm:text-sm text-green-700/70">Accepted</p>
                        </div>
                        <div className="bg-red-50/50 p-3 sm:p-4 rounded-xl text-center border border-red-100/50">
                          <p className="text-xl sm:text-2xl font-bold text-red-700">
                            {
                              selectedEvent.attendees.filter(
                                (a) => a.response === "declined",
                              ).length
                            }
                          </p>
                          <p className="text-xs sm:text-sm text-red-700/70">Declined</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setSelectedEvent(null);
                    router.push(`/events/${selectedEvent.id}`);
                  }}
                >
                  View Full Details
                  <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

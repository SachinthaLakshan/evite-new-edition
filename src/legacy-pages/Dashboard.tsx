"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EventList } from "@/components/dashboard/EventList";
import { Event, EventStatus } from "@/types/event";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Dashboard = () => {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<EventStatus | "all">(
    "all",
  );

  const statusFilters: { label: string; value: EventStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["events", session?.user?.id],
    queryFn: async () => {
      const normalizeResponse = (response?: string | null) => {
        switch (response) {
          case "yes":
            return "accepted";
          case "no":
            return "declined";
          case "maybe":
            return "pending";
          case "accepted":
          case "declined":
          case "pending":
            return response;
          default:
            return "pending";
        }
      };

      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          attendees (
            id,
            name,
            email,
            response,
            link_shared
          )
        `,
        )
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      return (data || []).map((event) => ({
        ...event,
        status: (event.status || "upcoming") as EventStatus,
        description: event.description || null,
        agenda: Array.isArray(event.agenda)
          ? event.agenda.map((item: any) => ({
              id: item.id || crypto.randomUUID(),
              time: item.time,
              description: item.description,
            }))
          : [],
        attendees:
          event.attendees?.map((attendee) => ({
            ...attendee,
            response: normalizeResponse(attendee.response),
            link_shared: attendee.link_shared || false,
          })) || [],
      })) as Event[];
    },
    enabled: !!session?.user?.id,
  });

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete event");
      console.error("Delete error:", error);
    },
  });

  const handleDeleteEvent = async (eventId: string) => {
    deleteMutation.mutate(eventId);
  };

  if (!session) {
    router.push("/auth");
    return null;
  }

  const filteredEvents = events.filter((event) => {
    if (selectedFilter === "all") return true;
    return event.status === selectedFilter;
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Evite Events</h1>
        <Button
          onClick={() => router.push("/dashboard/create-event")}
          className="bg-primary hover:bg-primary/90"
        >
          Create Event
        </Button>
      </div>

      <EventList
        events={filteredEvents}
        isLoading={isLoading}
        onDeleteEvent={handleDeleteEvent}
        getStatusColor={getStatusColor}
      />
    </DashboardLayout>
  );
};

export default Dashboard;

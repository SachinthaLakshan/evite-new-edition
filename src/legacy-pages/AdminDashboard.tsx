"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { UsersIcon, CalendarIcon, UserPlusIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Event } from "@/types/event";

const AdminDashboard = () => {
  const { session, isAdmin, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // If loading finishes and user is not admin, boot them
  React.useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [loading, session, isAdmin, router]);

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["admin_events"],
    queryFn: async () => {
      // Admins fetch ALL events
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          attendees (id)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error fetching events for administration");
        throw error;
      }
      return data as any[];
    },
    enabled: !!isAdmin,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      if (error) {
        console.error(error);
        return [];
      }
      return data;
    },
    enabled: !!isAdmin,
  });

  const toggleEventActiveMutation = useMutation({
    mutationFn: async ({ eventId, isActive }: { eventId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("events")
        .update({ is_active: isActive })
        .eq("id", eventId);

      if (error) throw error;
      return { eventId, isActive };
    },
    onSuccess: ({ isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_events"] });
      toast.success(isActive ? "Event Activated!" : "Event Deactivated!");
    },
    onError: () => {
      toast.error("Failed to update event status");
    },
  });

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.is_active).length;
  const totalUsers = profiles.length;
  const totalGuests = events.reduce((acc, event) => acc + (event.attendees?.length || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary tracking-tight">Admin System</h1>
        <p className="text-gray-500">Monitor platform activity, approve payments, and manage users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <UsersIcon className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profilesLoading ? "-" : totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Events</CardTitle>
            <CalendarIcon className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{eventsLoading ? "-" : totalEvents}</div>
            <p className="text-xs text-gray-500 mt-1">{activeEvents} Active / {totalEvents - activeEvents} Pending</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Guests</CardTitle>
            <UserPlusIcon className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{eventsLoading ? "-" : totalGuests}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Event Management & Activation</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {eventsLoading ? (
            <div className="py-8 text-center text-gray-500">Loading events...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Author ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Activation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">
                      {event.user_id ? `${event.user_id.substring(0, 8)}...` : "System"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(event.created_at || "").toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.attendees?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      {event.is_active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                          <CheckCircleIcon className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                          <XCircleIcon className="w-3 h-3 mr-1" /> Payment Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {event.is_active ? (
                         <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => toggleEventActiveMutation.mutate({ eventId: event.id, isActive: false })}
                          disabled={toggleEventActiveMutation.isPending}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => toggleEventActiveMutation.mutate({ eventId: event.id, isActive: true })}
                          disabled={toggleEventActiveMutation.isPending}
                        >
                          Activate Event
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No events found in the database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;

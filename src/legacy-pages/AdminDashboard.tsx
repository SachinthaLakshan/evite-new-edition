"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  UsersIcon,
  CalendarIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon,
  HeartIcon,
  MailIcon,
  LayoutTemplate,
  Upload,
  Eye,
  ImageIcon,
  ChevronDown,
  Loader2,
  PhoneIcon,
  PencilIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Event } from "@/types/event";
import AdminTemplates from "@/components/admin/AdminTemplates";
import { CardTemplate } from "@/types/invitation";

const AdminDashboard = () => {
  const { session, isAdmin, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [finalCardUrl, setFinalCardUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isViewTemplateDialogOpen, setIsViewTemplateDialogOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<CardTemplate | null>(null);

  // If loading finishes and user is not admin, boot them
  React.useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [loading, session, isAdmin, router]);

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["admin_events"],
    queryFn: async () => {
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

  const { data: templates = [] } = useQuery<CardTemplate[]>({
    queryKey: ["card_templates"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("card_templates" as any) as any)
        .select("*");
      if (error) throw error;
      return data as CardTemplate[];
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
        .update({ is_active: isActive } as any)
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

  const uploadFinalCardMutation = useMutation({
    mutationFn: async ({ eventId, url }: { eventId: string; url: string }) => {
      const { error } = await supabase
        .from("events")
        .update({ final_card_url: url } as any)
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_events"] });
      toast.success("Final card design uploaded!");
      setIsUploadDialogOpen(false);
      setFinalCardUrl("");
    },
    onError: (error: any) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedEventId) return;
    const file = e.target.files[0];
    
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `final_cards/${selectedEventId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("event-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);

      setFinalCardUrl(publicUrl);
      toast.success("Image uploaded to storage! Now click Update Design.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      // Reset the file input value so the same file could be uploaded again if needed
      e.target.value = "";
    }
  };

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
        <p className="text-gray-500">Monitor platform activity, manage templates, and upload manual designs.</p>
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

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Events Management
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" /> Template Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
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
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Activation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => {
                      const authorProfile = profiles.find((p: any) => p.id === event.user_id) as any;
                      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                      const firstAttendeeId = event.attendees?.[0]?.id;
                      const eventUrl = `${baseUrl}/response?eventId=${event.id}${firstAttendeeId ? `&attendeeId=${firstAttendeeId}` : ""}`;
                      const selectedTemplateId = event.invitation_config?.selected_template_id || event.invitation_config?.template_id || event.selected_template_id;
                      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

                      return (
                        <TableRow key={event.id}>
                          <TableCell className="font-semibold">{event.title}</TableCell>
                          <TableCell className="text-sm">
                            {event.mobile_number ? (
                              <a
                                href={`tel:${event.mobile_number}`}
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
                              >
                                <PhoneIcon className="w-3.5 h-3.5" />
                                {event.mobile_number}
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 italic">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                              <span>{new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
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
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  Actions <ChevronDown className="w-3.5 h-3.5 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/events/${event.id}`} className="cursor-pointer flex items-center">
                                    <PencilIcon className="w-4 h-4 mr-2 text-primary" />
                                    View & Edit Details
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                  <a href={eventUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Invite
                                  </a>
                                </DropdownMenuItem>
                                
                                {selectedTemplate && selectedTemplate.image_url && (
                                   <DropdownMenuItem 
                                     onClick={() => {
                                       setViewingTemplate(selectedTemplate);
                                       setIsViewTemplateDialogOpen(true);
                                     }}
                                     className="cursor-pointer flex items-center"
                                   >
                                     <LayoutTemplate className="w-4 h-4 mr-2" />
                                     View Template
                                   </DropdownMenuItem>
                                 )}

                                {selectedTemplate && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedEventId(event.id);
                                      setFinalCardUrl(event.final_card_url || "");
                                      setIsUploadDialogOpen(true);
                                    }}
                                    className="cursor-pointer flex items-center text-amber-700 focus:text-amber-700"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Design
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
        </TabsContent>

        <TabsContent value="templates">
          <AdminTemplates />
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Hand-designed Card</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Upload Image File</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingImage}
                  className="cursor-pointer"
                />
                {isUploadingImage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
            </div>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or paste link directly</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="design-url">Final Card Image URL</Label>
              <Input
                id="design-url"
                placeholder="https://..."
                value={finalCardUrl}
                onChange={(e) => setFinalCardUrl(e.target.value)}
              />
            </div>
            {finalCardUrl && (
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Preview</p>
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded border overflow-hidden bg-gray-50">
                  <img src={finalCardUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedEventId) {
                  uploadFinalCardMutation.mutate({ eventId: selectedEventId, url: finalCardUrl });
                }
              }}
              disabled={uploadFinalCardMutation.isPending || isUploadingImage || !finalCardUrl}
            >
              {uploadFinalCardMutation.isPending ? "Saving..." : "Update Design"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTemplateDialogOpen} onOpenChange={setIsViewTemplateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {viewingTemplate && (
              <>
                <div className="grid gap-2">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Template Name</Label>
                  <p className="font-medium text-base">{viewingTemplate.name}</p>
                </div>
                
                {viewingTemplate.template_url && (
                  <div className="grid gap-2">
                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Design URL</Label>
                    <a 
                      href={viewingTemplate.template_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all bg-blue-50/50 p-2 border border-blue-100 rounded-md block"
                    >
                      {viewingTemplate.template_url}
                    </a>
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Template Preview</Label>
                  <div className="mt-1 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-2 shadow-sm">
                    <img 
                      src={viewingTemplate.image_url} 
                      alt={viewingTemplate.name} 
                      className="w-full h-auto max-h-[50vh] object-contain rounded" 
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewTemplateDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDashboard;


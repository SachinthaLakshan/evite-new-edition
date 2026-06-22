"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2Icon,
  CalendarIcon,
  MapPinIcon,
  MapPinnedIcon,
  ArrowLeftIcon,
  ImageIcon,
  TrashIcon,
  LinkIcon,
  UploadIcon,
  XIcon,
  PlusIcon,
  Loader2,
  PencilIcon,
  EyeIcon,
  MessageCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types/event";
import { useAuth } from "@/components/AuthProvider";
import { AttendanceChart } from "@/components/event/AttendanceChart";
import { EventGuestList } from "@/components/event/EventGuestList";
import { EventAgenda } from "@/components/event/EventAgenda";
import { Guest } from "@/types/event-form";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isValidGoogleMapsUrl, isValidImageUrl, isValidFileSize } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getStatusColor } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createShortUrl, createAttendeeShortUrl } from "@/lib/url-shortener";
import InvitationPreviewCard from "@/components/event/InvitationPreviewCard";
import { InvitationConfig } from "@/types/invitation";
import { GuestInvitationDownloader } from "@/components/event/GuestInvitationDownloader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Add after imports
type SliderInputType = "file" | "link";
type EditEventFormState = {
  title: string;
  bride_name: string;
  groom_name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_url: string;
  status: string;
  theme_id: string;
  background_image_url: string;
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");

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
            whatsapp_number,
            response
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        status: data.status || "upcoming",
        description: data.description || null,
        agenda: data.agenda
          ? (data.agenda as any[]).map((item) => ({
            id: item.id,
            time: item.time,
            description: item.description,
          }))
          : [],
        attendees:
          data.attendees?.map((attendee: any) => ({
            ...attendee,
            response: normalizeResponse(attendee.response),
          })) || [],
      } as Event;
    },
  });

  const isOwnerOrAdmin = session?.user.id === event?.user_id || isAdmin;

  const handleDeleteImage = async (imageUrl: string) => {
    if (!event || !id) return;

    try {
      // Extract the file path from the URL
      const filePath = imageUrl.split("/").pop();
      if (!filePath) throw new Error("Invalid file path");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("event-images")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Update the database
      let newSliderImages =
        event.slider_images?.filter((img) => img !== imageUrl) || [];

      const { error: dbError } = await supabase
        .from("events")
        .update({
          slider_images: newSliderImages,
          ...(imageUrl === event.image_url ? { image_url: null } : {}),
        })
        .eq("id", id);

      if (dbError) throw dbError;

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const [isSharing, setIsSharing] = useState(false);

  const handleShareLink = async () => {
    try {
      setIsSharing(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
      const eventUrl = `${baseUrl || ""}/response?eventId=${event?.id}`;

      if (!baseUrl) {
        toast.error("Unable to determine base URL to share.");
        return;
      }

      // Create a short URL
      const shortUrl = await createShortUrl(eventUrl);

      // Copy to clipboard
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short URL copied to clipboard!");
    } catch (error) {
      console.error("Error sharing link:", error);
      toast.error("Failed to create short URL");
    } finally {
      setIsSharing(false);
    }
  };

  const [sliderInputType, setSliderInputType] =
    useState<SliderInputType>("file");
  const [newImageLink, setNewImageLink] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editBackgroundImageFile, setEditBackgroundImageFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState<EditEventFormState>({
    title: "",
    bride_name: "",
    groom_name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    location_url: "",
    status: "upcoming",
    theme_id: "classic",
    background_image_url: "",
  });

  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState<Guest>({ name: "", whatsapp_number: "+947" });
  const [guestInputMethod, setGuestInputMethod] = useState<"individual" | "csv">("individual");
  const [agenda, setAgenda] = useState<{ id?: string; time: string; description: string }[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState({ time: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [guestFilter, setGuestFilter] = useState<"all" | "accepted" | "declined" | "pending">("all");
  const [customShareMessage, setCustomShareMessage] = useState("");
  const [isSavingMessage, setIsSavingMessage] = useState(false);

  useEffect(() => {
    if (!event?.date) return;
    const eventDate = new Date(event.date);
    const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000);
    const isoDateTime = localDate.toISOString();

    setEditForm({
      title: event.title || "",
      bride_name: event.bride_name || "",
      groom_name: event.groom_name || "",
      description: event.description || "",
      date: isoDateTime.slice(0, 10),
      time: isoDateTime.slice(11, 16),
      location: event.location || "",
      location_url: event.location_url || "",
      status: event.status || "upcoming",
      theme_id: event.theme_id || "classic",
      background_image_url: event.background_image_url || "",
    });
    setAgenda(event.agenda || []);
    
    if (event.invitation_config?.custom_share_message) {
      setCustomShareMessage(event.invitation_config.custom_share_message);
    } else {
      setCustomShareMessage(`We're excited to invite you to ${event.title}. Please view your invitation and RSVP here`);
    }
  }, [event]);

  const handleAddImageLink = async () => {
    if (!event || !id) return;

    try {
      if (!isValidImageUrl(newImageLink)) {
        toast.error("Please enter a valid image URL");
        return;
      }

      if (event.slider_images && event.slider_images.length >= 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      const newSliderImages = [...(event.slider_images || []), newImageLink];

      const { error: updateError } = await supabase
        .from("events")
        .update({ slider_images: newSliderImages })
        .eq("id", id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Image added successfully");
      setNewImageLink("");
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    }
  };

  const handleAddSliderImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event || !id || !e.target.files?.length) return;

    try {
      if (event.slider_images && event.slider_images.length >= 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      const file = e.target.files[0];
      if (!isValidFileSize(file)) {
        toast.error("Image size exceeds 2MB limit.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(`slider/${fileName}`, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(`slider/${fileName}`);

      const newSliderImages = [...(event.slider_images || []), publicUrl];

      const { error: updateError } = await supabase
        .from("events")
        .update({ slider_images: newSliderImages })
        .eq("id", id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Image added successfully");
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !id) return;

    try {
      // Collect all storage paths for images to delete
      const storagePaths = [
        ...(event.slider_images || []).map((url) => url.split("/").pop()),
        event.image_url?.split("/").pop(),
        event.background_image_url?.split("/").pop(),
      ].filter(Boolean) as string[];

      // Delete images from storage
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("event-images")
          .remove(storagePaths);

        if (storageError) throw storageError;
      }

      // Delete the event from the database
      const { error: dbError } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Invalidate queries and navigate
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
      router.push(isAdmin ? "/admin" : "/dashboard");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleReuploadMainImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event || !id || !e.target.files?.length) return;

    try {
      const file = e.target.files[0];
      if (!isValidFileSize(file)) {
        toast.error("Image size exceeds 2MB limit.");
        return;
      }

      // Remove the old image if it exists
      if (event.image_url) {
        try {
          const oldFileName = event.image_url.split("/").pop();
          if (oldFileName) {
            const fullPath = `${session?.user.id}/${oldFileName}`;
            console.log("Full path to delete:", fullPath);

            const { error: removeError } = await supabase.storage
              .from("event-images")
              .remove([
                "efd91e7e-91a3-4509-a989-981fb7b59763/6cfa78e6-87d1-48b1-a715-79976e30ee1f-1740478041943.png",
              ]);

            if (removeError) {
              console.error("Error while removing file:", removeError.message);
              throw removeError;
            } else {
              console.log("File removed successfully from storage.");
            }
          } else {
            console.warn("File name could not be extracted from URL.");
          }
        } catch (error) {
          console.error("Error in file removal process:", error.message);
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${session?.user.id}/${id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, file);

      console.log(uploadData);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(fileName);

      const newSliderImages = [...(event.slider_images || []), publicUrl];

      const { error: updateError } = await supabase
        .from("events")
        .update({ slider_images: newSliderImages, image_url: publicUrl })
        .eq("id", id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Main image reuploaded successfully");
    } catch (error) {
      console.error("Error reuploading main image:", error);
      toast.error("Failed to reupload main image");
    }
  };

  const handleReuploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    await handleReuploadMainImage(e);
  };

  const handleUpdateInvitationConfig = async (newConfig: InvitationConfig) => {
    if (!event || !id) return;
    try {
      const { error } = await supabase
        .from("events")
        .update({ invitation_config: newConfig } as any)
        .eq("id", id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Invitation card updated successfully");
    } catch (error) {
      console.error("Error updating invitation card:", error);
      toast.error("Failed to update invitation card");
    }
  };

  const handleSaveShareMessage = async () => {
    if (!event || !id) return;
    setIsSavingMessage(true);
    try {
      const newConfig = {
        ...(event.invitation_config || {}),
        custom_share_message: customShareMessage,
      };
      const { error } = await supabase
        .from("events")
        .update({ invitation_config: newConfig } as any)
        .eq("id", id);

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Sharing message updated successfully!");
    } catch (error) {
      console.error("Error saving sharing message:", error);
      toast.error("Failed to save sharing message");
    } finally {
      setIsSavingMessage(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!event || !id) return;
    if (
      !editForm.title.trim() ||
      !editForm.bride_name.trim() ||
      !editForm.groom_name.trim() ||
      !editForm.location.trim() ||
      !editForm.date ||
      !editForm.time
    ) {
      toast.error("Title, bride name, groom name, date, time, and location are required.");
      return;
    }

    if (editForm.location_url && !isValidGoogleMapsUrl(editForm.location_url)) {
      toast.error("Please enter a valid Google Maps URL.");
      return;
    }

    setIsUpdatingEvent(true);
    try {
      let nextImageUrl = event.image_url || null;
      let nextBackgroundImageUrl = event.background_image_url || null;

      if (editBackgroundImageFile) {
        if (!isValidFileSize(editBackgroundImageFile)) {
          toast.error("Background event image exceeds 2MB limit.");
          return;
        }
        const fileExt = editBackgroundImageFile.name.split(".").pop();
        const fileName = `${session?.user?.id}/${id}-bg-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, editBackgroundImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("event-images").getPublicUrl(fileName);
        nextBackgroundImageUrl = publicUrl;
      }

      if (editImageFile) {
        if (!isValidFileSize(editImageFile)) {
          toast.error("Main event image exceeds 2MB limit.");
          return;
        }

        const fileExt = editImageFile.name.split(".").pop();
        const fileName = `${session?.user?.id}/${id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, editImageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(fileName);

        nextImageUrl = publicUrl;
      }

      const eventDateTime = new Date(`${editForm.date}T${editForm.time}`);

      const { error } = await supabase
        .from("events")
        .update({
          title: editForm.title,
          bride_name: editForm.bride_name,
          groom_name: editForm.groom_name,
          description: editForm.description || null,
          date: eventDateTime.toISOString(),
          location: editForm.location,
          location_url: editForm.location_url || null,
          status: editForm.status,
          theme_id: editForm.theme_id,
          image_url: nextImageUrl,
          background_image_url: nextBackgroundImageUrl,
          agenda: agenda,
        })
        .eq("id", id);

      if (error) throw error;

      if (guests.length > 0) {
        const { error: guestsError } = await supabase.from("attendees").insert(
          guests.map((guest) => ({
            event_id: id,
            name: guest.name,
            email: "",
            whatsapp_number: guest.whatsapp_number,
            response: "pending",
          })),
        );
        if (guestsError) throw guestsError;
      }

      await queryClient.invalidateQueries({ queryKey: ["event", id] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully");
      setIsEditDialogOpen(false);
      setEditImageFile(null);
      setGuests([]);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Button onClick={() => router.push(isAdmin ? "/admin" : "/dashboard")}>
          {isAdmin ? "Back to Admin System" : "Back to Dashboard"}
        </Button>
      </div>
    );
  }

  const filteredAttendees = (event?.attendees || []).filter((attendee) => {
    const matchesSearch = 
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attendee.whatsapp_number && attendee.whatsapp_number.includes(searchTerm));
      
    const matchesFilter = 
      guestFilter === "all" || 
      attendee.response === guestFilter;
      
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header & Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="space-y-1.5">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={isAdmin ? "/admin" : "/dashboard"} className="text-purple-600 hover:text-purple-700 transition-colors font-medium">
                    {isAdmin ? "Admin System" : "Dashboard"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={isAdmin ? "/admin" : "/dashboard"} className="text-purple-600 hover:text-purple-700 transition-colors font-medium">
                    Events
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-gray-900 max-w-[200px] truncate">
                    {event.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{event.title}</h1>
              <Badge className={`${getStatusColor(event.status)} border-0 font-medium px-2.5 py-0.5 rounded-full`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
            {(event.bride_name || event.groom_name) && (
              <p className="text-sm font-medium text-gray-500">
                Event for {event.bride_name || "Bride"} {event.bride_name && event.groom_name ? "&" : ""} {event.groom_name || "Groom"}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isOwnerOrAdmin && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 md:flex-none border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors shadow-sm">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto px-4 py-6 sm:p-6 bg-white overflow-x-hidden">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Edit Event Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Tabs defaultValue="general" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="general">Info</TabsTrigger>
                        <TabsTrigger value="agenda">Agenda</TabsTrigger>
                        <TabsTrigger value="guests">Guests</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                      </TabsList>

                      <TabsContent value="general" className="space-y-4 focus-visible:outline-none">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title" className="text-sm font-semibold text-gray-700">Title</Label>
                          <Input
                            id="edit-title"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-bride-name" className="text-sm font-semibold text-gray-700">Bride Name</Label>
                            <Input
                              id="edit-bride-name"
                              value={editForm.bride_name}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  bride_name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-groom-name" className="text-sm font-semibold text-gray-700">Groom Name</Label>
                            <Input
                              id="edit-groom-name"
                              value={editForm.groom_name}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  groom_name: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">Description</Label>
                          <textarea
                            id="edit-description"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-date" className="text-sm font-semibold text-gray-700">Date</Label>
                            <Input
                              id="edit-date"
                              type="date"
                              value={editForm.date}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, date: e.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-time" className="text-sm font-semibold text-gray-700">Time</Label>
                            <Input
                              id="edit-time"
                              type="time"
                              value={editForm.time}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, time: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-location" className="text-sm font-semibold text-gray-700">Location</Label>
                          <Input
                            id="edit-location"
                            value={editForm.location}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-location-url" className="text-sm font-semibold text-gray-700">Google Maps URL</Label>
                          <Input
                            id="edit-location-url"
                            type="url"
                            value={editForm.location_url}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                location_url: e.target.value,
                              }))
                            }
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-status" className="text-sm font-semibold text-gray-700">Status</Label>
                            <select
                              id="edit-status"
                              value={editForm.status}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, status: e.target.value }))
                              }
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-theme" className="text-sm font-semibold text-gray-700">Theme</Label>
                            <select
                              id="edit-theme"
                              value={editForm.theme_id === "lavender" ? "lavender" : "classic"}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, theme_id: e.target.value }))
                              }
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="classic">Classic Design</option>
                              <option value="lavender">Lavender Design</option>
                            </select>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="agenda" className="focus-visible:outline-none">
                        <EventAgenda
                          agenda={agenda}
                          newAgendaItem={newAgendaItem}
                          setNewAgendaItem={setNewAgendaItem}
                          setAgenda={setAgenda}
                          getMinTime={() => ""}
                          formDate={editForm.date}
                          getMinDate={() => ""}
                        />
                      </TabsContent>

                      <TabsContent value="guests" className="focus-visible:outline-none">
                        <div className="border rounded-lg p-4 bg-gray-50/50">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">Add New Guests</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Add more people to the guest list. These will be added as new pending attendees.
                          </p>
                          <EventGuestList
                            guests={guests}
                            newGuest={newGuest}
                            guestInputMethod={guestInputMethod}
                            setGuestInputMethod={setGuestInputMethod}
                            setNewGuest={setNewGuest}
                            setGuests={setGuests}
                            handleFileUpload={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const text = event.target?.result as string;
                                const rows = text.split("\n");
                                const newGuests = rows
                                  .map((row) => {
                                    const [name, whatsapp_number] = row
                                      .split(",")
                                      .map((cell) => cell.trim());
                                    if (name && whatsapp_number) {
                                      return {
                                        name,
                                        whatsapp_number,
                                      } as Guest;
                                    }
                                    return null;
                                  })
                                  .filter((guest): guest is Guest => guest !== null);

                                setGuests((prev) => [...prev, ...newGuests]);
                              };
                              reader.readAsText(file);
                              e.target.value = "";
                            }}
                            downloadTemplate={() => {
                              const csvContent = "John Doe,+94711234567\nJane Smith,+94711234568";
                              const blob = new Blob([csvContent], { type: "text/csv" });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "guest-list-sample.csv";
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                            }}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="media" className="space-y-4 focus-visible:outline-none">
                        <div className="space-y-2">
                          <Label htmlFor="edit-main-image" className="text-sm font-semibold text-gray-700">Main Image (optional replacement)</Label>
                          <Input
                            id="edit-main-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setEditImageFile(file);
                            }}
                          />
                          {editImageFile && (
                            <p className="text-xs text-gray-500">Selected: {editImageFile.name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-background-image" className="text-sm font-semibold text-gray-700">Background Image (optional replacement)</Label>
                          <Input
                            id="edit-background-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setEditBackgroundImageFile(file);
                            }}
                          />
                          {editBackgroundImageFile && (
                            <p className="text-xs text-gray-500">Selected: {editBackgroundImageFile.name}</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white pb-2 overflow-hidden shadow-[0_-10px_10px_-10px_rgba(0,0,0,0.1)]">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditDialogOpen(false);
                          setEditImageFile(null);
                          setEditBackgroundImageFile(null);
                        }}
                        disabled={isUpdatingEvent}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleUpdateEvent} disabled={isUpdatingEvent}>
                        {isUpdatingEvent ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Warning Notification for Inactive Events */}
        {!event.is_active && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 font-medium">
                  This event is currently inactive and cannot be shared.
                  To activate your event for sharing, please contact us on WhatsApp (0716561975).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details and Attendees Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Event Description Card */}
            <Card className="overflow-hidden border border-gray-100 shadow-sm">
              {event.image_url && (
                <div className="w-full aspect-[21/9] max-h-[300px] overflow-hidden border-b border-gray-100 bg-gray-50">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900">Event Overview</CardTitle>
                <p className="text-sm text-gray-500">Essential information and description of your celebration</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Metadata cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-purple-100 bg-gradient-to-br from-white to-purple-50/20 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl text-purple-700 shadow-sm">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          Date & Time
                        </h3>
                        <p className="text-gray-600 text-base">
                          {new Date(event.date).toLocaleString([], {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-purple-100 bg-gradient-to-br from-white to-purple-50/20 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl text-purple-700 shadow-sm">
                        <MapPinIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          Location
                        </h3>
                        <p className="text-gray-600 text-base truncate mb-2" title={event.location}>
                          {event.location}
                        </p>
                        {event.location_url && (
                          <a
                            href={event.location_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            <MapPinnedIcon className="w-4 h-4" />
                            View on Google Maps
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Event Description */}
                {event.description && (
                  <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agenda Timeline Card */}
            {event.agenda && event.agenda.length > 0 && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                    Event Schedule
                  </CardTitle>
                  <p className="text-sm text-gray-500">Planned timeline for the event day</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative border-l border-purple-200 ml-3 space-y-6">
                    {event.agenda.map((item, index) => (
                      <div key={item.id || index} className="relative pl-6">
                        <span className="absolute -left-2 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-50 border-2 border-purple-500 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full w-fit">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2 text-base leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guest Management Section */}
            {event.attendees && event.attendees.length > 0 && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-gray-900">Guest Directory</CardTitle>
                  <p className="text-sm text-gray-500">Manage invitations, RSVPs and delivery status</p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  
                  {/* Custom Invitation Message Edit Block */}
                  <div className="bg-purple-50/20 border border-purple-100/80 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-purple-600" />
                        <h4 className="font-semibold text-sm text-gray-900">Custom Invitation Message</h4>
                      </div>
                      {isOwnerOrAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveShareMessage}
                          disabled={isSavingMessage}
                          className="h-8 border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          {isSavingMessage ? "Saving..." : "Save Message"}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-normal">
                      Customize the invitation text template sent on WhatsApp.
                      The message will be sent as: <br />
                      <code className="inline-block mt-1 bg-purple-50 text-purple-800 font-mono text-[10px] px-2 py-1 rounded border border-purple-100">
                        Hi [Guest Name]! [Your Message]: [Invitation Link]
                      </code>
                    </p>
                    <textarea
                      value={customShareMessage}
                      onChange={(e) => setCustomShareMessage(e.target.value)}
                      placeholder={`We're excited to invite you to ${event.title}. Please view your invitation and RSVP here`}
                      className="w-full min-h-[70px] text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Guest Filters and Search row */}
                  <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Input
                        type="text"
                        placeholder="Search guests by name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10"
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex flex-wrap gap-1 bg-gray-100/80 p-1 rounded-lg w-fit">
                      <button
                        onClick={() => setGuestFilter("all")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          guestFilter === "all"
                            ? "bg-white text-purple-700 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        All ({event.attendees.length})
                      </button>
                      <button
                        onClick={() => setGuestFilter("accepted")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          guestFilter === "accepted"
                            ? "bg-green-500 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-green-50"
                        }`}
                      >
                        Accepted ({event.attendees.filter(a => a.response === 'accepted').length})
                      </button>
                      <button
                        onClick={() => setGuestFilter("pending")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          guestFilter === "pending"
                            ? "bg-yellow-500 text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-yellow-50"
                        }`}
                      >
                        Pending ({event.attendees.filter(a => a.response === 'pending').length})
                      </button>
                      <button
                        onClick={() => setGuestFilter("declined")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          guestFilter === "declined"
                            ? "bg-red-500 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-red-50"
                        }`}
                      >
                        Declined ({event.attendees.filter(a => a.response === 'declined').length})
                      </button>
                    </div>
                  </div>

                  {/* Desktop View Table */}
                  <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-700">Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttendees.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                              No guests found matching the filter criteria.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAttendees.map((attendee) => (
                            <TableRow key={attendee.id} className="hover:bg-gray-50/40 transition-colors">
                              <TableCell className="font-medium text-gray-900">
                                {attendee.name}
                              </TableCell>
                              <TableCell>
                                {attendee.whatsapp_number ? (
                                  <span className="text-gray-600 font-mono text-sm">{attendee.whatsapp_number}</span>
                                ) : (
                                  <span className="text-gray-400 italic text-sm">No number</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    attendee.response === "accepted"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : attendee.response === "declined"
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  }
                                >
                                  {attendee.response.charAt(0).toUpperCase() + attendee.response.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8"
                                    onClick={async () => {
                                      try {
                                        const shortUrl = await createAttendeeShortUrl(event.id, attendee.id);
                                        window.open(shortUrl, "_blank");
                                      } catch (error) {
                                        console.error("Error opening invite:", error);
                                        toast.error("Failed to open invitation");
                                      }
                                    }}
                                  >
                                    <EyeIcon className="h-3.5 w-3.5 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8"
                                    onClick={async () => {
                                      try {
                                        const shortUrl = await createAttendeeShortUrl(event.id, attendee.id);
                                        const shareMsg = event.invitation_config?.custom_share_message || `We're excited to invite you to ${event.title}. Please view your invitation and RSVP here`;
                                        const message = `Hi ${attendee.name}! ${shareMsg}: ${shortUrl}`;
                                        const encodedMessage = encodeURIComponent(message);
                                        const whatsappUrl = attendee.whatsapp_number
                                          ? `https://wa.me/${attendee.whatsapp_number.replace(/\D/g, "")}?text=${encodedMessage}`
                                          : `https://wa.me/?text=${encodedMessage}`;

                                        window.open(whatsappUrl, "_blank");
                                      } catch (error) {
                                        console.error("Error sharing on WhatsApp:", error);
                                        toast.error("Failed to share on WhatsApp");
                                      }
                                    }}
                                  >
                                    <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                    Share
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8"
                                    onClick={async () => {
                                      try {
                                        const shortUrl = await createAttendeeShortUrl(event.id, attendee.id);
                                        await navigator.clipboard.writeText(shortUrl);
                                        toast.success("Short link copied to clipboard!");
                                      } catch (error) {
                                        console.error("Error copying link:", error);
                                        toast.error("Failed to create short URL");
                                      }
                                    }}
                                  >
                                    <LinkIcon className="h-3.5 w-3.5" />
                                  </Button>
                                  {event.final_card_url && (
                                    <GuestInvitationDownloader
                                      attendeeName={attendee.name}
                                      finalCardUrl={event.final_card_url}
                                    />
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Stacked Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredAttendees.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 bg-gray-50/50 border rounded-lg">
                        No guests found matching the filter criteria.
                      </div>
                    ) : (
                      filteredAttendees.map((attendee) => (
                        <div key={attendee.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3.5 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="font-semibold text-gray-900 text-base">{attendee.name}</div>
                            <Badge
                              variant="secondary"
                              className={
                                attendee.response === "accepted"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : attendee.response === "declined"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }
                            >
                              {attendee.response?.charAt(0).toUpperCase() + attendee.response?.slice(1)}
                            </Badge>
                          </div>

                          {attendee.whatsapp_number && (
                            <div className="text-sm text-gray-600 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                              <div className="flex items-center">
                                <span className="font-semibold text-gray-500 w-20 flex-shrink-0">WhatsApp:</span>
                                <span className="font-mono">{attendee.whatsapp_number}</span>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 justify-center h-9 border border-purple-200 text-purple-700 text-xs"
                                onClick={async () => {
                                  try {
                                    const shortUrl = await createAttendeeShortUrl(event.id, attendee.id);
                                    window.open(shortUrl, "_blank");
                                  } catch (error) {
                                    console.error("Error opening invite:", error);
                                    toast.error("Failed to open invitation");
                                  }
                                }}
                              >
                                <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 justify-center h-9 border border-green-200 text-green-700 hover:bg-green-50 text-xs"
                                onClick={async () => {
                                  try {
                                    const shortUrl = await createAttendeeShortUrl(event.id, attendee.id);
                                    const shareMsg = event.invitation_config?.custom_share_message || `We're excited to invite you to ${event.title}. Please view your invitation and RSVP here`;
                                    const message = `Hi ${attendee.name}! ${shareMsg}: ${shortUrl}`;
                                    const encodedMessage = encodeURIComponent(message);
                                    const whatsappUrl = attendee.whatsapp_number
                                      ? `https://wa.me/${attendee.whatsapp_number.replace(/\D/g, "")}?text=${encodedMessage}`
                                      : `https://wa.me/?text=${encodedMessage}`;

                                    window.open(whatsappUrl, "_blank");
                                  } catch (error) {
                                    console.error("Error sharing on WhatsApp:", error);
                                    toast.error("Failed to share on WhatsApp");
                                  }
                                }}
                              >
                                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                Share
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 justify-center h-9 border border-gray-200 text-gray-500 text-xs"
                                onClick={async () => {
                                  try {
                                    const shortUrl = await createAttendeeShortUrl(event.id, attendee.id);
                                    await navigator.clipboard.writeText(shortUrl);
                                    toast.success("Short link copied to clipboard!");
                                  } catch (error) {
                                    console.error("Error sharing link:", error);
                                    toast.error("Failed to create short URL");
                                  }
                                }}
                              >
                                <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                                Copy Link
                              </Button>

                              {event.final_card_url && (
                                <div className="flex-1 w-full [&>button]:w-full [&>button]:justify-center [&>button]:h-9 [&>button]:border [&>button]:border-gray-200 [&>button]:text-xs">
                                  <GuestInvitationDownloader
                                    attendeeName={attendee.name}
                                    finalCardUrl={event.final_card_url}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Config and Analytics Column */}
          <div className="space-y-8">
            
            {/* Invitation Preview Card */}
            <InvitationPreviewCard
              invitationConfig={event.invitation_config as InvitationConfig | null}
              eventData={{
                title: event.title,
                date: event.date,
                time: new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location: event.location,
                bride_name: event.bride_name,
                groom_name: event.groom_name,
                description: event.description || "",
              }}
              isEditable={isOwnerOrAdmin}
              onSave={handleUpdateInvitationConfig}
            />

            {/* Attendance Overview Card */}
            {event.attendees && event.attendees.length > 0 && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Attendance Overview</CardTitle>
                  <p className="text-xs text-gray-500">Live RSVP confirmation responses statistics</p>
                </CardHeader>
                <CardContent>
                  <AttendanceChart
                    attendees={event.attendees.map((attendee) => ({
                      ...attendee,
                      response: attendee.response || "pending",
                    }))}
                  />
                </CardContent>
              </Card>
            )}

            {/* Gallery Images Card */}
            {event.slider_images && event.slider_images.length > 0 ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>Event Gallery</span>
                    {isOwnerOrAdmin && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                            <PlusIcon className="w-3.5 h-3.5 mr-1" />
                            Add Image
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>Add Gallery Image</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={
                                  sliderInputType === "file"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => setSliderInputType("file")}
                                className="flex-1"
                              >
                                <UploadIcon className="w-4 h-4 mr-2" />
                                Upload File
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  sliderInputType === "link"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => setSliderInputType("link")}
                                className="flex-1"
                              >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Image URL
                              </Button>
                            </div>

                            {sliderInputType === "file" ? (
                              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                                <Label
                                  htmlFor="add-slider"
                                  className="flex flex-col items-center gap-2 cursor-pointer"
                                >
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    Click to upload image
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (Max 2MB)
                                  </span>
                                  <Input
                                    type="file"
                                    id="add-slider"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAddSliderImage}
                                  />
                                </Label>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Image URL</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="url"
                                      placeholder="https://example.com/image.jpg"
                                      value={newImageLink}
                                      onChange={(e) =>
                                        setNewImageLink(e.target.value)
                                      }
                                    />
                                    <Button onClick={handleAddImageLink}>
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardTitle>
                  <p className="text-xs text-gray-500">Pictures displayed in wedding invite gallery</p>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="relative group">
                    {isOwnerOrAdmin && (
                      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8 shadow-md">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Gallery Image
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this image? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await handleDeleteImage(
                                    event.slider_images[0],
                                  );
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    <Carousel className="w-full">
                      <CarouselContent>
                        {event.slider_images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-100">
                              <img
                                src={image}
                                alt={`Event image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1">
                        <CarouselPrevious className="static translate-y-0 h-8 w-8 text-gray-700 bg-white/80 hover:bg-white border border-gray-200 shadow-sm" />
                        <CarouselNext className="static translate-y-0 h-8 w-8 text-gray-700 bg-white/80 hover:bg-white border border-gray-200 shadow-sm" />
                      </div>
                    </Carousel>
                  </div>
                </CardContent>
              </Card>
            ) : (
              isOwnerOrAdmin && (
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900">Add Gallery Images</CardTitle>
                    <p className="text-xs text-gray-500">Populate the gallery on your invitation template</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            sliderInputType === "file" ? "default" : "outline"
                          }
                          onClick={() => setSliderInputType("file")}
                          className="flex-1 text-xs"
                        >
                          <UploadIcon className="w-4 h-4 mr-2" />
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={
                            sliderInputType === "link" ? "default" : "outline"
                          }
                          onClick={() => setSliderInputType("link")}
                          className="flex-1 text-xs"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Image URL
                        </Button>
                      </div>

                      {sliderInputType === "file" ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-purple-100 bg-purple-50/10">
                          <Label
                            htmlFor="first-slider"
                            className="flex flex-col items-center gap-2 cursor-pointer w-full text-center"
                          >
                            <ImageIcon className="w-8 h-8 text-purple-400" />
                            <span className="text-sm font-medium text-gray-700">
                              Click to upload images
                            </span>
                            <span className="text-xs text-gray-400">
                              (Max 2MB)
                            </span>
                            <Input
                              type="file"
                              id="first-slider"
                              className="hidden"
                              accept="image/*"
                              onChange={handleAddSliderImage}
                            />
                          </Label>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700">Image URL</Label>
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={newImageLink}
                                onChange={(e) =>
                                  setNewImageLink(e.target.value)
                                }
                                className="h-9 text-sm"
                              />
                              <Button onClick={handleAddImageLink} size="sm" className="h-9">Add</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Danger Zone Card */}
            {isOwnerOrAdmin && (
              <Card className="border border-red-100 bg-red-50/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-red-900 text-lg font-bold flex items-center gap-2">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                    Danger Zone
                  </CardTitle>
                  <p className="text-xs text-red-600">Irreversible administrative actions</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-red-700 leading-relaxed">
                    Once you delete this event, there is no going back. This will permanently remove the event, its agenda timeline, gallery media, and all RSVPs.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full shadow-sm">
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500">
                          This action cannot be undone. This will permanently delete
                          the event and all its associated data including images and
                          attendee information.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleDeleteEvent}>
                          Delete Event
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

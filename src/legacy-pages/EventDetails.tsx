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
} from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types/event";
import { useAuth } from "@/components/AuthProvider";
import { AttendanceChart } from "@/components/event/AttendanceChart";
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
import { isValidGoogleMapsUrl, isValidImageUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getStatusColor } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createShortUrl } from "@/lib/url-shortener";
import InvitationPreviewCard from "@/components/event/InvitationPreviewCard";

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
  const { session } = useAuth();
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
            email,
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
    theme_id: "vertical",
    background_image_url: "",
  });

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
      theme_id: event.theme_id || "vertical",
      background_image_url: event.background_image_url || "",
    });
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
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
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
      router.push("/dashboard");
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
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
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
        if (editBackgroundImageFile.size > 2 * 1024 * 1024) {
          toast.error("Background image size should be less than 2MB.");
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
        if (editImageFile.size > 2 * 1024 * 1024) {
          toast.error("Main image size should be less than 2MB.");
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
        })
        .eq("id", id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["event", id] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully");
      setIsEditDialogOpen(false);
      setEditImageFile(null);
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
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            {session?.user.id === event.user_id && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Event Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-bride-name">Bride Name</Label>
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
                        <Label htmlFor="edit-groom-name">Groom Name</Label>
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
                      <Label htmlFor="edit-description">Description</Label>
                      <textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-date">Date</Label>
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
                        <Label htmlFor="edit-time">Time</Label>
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
                      <Label htmlFor="edit-location">Location</Label>
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
                      <Label htmlFor="edit-location-url">Google Maps URL</Label>
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
                        <Label htmlFor="edit-status">Status</Label>
                        <select
                          id="edit-status"
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, status: e.target.value }))
                          }
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-theme">Theme</Label>
                        <select
                          id="edit-theme"
                          value={editForm.theme_id}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, theme_id: e.target.value }))
                          }
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="vertical">Vertical</option>
                          <option value="circular">Circular</option>
                          <option value="diagonal">Diagonal</option>
                          <option value="stacked">Stacked</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-main-image">Main Image (optional replacement)</Label>
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
                      <Label htmlFor="edit-background-image">Background Image (optional replacement)</Label>
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
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditDialogOpen(false);
                          setEditImageFile(null);
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
            <Button
              variant="outline"
              onClick={handleShareLink}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Share2Icon className="w-4 h-4 mr-2" />
                  Share Event
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className={getStatusColor(event.status)}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold mt-2">
                {event.title}
              </CardTitle>
              {(event.bride_name || event.groom_name) && (
                <p className="text-sm text-gray-600 mt-1">
                  {event.bride_name || "Bride"} {event.bride_name && event.groom_name ? "&" : ""}{" "}
                  {event.groom_name || "Groom"}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {event.image_url && (
                <div className="relative flex justify-center items-center">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-1/2 h-auto object-cover rounded-lg"
                  />
                  {/* <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  className="absolute bottom-2 right-2 flex items-center gap-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  Replace Image
                </Button>
                <Input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleReuploadImage}
                /> */}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 bg-gray-100 rounded-lg shadow-sm">
                  <CalendarIcon className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">
                      Date & Time
                    </h3>
                    <p className="text-gray-700 text-base">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-gray-100 rounded-lg shadow-sm">
                  <MapPinIcon className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">
                      Location
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-700 text-base">
                        {event.location}
                      </p>
                      {event.location_url && (
                        <a
                          href={event.location_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <MapPinnedIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="p-6 bg-gray-100 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Description
                  </h3>
                  <p className="text-gray-700 text-base whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {event.attendees && event.attendees.length > 0 && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Guest List</h3>
                  </div>
                  <Card className="mt-6">
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {event.attendees.map((attendee) => (
                            <TableRow key={attendee.id}>
                              <TableCell className="font-medium">
                                {attendee.name}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {attendee.email && (
                                    <div className="text-sm text-gray-600">
                                      {attendee.email}
                                    </div>
                                  )}
                                  {attendee.whatsapp_number && (
                                    <div className="text-sm text-gray-600">
                                      {attendee.whatsapp_number}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    attendee.response === "accepted"
                                      ? "bg-green-500 text-white"
                                      : attendee.response === "declined"
                                        ? "bg-red-600 text-white"
                                        : "bg-yellow-300 text-gray-800"
                                  }
                                >
                                  {attendee.response.charAt(0).toUpperCase() +
                                    attendee.response.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary-700 hover:bg-primary-50"
                                  onClick={async () => {
                                    try {
                                      const baseUrl =
                                        process.env.NEXT_PUBLIC_SITE_URL ||
                                        process.env.NEXT_PUBLIC_BASE_URL ||
                                        (typeof window !== "undefined" &&
                                        window.location
                                          ? window.location.origin
                                          : "");
                                      if (!baseUrl) {
                                        toast.error(
                                          "Unable to determine base URL to share.",
                                        );
                                        return;
                                      }
                                      const responseUrl = `${baseUrl}/response?eventId=${event.id}&attendeeId=${attendee.id}`;

                                      // Create a short URL
                                      const shortUrl =
                                        await createShortUrl(responseUrl);

                                      // Copy to clipboard
                                      await navigator.clipboard.writeText(
                                        shortUrl,
                                      );
                                      toast.success(
                                        "Short link copied to clipboard!",
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error sharing link:",
                                        error,
                                      );
                                      toast.error("Failed to create short URL");
                                    }
                                  }}
                                >
                                  <Share2Icon className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Invitation Preview */}
            <InvitationPreviewCard
              invitationConfig={event.invitation_config}
              eventData={{
                title: event.title,
                date: event.date,
                location: event.location,
              }}
            />

            {event.attendees && event.attendees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
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
            {event.slider_images && event.slider_images.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Event Gallery</span>
                    {session?.user.id === event.user_id && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Image
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative">
                    {session?.user.id === event.user_id && (
                      <div className="absolute top-2 right-2 z-10">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
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
                            <div className="relative aspect-video">
                              <img
                                src={image}
                                alt={`Event image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <CarouselPrevious />
                        <CarouselNext />
                      </div>
                    </Carousel>
                  </div>
                </CardContent>
              </Card>
            ) : (
              session?.user.id === event.user_id && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Gallery Images</CardTitle>
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
                          className="flex-1"
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
                          className="flex-1"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Image URL
                        </Button>
                      </div>

                      {sliderInputType === "file" ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                          <Label
                            htmlFor="first-slider"
                            className="flex flex-col items-center gap-2 cursor-pointer"
                          >
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Click to upload images
                            </span>
                            <span className="text-xs text-gray-500">
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
                              <Button onClick={handleAddImageLink}>Add</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
            <div className="flex justify-center bg-red-500 bg-opacity-10 p-4 rounded-lg">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

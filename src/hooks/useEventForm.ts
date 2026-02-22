"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Guest, FormData, SliderImage } from "@/types/event-form";
import { InvitationConfig } from "@/types/invitation";
import { AgendaItem } from "@/types/event";
import {
  isValidGoogleMapsUrl,
  isValidImageUrl,
  convertToDirectImageUrl,
} from "@/lib/utils";
import { availableThemes } from "@/components/event/EventThemeSelection";

export const useEventForm = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    location_url: "",
    image_url: "",
    theme_id: availableThemes[0].id,
    invitation_config: undefined,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [newImageLink, setNewImageLink] = useState("");
  const [sliderInputType, setSliderInputType] = useState<"file" | "link">(
    "file",
  );
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState<Guest>({
    name: "",
    email: "",
    whatsapp_number: "",
  });
  const [guestInputMethod, setGuestInputMethod] = useState<
    "individual" | "csv"
  >("individual");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState<AgendaItem>({
    id: "",
    time: "",
    description: "",
  });
  const [invitationConfig, setInvitationConfig] = useState<
    InvitationConfig | undefined
  >(undefined);

  useEffect(() => {
    if (!session) {
      toast.error("Please log in to create an event");
      router.push("/auth");
    }
  }, [session, router]);

  const validateForm = () => {
    const errors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.date) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = "Date cannot be in the past";
      }
    }

    if (!formData.time) {
      errors.time = "Time is required";
    } else if (formData.date === getMinDate()) {
      const [hours, minutes] = formData.time.split(":");
      const selectedTime = new Date();
      selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const now = new Date();
      if (selectedTime < now) {
        errors.time = "Time cannot be in the past";
      }
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    if (formData.location_url && !isValidGoogleMapsUrl(formData.location_url)) {
      errors.location_url = "Please enter a valid Google Maps URL";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinTime = () => {
    if (formData.date === getMinDate()) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      let mainImageUrl = "";
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(
            `${session.user.id}/${Date.now()}-${imageFile.name}`,
            imageFile,
          );

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(uploadData.path);

        mainImageUrl = publicUrl;
      }

      const processedSliderImages = await Promise.all(
        sliderImages.map(async (image) => {
          if (image.type === "file" && image.file) {
            const { data: uploadData, error: uploadError } =
              await supabase.storage
                .from("event-images")
                .upload(
                  `${session.user.id}/${Date.now()}-${image.file.name}`,
                  image.file,
                );

            if (uploadError) throw uploadError;

            const {
              data: { publicUrl },
            } = supabase.storage
              .from("event-images")
              .getPublicUrl(uploadData.path);

            return publicUrl;
          }
          return image.url;
        }),
      );

      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      const formattedAgenda =
        agenda.length > 0
          ? agenda.map((item) => ({
              ...item,
              time: item.time,
              description: item.description,
            }))
          : null;

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert({
          title: formData.title,
          description: formData.description,
          date: eventDateTime.toISOString(),
          location: formData.location,
          location_url: formData.location_url,
          image_url: mainImageUrl,
          slider_images: processedSliderImages,
          status: "upcoming",
          user_id: session.user.id,
          agenda: formattedAgenda,
          theme_id: formData.theme_id,
          invitation_config: invitationConfig,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      if (guests.length > 0) {
        const { error: guestsError } = await supabase.from("attendees").insert(
          guests.map((guest) => ({
            event_id: eventData.id,
            name: guest.name,
            email: guest.email,
            whatsapp_number: guest.whatsapp_number,
            response: "pending",
          })),
        );

        if (guestsError) throw guestsError;
      }

      toast.success("Event created successfully!");
      router.push(`/dashboard`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview,
    isUploading,
    sliderImages,
    setSliderImages,
    newImageLink,
    setNewImageLink,
    sliderInputType,
    setSliderInputType,
    guests,
    setGuests,
    newGuest,
    setNewGuest,
    guestInputMethod,
    setGuestInputMethod,
    errors,
    isSubmitting,
    agenda,
    setAgenda,
    newAgendaItem,
    setNewAgendaItem,
    invitationConfig,
    setInvitationConfig,
    handleSubmit,
    getMinDate,
    getMinTime,
  };
};

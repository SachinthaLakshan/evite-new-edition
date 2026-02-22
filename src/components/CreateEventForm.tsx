"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EventBasicDetails } from "./event/EventBasicDetails";
import { EventAgenda } from "./event/EventAgenda";
import { EventSliderImages } from "./event/EventSliderImages";
import { EventGuestList } from "./event/EventGuestList";
import { useEventForm } from "@/hooks/useEventForm";
import { Guest } from "@/types/event-form";
import { convertToDirectImageUrl } from "@/lib/utils";
import EventThemeSelection from "./event/EventThemeSelection";
import InvitationDesigner from "./invitation/InvitationDesigner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CreateEventForm = () => {
  const router = useRouter();
  const {
    formData,
    setFormData,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview,
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
  } = useEventForm();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleThemeChange = (themeId: string) => {
    setFormData((prev) => ({
      ...prev,
      theme_id: themeId,
    }));
  };

  const [isInvitationOpen, setIsInvitationOpen] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-gray-600 mt-2">
          Fill in the details to create your event
        </p>
      </div>

      <EventBasicDetails
        formData={formData}
        errors={errors}
        imageFile={imageFile}
        imagePreview={imagePreview}
        handleInputChange={handleInputChange}
        handleImageChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }}
        removeImage={() => {
          setImageFile(null);
          setImagePreview("");
        }}
        getMinDate={getMinDate}
        getMinTime={getMinTime}
      />

      <EventAgenda
        agenda={agenda}
        newAgendaItem={newAgendaItem}
        setNewAgendaItem={setNewAgendaItem}
        setAgenda={setAgenda}
        getMinTime={getMinTime}
        formDate={formData.date}
        getMinDate={getMinDate}
      />

      <EventSliderImages
        sliderImages={sliderImages}
        sliderInputType={sliderInputType}
        newImageLink={newImageLink}
        setSliderInputType={setSliderInputType}
        setNewImageLink={setNewImageLink}
        handleSliderImageChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (sliderImages.length + files.length > 5) {
            return;
          }
          files.forEach((file) => {
            if (file.size > 2 * 1024 * 1024) return;
            const previewUrl = URL.createObjectURL(file);
            setSliderImages((prev) => [
              ...prev,
              {
                type: "file",
                url: previewUrl,
                file,
              },
            ]);
          });
        }}
        handleAddImageLink={() => {
          if (!newImageLink) return;
          if (sliderImages.length >= 5) return;
          const directUrl = convertToDirectImageUrl(newImageLink);
          setSliderImages((prev) => [
            ...prev,
            { type: "link", url: directUrl },
          ]);
          setNewImageLink("");
        }}
        removeSliderImage={(index) => {
          setSliderImages((prev) => {
            const newImages = [...prev];
            if (newImages[index].type === "file") {
              URL.revokeObjectURL(newImages[index].url);
            }
            newImages.splice(index, 1);
            return newImages;
          });
        }}
      />

      <EventThemeSelection
        selectedTheme={formData.theme_id || ""}
        onThemeChange={handleThemeChange}
      />

      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-indigo-500/90 via-indigo-500 to-purple-500 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#fff,transparent_25%),radial-gradient(circle_at_80%_30%,#fff,transparent_20%),radial-gradient(circle_at_50%_80%,#fff,transparent_20%)]" />
        <div className="relative flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white shadow-inner">
              ✉️
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Invitation Designer
              </div>
              <h3 className="mt-2 text-xl font-semibold leading-tight">
                Craft a beautiful invite
              </h3>
              <p className="text-sm text-white/90">
                Tune your template, colors, copy, and guest name placement with
                live preview.
              </p>
              {invitationConfig?.template_id && (
                <p className="mt-2 text-sm text-white/90">
                  Selected template:{" "}
                  <span className="font-semibold">
                    {invitationConfig.template_id}
                  </span>
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="bg-white text-indigo-600 hover:bg-white/90"
            onClick={() => setIsInvitationOpen(true)}
          >
            Open Designer
          </Button>
        </div>
      </div>

      <Dialog open={isInvitationOpen} onOpenChange={setIsInvitationOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invitation Designer</DialogTitle>
            <DialogDescription>
              Set your invitation template, names, colors, and preview before
              saving.
            </DialogDescription>
          </DialogHeader>
          <InvitationDesigner
            initialConfig={invitationConfig}
            eventData={{
              title: formData.title || "Your Event",
              date:
                formData.date && formData.time
                  ? `${formData.date}T${formData.time}`
                  : new Date().toISOString(),
              location: formData.location || "Event Location",
            }}
            onConfigChange={setInvitationConfig}
          />
        </DialogContent>
      </Dialog>

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
                const [name, email, whatsapp_number] = row
                  .split(",")
                  .map((cell) => cell.trim());
                if (name && email) {
                  return {
                    name,
                    email,
                    whatsapp_number: whatsapp_number || "",
                  } as Guest; // Explicitly cast to Guest to fix the type error
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
          const csvContent =
            "John Doe,john@example.com,+1234567890\nJane Smith,jane@example.com,+0987654321";
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

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Event..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default CreateEventForm;

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
import InvitationDesigner from "./invitation/InvitationDesigner";
import { Check, ChevronRight } from "lucide-react";

const steps = [
  { id: 1, name: "Basic Details" },
  { id: 2, name: "Agenda & Gallery" },
  { id: 3, name: "Design Invite" },
  { id: 4, name: "Guest List" },
];

const CreateEventForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const {
    formData,
    setFormData,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview,
    backgroundImageFile,
    setBackgroundImageFile,
    backgroundImagePreview,
    setBackgroundImagePreview,
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

  const preventEnterSubmit = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      onKeyDown={preventEnterSubmit}
      className="max-w-5xl mx-auto py-8 space-y-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-gray-600 mt-2">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
        </p>
      </div>

      {/* Stepper UI */}
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center justify-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className={`relative ${
                stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
              }`}
            >
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div
                  className={`h-0.5 w-full ${
                    step.id < currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              </div>
              <a
                href="#"
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  step.id < currentStep
                    ? "bg-primary hover:bg-primary/90"
                    : step.id === currentStep
                    ? "border-2 border-primary bg-white shadow-md ring-4 ring-primary/10"
                    : "border-2 border-gray-300 bg-white hover:border-gray-400"
                }`}
                aria-current={step.id === currentStep ? "step" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
              >
                {step.id < currentStep ? (
                  <Check className="h-6 w-6 text-white" aria-hidden="true" />
                ) : (
                  <span
                    className={`font-semibold ${
                      step.id === currentStep ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    {step.id}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium w-max text-gray-500 hidden sm:block">
                  {step.name}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="min-h-[400px] mt-16 transition-all duration-300">
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EventBasicDetails
              formData={formData}
              errors={errors}
              imageFile={imageFile}
              imagePreview={imagePreview}
              backgroundImageFile={backgroundImageFile}
              backgroundImagePreview={backgroundImagePreview}
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
              handleBackgroundImageChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBackgroundImageFile(file);
                setBackgroundImagePreview(URL.createObjectURL(file));
              }}
              removeBackgroundImage={() => {
                setBackgroundImageFile(null);
                setBackgroundImagePreview("");
              }}
              getMinDate={getMinDate}
              getMinTime={getMinTime}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
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
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>🎨</span> Design Your Invitation
                </h2>
                <p className="text-gray-500">Customize the look and feel of the invitation card your guests will receive.</p>
              </div>
              <InvitationDesigner
                initialConfig={invitationConfig}
                eventData={{
                  title: formData.title || "Your Event",
                  date:
                    formData.date && formData.time
                      ? `${formData.date}T${formData.time}`
                      : new Date().toISOString(),
                  time: formData.time || "12:00 PM",
                  location: formData.location || "Event Location",
                  bride_name: formData.bride_name || "Bride",
                  groom_name: formData.groom_name || "Groom",
                  description: formData.description || "",
                }}
                onConfigChange={setInvitationConfig}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (currentStep === 1) {
              router.back();
            } else {
              prevStep();
            }
          }}
          disabled={isSubmitting}
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>
        
        <div className="flex gap-4">
          {currentStep < steps.length && (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-primary hover:bg-primary/90 min-w-[120px]"
            >
              Next Step <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {currentStep === steps.length && (
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? "Creating Event..." : "Complete & Create Event"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateEventForm;

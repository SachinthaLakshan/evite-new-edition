import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, MapPinIcon, ImageIcon, XIcon } from "lucide-react";

interface EventBasicDetailsProps {
  formData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    location_url?: string;
  };
  errors: Partial<{
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    location_url?: string;
  }>;
  imageFile: File | null;
  imagePreview: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  getMinDate: () => string;
  getMinTime: () => string;
}

export const EventBasicDetails: React.FC<EventBasicDetailsProps> = ({
  formData,
  errors,
  imageFile,
  imagePreview,
  handleInputChange,
  handleImageChange,
  removeImage,
  getMinDate,
  getMinTime,
}) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-semibold">Basic Details</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">Event Title</Label>
          <Input
            id="title"
            placeholder="Enter event title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base">Main Event Image</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="max-h-[200px] mx-auto rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="py-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload main event image
                  </span>
                  <span className="text-xs text-gray-400">
                    (Max size: 2MB)
                  </span>
                </Label>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter event description"
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                id="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getMinDate()}
                className={`w-full ${errors.date ? "border-red-500" : ""}`}
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-base flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Time
            </Label>
            <div className="relative">
              <Input
                type="time"
                id="time"
                value={formData.time}
                onChange={handleInputChange}
                min={formData.date === getMinDate() ? getMinTime() : undefined}
                className={`w-full ${errors.time ? "border-red-500" : ""}`}
              />
              <ClockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            {errors.time && (
              <p className="text-sm text-red-500">{errors.time}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-base flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            Location
          </Label>
          <div className="space-y-2">
            <Input
              id="location"
              placeholder="Enter venue name or address"
              value={formData.location}
              onChange={handleInputChange}
              className={errors.location ? "border-red-500" : ""}
            />
            <Input
              id="location_url"
              placeholder="Google Maps link (optional)"
              value={formData.location_url || ""}
              onChange={handleInputChange}
              className={errors.location_url ? "border-red-500" : ""}
            />
            <p className="text-sm text-gray-500">
              Tip: Open Google Maps, find your location, click "Share" and paste the link here
            </p>
          </div>
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location}</p>
          )}
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadIcon, LinkIcon, XIcon } from "lucide-react";

interface SliderImage {
  type: 'file' | 'link';
  url: string;
  file?: File;
}

interface EventSliderImagesProps {
  sliderImages: SliderImage[];
  sliderInputType: 'file' | 'link';
  newImageLink: string;
  setSliderInputType: React.Dispatch<React.SetStateAction<'file' | 'link'>>;
  setNewImageLink: React.Dispatch<React.SetStateAction<string>>;
  handleSliderImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddImageLink: () => void;
  removeSliderImage: (index: number) => void;
}

export const EventSliderImages: React.FC<EventSliderImagesProps> = ({
  sliderImages,
  sliderInputType,
  newImageLink,
  setSliderInputType,
  setNewImageLink,
  handleSliderImageChange,
  handleAddImageLink,
  removeSliderImage,
}) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Gallery Images</h2>
        <span className="text-sm text-gray-500">
          {sliderImages.length}/5 images
        </span>
      </div>

      <div className="space-y-6">
        <Input
          type="file"
          id="slider-images"
          accept="image/*"
          multiple
          onChange={handleSliderImageChange}
          disabled={sliderImages.length >= 5}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("slider-images")?.click()}
          disabled={sliderImages.length >= 5}
          className="w-full h-auto py-10 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-primary transition-all duration-300 group"
        >
          <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <UploadIcon className="w-6 h-6 text-primary/80" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-gray-700">
              {sliderImages.length >= 5
                ? "Maximum 5 images reached"
                : "Click to Select Images"}
            </span>
            <span className="text-xs text-gray-500 font-normal">
              You can upload up to 5 images (Max 2MB each)
            </span>
          </div>
        </Button>

        {sliderImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sliderImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeSliderImage(index)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {image.type === 'file' ? 'Uploaded' : 'Link'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

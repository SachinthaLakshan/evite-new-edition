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
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant={sliderInputType === 'file' ? 'default' : 'outline'}
            onClick={() => setSliderInputType('file')}
            className="flex-1"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
          <Button
            type="button"
            variant={sliderInputType === 'link' ? 'default' : 'outline'}
            onClick={() => setSliderInputType('link')}
            className="flex-1"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Image Links
          </Button>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          {sliderInputType === 'file' ? (
            <div className="space-y-2">
              <Label htmlFor="slider-images" className="text-base">Upload Images</Label>
              <Input
                type="file"
                id="slider-images"
                accept="image/*"
                multiple
                onChange={handleSliderImageChange}
                disabled={sliderImages.length >= 5}
              />
              <p className="text-xs text-gray-500">Max 2MB per image</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="image-link" className="text-base">Add Image Link</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  id="image-link"
                  placeholder="https://example.com/image.jpg"
                  value={newImageLink}
                  onChange={(e) => setNewImageLink(e.target.value)}
                  disabled={sliderImages.length >= 5}
                />
                <Button
                  type="button"
                  onClick={handleAddImageLink}
                  disabled={sliderImages.length >= 5}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 font-medium">Tips for image links:</p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                  <li>Use Google Drive: Share the file and set access to "Anyone with the link"</li>
                  <li>Use Imgur or similar image hosting platforms</li>
                  <li>Make sure the link ends with an image extension (.jpg, .png, etc.)</li>
                  <li>For Google Drive links, convert them to direct image links</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Google Drive Tip:</strong> After getting the sharing link, replace "file/d/" with "uc?export=view&id=" in the URL
                </p>
              </div>
            </div>
          )}
        </div>

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

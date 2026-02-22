
import React from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ThemeColor } from "@/types/theme";

interface EventGalleryProps {
  event: any;
  theme: ThemeColor;
  sectionVariants: any;
  setFullscreenImage: (url: string | null) => void;
}

const EventGallery: React.FC<EventGalleryProps> = ({
  event,
  theme,
  sectionVariants,
  setFullscreenImage,
}) => {
  return (
    <section className="py-16 rounded-lg shadow-md">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          className="text-center"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex justify-center mb-4">
            <img
              src="/assets/floral-divider.png"
              alt="Divider"
              className="h-10 object-contain"
            />
          </div>
          <h2
            className="text-3xl sm:text-4xl font-script mb-12"
            style={{ color: theme.primary }}
          >
            Gallery
          </h2>

          <Carousel className="w-full">
            <CarouselContent>
              {event &&
              event.slider_images &&
              event.slider_images.length > 0 ? (
                event.slider_images.map((image: string, index: number) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      className="aspect-square rounded-xl overflow-hidden mx-2 shadow-lg"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <img
                        src={image}
                        alt={`Event image ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setFullscreenImage(image)}
                      />
                    </motion.div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="md:basis-full text-center py-8">
                  <p className="text-gray-500">No gallery images available</p>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};

export default EventGallery;

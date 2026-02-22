import React from "react";
import { motion } from "framer-motion";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { ThemeColor } from "@/types/theme";

interface EventMessageProps {
  event: any;
  theme: ThemeColor;
  sectionVariants: any;
}

const EventMessage: React.FC<EventMessageProps> = ({
  event,
  theme,
  sectionVariants,
}) => {
  const isGreyTheme = theme.background === "#F1F1F1";

  if (isGreyTheme) {
    return (
      <section className="py-8 relative">
        <motion.div
          className="flex justify-between items-start"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <div className="w-3/5 pr-4">
            <div className="rounded-full bg-gray-200 p-6 md:p-8 flex flex-col items-start h-full">
              <h2 className="text-xl font-bold mb-4">Our Message</h2>
              <p className="text-sm leading-relaxed text-left">
                {event.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."}
              </p>
            </div>
          </div>
          
          <div className="w-2/5">
            <div className="rounded-full bg-gray-200 p-6 flex flex-col items-center h-full">
              <h2 className="text-lg font-bold mb-2">Mark Your Calendar</h2>
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-base font-medium">June</span>
              </div>
              <div className="my-1">
                <span className="text-4xl font-bold">12</span>
              </div>
              <div>
                <span className="text-sm">Monday</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className={isGreyTheme ? "py-8" : "py-16 rounded-lg shadow-md"}>
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          className={`text-center ${isGreyTheme ? 'space-y-3' : 'space-y-6'}`}
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          {!isGreyTheme && (
            <div className="flex justify-center mb-4">
              <img
                src="/assets/floral-divider.png"
                alt="Divider"
                className="h-10 object-contain"
              />
            </div>
          )}
          
          {isGreyTheme ? (
            <div className="rounded-full bg-gray-200 p-6 md:p-8 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-2">Our Message</h2>
              <p className="text-sm leading-relaxed" style={{ color: theme.textPrimary }}>
                {event.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."}
              </p>
            </div>
          ) : (
            <>
              <h2
                className="text-3xl sm:text-4xl font-script"
                style={{ color: theme.primary }}
              >
                Our Message
              </h2>
              <p className="leading-relaxed" style={{ color: theme.textPrimary }}>
                {event.description}
              </p>
              <div
                className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
                style={{ color: theme.primary }}
              >
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  <span>
                    {new Date(event.date).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default EventMessage;

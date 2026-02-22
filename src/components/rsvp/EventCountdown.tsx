import React from "react";
import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";
import { ThemeColor } from "@/types/theme";
import { CalendarIcon } from "lucide-react";

interface EventCountdownProps {
  event: any;
  theme: ThemeColor;
  sectionVariants: any;
}

const EventCountdown: React.FC<EventCountdownProps> = ({
  event,
  theme,
  sectionVariants,
}) => {
  const isGreyTheme = theme.background === "#F1F1F1";

  if (isGreyTheme) {
    return (
      <section className="py-6">
        <motion.div
          className="flex flex-col items-center"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <div className="w-full text-center">
            <div className="flex justify-between text-center mx-auto max-w-sm">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold">12</span>
                <span className="text-sm">Days</span>
              </div>
              <span className="text-3xl font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold">16</span>
                <span className="text-sm">Hours</span>
              </div>
              <span className="text-3xl font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold">25</span>
                <span className="text-sm">Minutes</span>
              </div>
              <span className="text-3xl font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold">32</span>
                <span className="text-sm">Seconds</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      className="py-16 rounded-lg shadow-md"
      style={{
        background: `linear-gradient(to right, ${theme.primary}20, ${theme.secondary}20)`,
      }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          className="text-center"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <img
            src="/assets/rings.png"
            alt="Event symbol"
            className="h-24 mx-auto mb-6"
          />
          <h2
            className="text-3xl sm:text-4xl font-script mb-8"
            style={{ color: theme.primary }}
          >
            Mark Your Calendar
          </h2>
          <div className="mb-12">
            <Countdown targetDate={event.date} />
          </div>
          <p
            className="text-xl sm:text-2xl font-semibold"
            style={{ color: theme.primary }}
          >
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-gray-600 mt-2">
            {new Date(event.date).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EventCountdown;

import React from "react";
import { motion } from "framer-motion";
import { AgendaItem } from "@/types/event";
import { ThemeColor } from "@/types/theme";

interface EventScheduleProps {
  event: any;
  theme: ThemeColor;
  sectionVariants: any;
}

const EventSchedule: React.FC<EventScheduleProps> = ({
  event,
  theme,
  sectionVariants,
}) => {
  if (!event.agenda) return null;

  const isGreyTheme = theme.background === "#F1F1F1";

  if (isGreyTheme) {
    return (
      <section className="py-8">
        <motion.div
          className="text-center"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <div className="rounded-full bg-gray-200 p-6 md:p-8 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Schedule</h2>

            <div className="w-full text-left space-y-2">
              {(event.agenda as unknown as AgendaItem[]).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="font-bold">{item.time}</div>
                  <div className="text-right">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

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
            Schedule
          </h2>

          <div className="bg-[url('/assets/floral-bg.jpg')] bg-cover bg-center py-12 px-6 rounded-lg">
            <div
              className="backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-10 md:gap-y-8">
                {(event.agenda as unknown as AgendaItem[]).map(
                  (item, index) => (
                    <motion.div
                      key={index}
                      className="text-center md:text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3
                        className="text-lg sm:text-xl font-bold"
                        style={{ color: theme.secondary }}
                      >
                        {item.time}
                      </h3>
                      <p className="text-gray-700">{item.description}</p>
                    </motion.div>
                  ),
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventSchedule;

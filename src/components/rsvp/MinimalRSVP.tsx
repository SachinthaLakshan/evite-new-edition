
import React from "react";
import { motion } from "framer-motion";

interface MinimalRSVPProps {
  sectionVariants: any;
  attendee: any;
  setAttendee: (value: any) => void;
}

const MinimalRSVP: React.FC<MinimalRSVPProps> = ({
  sectionVariants,
  attendee,
  setAttendee,
}) => {
  const handleResponse = async (response: string) => {
    if (!attendee?.id) return;
    
    try {
      const { data } = await supabase
        .from("attendees")
        .update({ response })
        .eq("id", attendee.id)
        .select()
        .single();

      if (data) {
        setAttendee(data);
        toast.success("RSVP updated successfully!");
      }
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast.error("Failed to update RSVP");
    }
  };

  return (
    <section className="py-8" id="rsvp-section">
      <motion.div
        className="text-center"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
      >
        <div className="rounded-full bg-gray-200 p-6 md:p-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">Hi {attendee?.name || "Guest"}..!</h2>
          <p className="text-sm mb-6">We're excited to have you! Please confirm your attendance:</p>
          
          <div className="flex flex-col items-center my-2">
            <p className="text-sm mb-4">We're excited to have you! Please confirm your attendance:</p>
            
            <div className="flex justify-center gap-4 w-full mb-4">
              <div 
                className={`rounded-full ${attendee?.response === "yes" ? "bg-gray-400" : "bg-gray-300"} py-2 px-6 cursor-pointer hover:bg-gray-400 transition-colors shadow-sm`}
                onClick={() => handleResponse("yes")}
              >
                <span className="text-sm font-bold">Yes</span>
              </div>
              <div 
                className={`rounded-full ${attendee?.response === "no" ? "bg-gray-400" : "bg-gray-300"} py-2 px-6 cursor-pointer hover:bg-gray-400 transition-colors shadow-sm`}
                onClick={() => handleResponse("no")}
              >
                <span className="text-sm font-bold">No</span>
              </div>
              <div 
                className={`rounded-full ${attendee?.response === "maybe" ? "bg-gray-400" : "bg-gray-300"} py-2 px-6 cursor-pointer hover:bg-gray-400 transition-colors shadow-sm`}
                onClick={() => handleResponse("maybe")}
              >
                <span className="text-sm font-bold">Maybe</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// Fix missing imports for the component
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default MinimalRSVP;

import React from "react";
import { motion } from "framer-motion";
import InvitationPreview from "@/components/invitation/InvitationPreview";
import { InvitationConfig } from "@/types/invitation";

interface PersonalizedInvitationProps {
  invitationConfig: InvitationConfig | null;
  guestName?: string;
  eventData: {
    title: string;
    date: string;
    location: string;
  };
  sectionVariants: any;
}

const PersonalizedInvitation: React.FC<PersonalizedInvitationProps> = ({
  invitationConfig,
  guestName,
  eventData,
  sectionVariants,
}) => {
  if (!invitationConfig) return null;

  return (
    <motion.section
      className="py-12"
      variants={sectionVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto">
        <InvitationPreview
          config={invitationConfig}
          guestName={guestName}
          eventData={eventData}
        />
      </div>
    </motion.section>
  );
};

export default PersonalizedInvitation;

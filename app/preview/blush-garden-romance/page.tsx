"use client";

import { useRef } from "react";
import BlushGardenRomanceLayout from "@/components/rsvp/layouts/BlushGardenRomanceLayout";

export default function BlushGardenRomancePreviewPage() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <BlushGardenRomanceLayout
      event={{
        bride_name: "Thathsarani",
        groom_name: "Tharaka",
        date: "2026-11-11T10:00:00",
        is_active: true,
        title: "The Wedding",
        location: "Colombo",
        show_maybe_button: true,
        description:
          "Together with their families, they invite you to celebrate a day of blush florals, vows, and dinner under the garden lights.",
        agenda: [
          { title: "Ceremony", time: "9:30 AM", description: "Vows in the garden" },
          { title: "Dinner", time: "7:00 PM", description: "Evening feast" },
        ],
        slider_images: [
          "/assets/cardback/1.jpeg",
          "/assets/cardback/2.jpeg",
          "/assets/cardback/3.jpeg",
          "/assets/cardback/4.jpeg",
          "/assets/cardback/5.jpeg",
          "/assets/cardback/6.jpeg",
        ],
      }}
      isLoadingEvent={false}
      isVerified={true}
      attendee={{ name: "Guest", response: null }}
      setAttendee={() => {}}
      identifier=""
      setIdentifier={() => {}}
      verifyAttendee={() => {}}
      isPlaying={false}
      toggleMusic={() => {}}
      audioRef={audioRef}
    />
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, Clock, Volume2, VolumeX, X } from "lucide-react";
import confetti from "canvas-confetti";
import { ClassicButtonOpener } from "../openers/ClassicButtonOpener";
import { EnvelopeOpener } from "../openers/EnvelopeOpener";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SageLayoutProps {
  event: any;
  isLoadingEvent: boolean;
  isVerified: boolean;
  attendee: any;
  setAttendee: (value: any) => void;
  identifier: string;
  setIdentifier: (value: string) => void;
  verifyAttendee: (value?: string) => void;
  isPlaying: boolean;
  toggleMusic: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const SageLayout: React.FC<SageLayoutProps> = ({
  event,
  isLoadingEvent,
  isVerified,
  attendee,
  setAttendee,
  identifier,
  setIdentifier,
  verifyAttendee,
  isPlaying,
  toggleMusic,
  audioRef,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [rsvpSubmittedMsg, setRsvpSubmittedMsg] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  
  const detailsRef = useRef<HTMLDivElement>(null);

  const triggerConfettiAndMusic = () => {
    if (!isPlaying) toggleMusic();
    if (audioRef?.current) {
      audioRef.current.play().catch(console.error);
    }
    try {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        // Confetti using Sage/Green colors
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#94B19E', '#779B88', '#678970', '#50745E', '#F6F8F5']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#94B19E', '#779B88', '#678970', '#50745E', '#F6F8F5']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (err) {
      console.error("Confetti error:", err);
    }
  };

  const handleClassicOpen = () => {
    triggerConfettiAndMusic();
    setIsOpened(true);
  };

  useEffect(() => {
    if (lightboxIndex === null || !event?.slider_images || event.slider_images.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => prev !== null ? (prev + 1) % event.slider_images.length : 0);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => prev !== null ? (prev - 1 + event.slider_images.length) % event.slider_images.length : 0);
      } else if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, event?.slider_images]);

  useEffect(() => {
    if (!event?.date) return;

    const updateCountdown = () => {
      const difference = +new Date(event.date) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event?.date]);

  useEffect(() => {
    if (isVerified && attendee?.response) {
      if (attendee.response === "yes") {
        setRsvpSubmittedMsg("Yay! We can't wait to celebrate with you! 🎉");
      } else if (attendee.response === "maybe") {
        setRsvpSubmittedMsg("We hope you can make it! Let us know when you decide. ✨");
      } else if (attendee.response === "no") {
        setRsvpSubmittedMsg("We will miss you! Thank you for letting us know. ❤️");
      }
    }
  }, [isVerified, attendee]);

  // Auto-play slideshow logic for the photo gallery
  useEffect(() => {
    if (!event?.slider_images || event.slider_images.length <= 1) return;

    const timer = setTimeout(() => {
      setGalleryIndex((prev) => (prev + 1) % event.slider_images.length);
    }, 4000); // Transitions slide every 4 seconds

    return () => clearTimeout(timer);
  }, [galleryIndex, event?.slider_images]);

  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F8F5]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-10 h-10 text-[#678970] animate-pulse" />
          </motion.div>
          <p className="text-[#132F1C] font-semibold animate-pulse">Loading Invitation...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F8F5] p-6">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-[#94B19E]/20">
          <p className="text-red-600 font-bold text-lg">Event Not Found</p>
          <p className="text-gray-500 text-sm mt-2">The invitation link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const brideName = event.bride_name || "Bride";
  const groomName = event.groom_name || "Groom";
  const eventDate = event.date ? new Date(event.date) : new Date();

  const scrollToContent = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRSVP = async (choice: "yes" | "no" | "maybe") => {
    if (!attendee?.id) {
      toast.error("Please verify your invitation first.");
      return;
    }

    setIsSubmittingRSVP(true);
    try {
      const { data, error } = await supabase
        .from("attendees")
        .update({ response: choice })
        .eq("id", attendee.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating RSVP:", error);
        toast.error("Failed to update RSVP. Please try again.");
        return;
      }

      setAttendee(data);
      let thankYouMsg = "";
      if (choice === "yes") {
        thankYouMsg = "Yay! We can't wait to celebrate with you! 🎉";
        // Confetti burst for yes RSVP
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#94B19E', '#779B88', '#678970', '#335F48', '#204B31']
          });
        } catch (e) {}
      } else if (choice === "maybe") {
        thankYouMsg = "We hope you can make it! Let us know when you decide. ✨";
      } else {
        thankYouMsg = "We will miss you! Thank you for letting us know. ❤️";
      }
      setRsvpSubmittedMsg(thankYouMsg);
      toast.success("RSVP submitted successfully!");
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast.error("Failed to update RSVP");
    } finally {
      setIsSubmittingRSVP(false);
    }
  };

  const getTimelineIcon = (title: string, description: string) => {
    const text = (title + " " + description).toLowerCase();
    
    if (text.includes("ceremony") || text.includes("say i do") || text.includes("wedding") || text.includes("marry")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#132F1C" strokeWidth="1.5" className="w-6 h-6">
          <circle cx="8" cy="14" r="4.5" />
          <circle cx="16" cy="10" r="4.5" />
          <path d="M15 6.5l1-1.5 1.5 1-1 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    if (text.includes("reception") || text.includes("cocktail") || text.includes("party") || text.includes("cheers")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#132F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M8 22h8M10 17v5M14 17v5" />
          <path d="M10 7a3 3 0 0 0-3 3v7h6v-7a3 3 0 0 0-3-3z" fill="#132F1C" fillOpacity="0.1" />
          <path d="M14 7a3 3 0 0 1 3 3v7h-6v-7a3 3 0 0 1 3-3z" fill="#132F1C" fillOpacity="0.1" />
          <path d="M11 6a2 2 0 0 1 2 0" />
        </svg>
      );
    }
    
    if (text.includes("dinner") || text.includes("food") || text.includes("feast") || text.includes("eat") || text.includes("lunch")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#132F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="5" fill="#132F1C" fillOpacity="0.1" />
          <path d="M5 4v9a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4M7 4v4M17 4v14M19 4h-4v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4" />
        </svg>
      );
    }
    
    if (text.includes("dance") || text.includes("dancing") || text.includes("music") || text.includes("dj") || text.includes("song")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#132F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" fill="#132F1C" fillOpacity="0.1" />
          <circle cx="18" cy="16" r="3" fill="#132F1C" fillOpacity="0.1" />
        </svg>
      );
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#132F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#132F1C" fillOpacity="0.1" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen text-[#132F1C] relative overflow-x-hidden flex flex-col items-center w-full sage-root-wrapper">
      
      {/* ══ PENDING ACTIVATION BANNER ══ */}
      {!event?.is_active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-red-700/95 backdrop-blur-sm text-white py-6 px-8 rounded-2xl shadow-2xl text-center font-medium flex flex-col items-center gap-4 max-w-md pointer-events-auto border border-white/20">
            <div className="bg-white/20 p-3 rounded-full">
              <X className="h-8 w-8 text-white" />
            </div>
            <span className="text-lg">This event is currently pending activation and cannot receive RSVP responses.</span>
          </div>
        </div>
      )}

      {/* ══ OPEN INVITATION ENVELOPE OVERLAY ══ */}
      {event?.opener_style === 'envelope' ? (
        <EnvelopeOpener
          isOpened={isOpened}
          setIsOpened={setIsOpened}
          brideName={brideName}
          groomName={groomName}
          theme="sage"
          isPlaying={isPlaying}
          toggleMusic={toggleMusic}
          audioRef={audioRef}
          onTriggerOpen={triggerConfettiAndMusic}
        />
      ) : (
        <ClassicButtonOpener
          isOpened={isOpened}
          onOpen={handleClassicOpen}
          brideName={brideName}
          groomName={groomName}
          theme="sage"
          isPlaying={isPlaying}
          toggleMusic={toggleMusic}
          audioRef={audioRef}
        />
      )}

      {/* Import elegant fonts for wedding theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Courier+Prime&family=Great+Vibes&display=swap');

        .sage-root-wrapper {
          background: radial-gradient(circle at center, #F6F8F5 0%, #D8E2DC 100%) fixed;
          font-family: 'Inter', sans-serif;
        }
        .wedding-names-font {
          font-family: 'Cormorant Garamond', serif;
          letter-spacing: 4px;
          text-shadow: 0 2px 10px rgba(51, 95, 72, 0.05);
        }
        .wedding-names-font span {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }
        .frame-container-el {
          position: relative;
          width: 100%;
          max-width: 620px;
          aspect-ratio: 800 / 450;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .couple-img-el {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 39.5%;
          height: 70.2%;
          border-radius: 50%;
          object-fit: cover;
          object-position: center top;
          z-index: 1;
        }
        .gif-frame-el {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          filter: hue-rotate(225deg) saturate(0.55) brightness(1.2);
          pointer-events: none;
          z-index: 2;
        }
        .btn-rsvp-el {
          font-family: 'Great Vibes', 'Alex Brush', cursive;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: #E9EFEA;
          color: #132F1C;
          box-shadow: 0 4px 15px rgba(32, 75, 49, 0.06);
        }
        .btn-rsvp-el:hover {
          transform: translateY(-3px) scale(1.03);
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(32, 75, 49, 0.12);
        }
        .btn-rsvp-el:active {
          transform: translateY(-1px) scale(1.01);
        }
        .scroll-arrow-el {
          animation: bounce-el 2s infinite;
        }
        @keyframes bounce-el {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
          60% { transform: translateY(-3px); }
        }

        /* ════════════════════════════════════════
           SAVE THE DATE SECTION
           ════════════════════════════════════════ */
        .std-section {
          position: relative;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 177, 158, 0.25);
          border-radius: 40px;
          padding: 80px 24px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(32, 75, 49, 0.04);
          overflow: hidden;
          text-align: center;
        }
        /* Orbs background */
        .std-orb-1 {
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(148, 177, 158, 0.15) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          pointer-events: none;
        }
        .std-orb-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(119, 155, 136, 0.1) 0%, transparent 75%);
          bottom: -150px;
          right: -100px;
          pointer-events: none;
        }
        .std-orb-3 {
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(246, 248, 255, 0.8) 0%, transparent 60%);
          top: 30%;
          left: 65%;
          pointer-events: none;
        }
        /* Floral placements using copied Sage assets */
        .std-fl-tl {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 160px;
          pointer-events: none;
          opacity: 0.8;
        }
        .std-fl-tr {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 160px;
          pointer-events: none;
          opacity: 0.8;
          transform: scaleX(-1);
        }
        .std-fl-bl {
          position: absolute;
          bottom: -20px;
          left: -20px;
          width: 160px;
          pointer-events: none;
          opacity: 0.8;
          transform: scale(-1);
        }
        .std-fl-br {
          position: absolute;
          bottom: -20px;
          right: -20px;
          width: 160px;
          pointer-events: none;
          opacity: 0.8;
          transform: scaleY(-1);
        }
        
        .std-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .std-title {
          font-family: 'Great Vibes', cursive;
          font-size: 52px;
          color: #335F48;
          margin-bottom: 8px;
          line-height: 1;
        }
        .std-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          max-width: 220px;
          margin-bottom: 36px;
        }
        .std-div-line {
          height: 1px;
          background: linear-gradient(to right, transparent, #94B19E);
          flex-grow: 1;
        }
        .std-div-line.r {
          background: linear-gradient(to left, transparent, #94B19E);
        }
        .std-div-heart {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .std-div-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #779B88;
        }
        .std-heart-sym {
          font-size: 14px;
          color: #678970;
        }
        
        .std-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(148, 177, 158, 0.2);
          border-radius: 24px;
          padding: 36px 24px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 6px 20px rgba(51, 95, 72, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }
        .std-cal-icon {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          justify-content: center;
          margin-bottom: 16px;
        }
        .std-cal-line {
          height: 1px;
          width: 32px;
          background: rgba(148, 177, 158, 0.4);
        }
        .std-date-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 500;
          color: #132F1C;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .std-mini-heart {
          color: #94B19E;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .std-location {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #50745E;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          max-width: 320px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .std-leaf-row {
          margin-bottom: 24px;
        }
        .std-cal-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #335F48;
          color: #F6F8F5;
          border-radius: 99px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          border: 1px solid #132F1C;
          box-shadow: 0 4px 10px rgba(51, 95, 72, 0.15);
        }
        .std-cal-btn:hover {
          background: #204B31;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(51, 95, 72, 0.25);
        }
        .std-cal-btn:active {
          transform: translateY(0);
        }
        
        /* Countdown styling */
        .std-countdown {
          display: grid;
          grid-template-cols: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
          max-width: 440px;
        }
        .std-cd-card {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(148, 177, 158, 0.2);
          border-radius: 18px;
          padding: 14px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 12px rgba(51, 95, 72, 0.01);
        }
        .std-cd-num {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #204B31;
          line-height: 1.1;
        }
        .std-cd-heart {
          color: #94B19E;
          font-size: 8px;
          margin: 3px 0;
        }
        .std-cd-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #779B88;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* ════════════════════════════════════════
           OUR STORY SECTION
           ════════════════════════════════════════ */
        .os-section {
          position: relative;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 177, 158, 0.25);
          border-radius: 40px;
          padding: 80px 24px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(32, 75, 49, 0.04);
          overflow: hidden;
        }
        .os-bg-orb-1 {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(148, 177, 158, 0.12) 0%, transparent 70%);
          bottom: -80px;
          left: -120px;
          pointer-events: none;
        }
        .os-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 56px;
        }
        .os-title {
          font-family: 'Great Vibes', cursive;
          font-size: 52px;
          color: #335F48;
          line-height: 1;
          margin-bottom: 8px;
        }
        .os-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 2px;
          color: #779B88;
          text-transform: uppercase;
        }
        
        .os-title-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          max-width: 220px;
          margin-top: 10px;
        }
        .os-divider-line {
          height: 1px;
          background: linear-gradient(to right, transparent, #94B19E);
          flex-grow: 1;
        }
        .os-divider-line.right {
          background: linear-gradient(to left, transparent, #94B19E);
        }
        .os-divider-heart {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .os-divider-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #779B88;
        }
        .os-heart-symbol {
          font-size: 14px;
          color: #678970;
        }

        .os-timeline {
          position: relative;
          max-width: 580px;
          margin: 0 auto;
          padding-left: 32px;
        }
        /* Vertical center line */
        .os-timeline::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 8px;
          bottom: 8px;
          width: 1.5px;
          background: linear-gradient(to bottom, #94B19E 0%, rgba(148, 177, 158, 0.2) 100%);
        }
        .os-item {
          position: relative;
          margin-bottom: 48px;
        }
        .os-item:last-child {
          margin-bottom: 0;
        }
        .os-marker {
          position: absolute;
          left: -32px;
          top: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #F6F8F5;
          border: 2px solid #678970;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #335F48;
          font-size: 10px;
          box-shadow: 0 2px 6px rgba(51, 95, 72, 0.1);
          z-index: 10;
        }
        .os-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(148, 177, 158, 0.25);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(51, 95, 72, 0.015);
          transition: all 0.3s ease;
        }
        .os-card:hover {
          transform: translateX(4px);
          border-color: rgba(148, 177, 158, 0.4);
          box-shadow: 0 6px 20px rgba(51, 95, 72, 0.04);
        }
        .os-date {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          color: #779B88;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: block;
          margin-bottom: 4px;
        }
        .os-h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #132F1C;
          margin-bottom: 8px;
        }
        .os-desc {
          font-size: 13.5px;
          color: #50745E;
          line-height: 1.6;
        }

        /* ════════════════════════════════════════
           AGENDA SECTION
           ════════════════════════════════════════ */
        .ag-section {
          position: relative;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 177, 158, 0.25);
          border-radius: 40px;
          padding: 80px 24px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(32, 75, 49, 0.04);
          overflow: hidden;
        }
        .ag-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 56px;
        }
        .ag-title {
          font-family: 'Great Vibes', cursive;
          font-size: 52px;
          color: #335F48;
          line-height: 1;
          margin-bottom: 8px;
        }
        .ag-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 2px;
          color: #779B88;
          text-transform: uppercase;
        }
        
        /* Floating ornaments for Agenda */
        .ag-fl-tl {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 140px;
          pointer-events: none;
          opacity: 0.75;
        }
        .ag-fl-tr {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 140px;
          pointer-events: none;
          opacity: 0.75;
          transform: scaleX(-1);
        }

        .ag-grid {
          display: grid;
          grid-template-cols: 1fr;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .ag-grid {
            grid-template-cols: repeat(2, 1fr);
          }
        }
        .ag-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(148, 177, 158, 0.2);
          border-radius: 24px;
          padding: 32px 24px;
          box-shadow: 0 4px 15px rgba(51, 95, 72, 0.01);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .ag-card:hover {
          transform: translateY(-4px);
          border-color: rgba(148, 177, 158, 0.4);
          box-shadow: 0 8px 25px rgba(51, 95, 72, 0.05);
        }
        
        .ag-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #E9EFEA;
          color: #335F48;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(148, 177, 158, 0.3);
          box-shadow: 0 2px 10px rgba(51, 95, 72, 0.02);
        }
        .ag-time {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          color: #779B88;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .ag-h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #132F1C;
          margin-bottom: 12px;
        }
        .ag-desc {
          font-size: 13px;
          color: #50745E;
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 240px;
        }
        .ag-loc {
          font-size: 12.5px;
          font-weight: 600;
          color: #335F48;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: auto;
        }
        .ag-loc a {
          color: #678970;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .ag-loc a:hover {
          color: #204B31;
        }

        /* ════════════════════════════════════════
           GALLERY SECTION
           ════════════════════════════════════════ */
        .gal-section {
          position: relative;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 177, 158, 0.25);
          border-radius: 40px;
          padding: 80px 24px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(32, 75, 49, 0.04);
          overflow: hidden;
        }
        .gal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 56px;
        }
        .gal-title {
          font-family: 'Great Vibes', cursive;
          font-size: 52px;
          color: #335F48;
          line-height: 1;
          margin-bottom: 8px;
        }
        .gal-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 2px;
          color: #779B88;
          text-transform: uppercase;
        }
        
        .gal-fl-tl {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 140px;
          pointer-events: none;
          opacity: 0.75;
        }
        .gal-fl-tr {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 140px;
          pointer-events: none;
          opacity: 0.75;
          transform: scaleX(-1);
        }

        .gal-carousel {
          position: relative;
          width: 100%;
          max-width: 580px;
          margin: 0 auto;
          aspect-ratio: 4 / 3;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(51, 95, 72, 0.08);
          border: 1px solid rgba(148, 177, 158, 0.25);
        }
        .gal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: zoom-in;
        }
        .gal-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          color: #132F1C;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(51, 95, 72, 0.1);
          z-index: 10;
          transition: all 0.2s;
        }
        .gal-arrow:hover {
          background: #ffffff;
          color: #335F48;
          transform: translateY(-50%) scale(1.05);
        }
        .gal-arrow.left {
          left: 16px;
        }
        .gal-arrow.right {
          right: 16px;
        }
        .gal-indicator-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }
        .gal-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(148, 177, 158, 0.35);
          transition: all 0.3s;
          cursor: pointer;
        }
        .gal-indicator-dot.active {
          background: #335F48;
          width: 24px;
          border-radius: 99px;
        }

        /* ════════════════════════════════════════
           THANK YOU SECTION
           ════════════════════════════════════════ */
        .ty-section {
          position: relative;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 177, 158, 0.25);
          border-radius: 40px;
          padding: 80px 24px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(32, 75, 49, 0.04);
          overflow: hidden;
          text-align: center;
        }
        
        .ty-fl-tl {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 150px;
          pointer-events: none;
          opacity: 0.8;
        }
        .ty-fl-tr {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 150px;
          pointer-events: none;
          opacity: 0.8;
          transform: scaleX(-1);
        }
        .ty-fl-bl {
          position: absolute;
          bottom: -20px;
          left: -20px;
          width: 150px;
          pointer-events: none;
          opacity: 0.8;
          transform: scale(-1);
        }
        .ty-fl-br {
          position: absolute;
          bottom: -20px;
          right: -20px;
          width: 150px;
          pointer-events: none;
          opacity: 0.8;
          transform: scaleY(-1);
        }

        .ty-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ty-title {
          font-family: 'Great Vibes', cursive;
          font-size: 52px;
          color: #335F48;
          line-height: 1;
          margin-bottom: 8px;
        }
        .ty-msg {
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          color: #50745E;
          line-height: 1.7;
          max-width: 440px;
          margin-top: 24px;
          margin-bottom: 28px;
        }
        .ty-names {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 500;
          letter-spacing: 1.5px;
          color: #132F1C;
          text-transform: uppercase;
        }
      `}</style>

      {/* SVG Black filter setup */}
      <svg className="hidden">
        <defs>
          <filter id="remove-black-filter">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                5 5 5 0 -3.5"
            />
          </filter>
        </defs>
      </svg>

      {/* Music Control */}
      {event.mobile_number && (
        <button
          type="button"
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-40 p-2.5 rounded-full bg-white/80 hover:bg-white shadow-md border border-[#94B19E]/20 text-[#132F1C] transition-all"
          aria-label="Toggle music"
        >
          {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse text-[#335F48]" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}

      {/* Corner Decor Images - Fixed position in background using Sage assets */}
      <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[220px] min-w-[80px] top-0 left-0 -translate-x-[15px] -translate-y-[15px] md:-translate-x-[30px] md:-translate-y-[30px] opacity-75" />
      <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[220px] min-w-[80px] top-0 right-0 translate-x-[15px] -translate-y-[15px] md:translate-x-[30px] md:-translate-y-[30px] opacity-75 scale-x-[-1]" />
      <img src="/sage-theme-assets/images/slider/flower2.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[220px] min-w-[80px] bottom-0 left-0 -translate-x-[15px] translate-y-[15px] md:-translate-x-[30px] md:translate-y-[30px] opacity-75 scale-[-1]" />
      <img src="/sage-theme-assets/images/slider/flower2.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[220px] min-w-[80px] bottom-0 right-0 translate-x-[15px] translate-y-[15px] md:translate-x-[30px] md:translate-y-[30px] opacity-75 scale-y-[-1]" />

      {/* Hero Section Container */}
      <div className="w-full min-h-screen relative flex justify-center items-center px-4 py-8 bg-transparent overflow-hidden">
        {(event.background_image_url || event.image_url) && (
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.35] mix-blend-overlay"
            style={{
              backgroundImage: `url(${event.background_image_url || event.image_url})`,
            }}
          />
        )}
        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 w-full max-w-3xl mt-4">
          
          {/* Bride & Groom names */}
          <motion.h1 
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, cubicBezier: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="wedding-names-font text-3xl md:text-5xl font-medium text-[#132F1C] text-center uppercase tracking-widest"
          >
            {brideName} <span className="text-4xl md:text-6xl font-normal lowercase mx-2 text-[#50745E]">&amp;</span> {groomName}
          </motion.h1>

          {/* Couple Image Oval & animated GIF Frame wrapper */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="frame-container-el my-4"
          >
            <img 
              src={event.image_url || "/assets/placeholder-couple.jpg"} 
              alt={`${brideName} & ${groomName}`} 
              className="couple-img-el" 
            />
            <img 
              src="/lavender-theme-assets/output_no_bg.gif" 
              alt="Animated Frame Overlay" 
              className="gif-frame-el" 
            />
          </motion.div>

          {/* RSVP Interaction Section */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, cubicBezier: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="w-full max-w-[460px] flex flex-col items-center gap-4 text-center mt-2 px-4"
          >
            {/* If NOT verified: Verification flow styled in Sage theme */}
            {!isVerified ? (
              <div className="w-full space-y-4">
                <p className="font-mono text-sm font-semibold tracking-wider text-[#132F1C] uppercase">
                  Verify your invitation to RSVP
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                  <input
                    type="text"
                    placeholder="Enter WhatsApp Number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full sm:w-64 h-12 px-5 rounded-full border-[1.5px] border-[#132F1C] bg-[#E9EFEA] text-[#132F1C] placeholder-[#779B88]/70 text-center font-semibold outline-none focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    onClick={() => verifyAttendee()}
                    className="h-12 w-full sm:w-auto px-6 rounded-full border-[1.5px] border-[#132F1C] bg-[#132F1C] text-white hover:bg-white hover:text-[#132F1C] font-semibold transition-all shadow-md active:translate-y-0.5"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ) : (
              /* If verified: Show custom YES/NO/MAYBE buttons or Thank you message */
              <div className="w-full space-y-4">
                {rsvpSubmittedMsg ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-white/90 border border-[#94B19E]/25 rounded-2xl shadow-sm text-center"
                  >
                    <p className="font-serif text-lg text-[#335F48] italic">{rsvpSubmittedMsg}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">You can change your response using the options below</p>
                  </motion.div>
                ) : (
                  <p className="font-mono text-sm md:text-base font-semibold tracking-wider text-[#132F1C]">
                    Hi {attendee?.name || "Guest"}! Let us know you're coming
                  </p>
                )}

                <div className="flex gap-2 justify-center items-center w-full mt-2">
                  <button
                    onClick={() => handleRSVP("yes")}
                    disabled={isSubmittingRSVP}
                    className={`btn-rsvp-el flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#132F1C] rounded-l-full rounded-r-none outline-none ${attendee?.response === "yes" ? "bg-white ring-2 ring-[#335F48] font-bold" : ""}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleRSVP("no")}
                    disabled={isSubmittingRSVP}
                    className={`btn-rsvp-el flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#132F1C] rounded-lg outline-none ${attendee?.response === "no" ? "bg-white ring-2 ring-[#335F48] font-bold" : ""}`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleRSVP("maybe")}
                    disabled={isSubmittingRSVP}
                    className={`btn-rsvp-el flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#132F1C] rounded-r-full rounded-l-none outline-none ${attendee?.response === "maybe" ? "bg-white ring-2 ring-[#335F48] font-bold" : ""}`}
                  >
                    Maybe
                  </button>
                </div>
              </div>
            )}

            {/* Sage Chevron Arrow for scrolling down */}
            <div className="scroll-arrow-el mt-6 cursor-pointer" onClick={scrollToContent}>
              <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2L12 10L20 2" stroke="#132F1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Details Section (Scrollable content over the fixed background) */}
      <div 
        ref={detailsRef}
        className="w-full py-16 md:py-24 z-10 relative px-4 flex flex-col items-center bg-transparent"
      >
        <div className="max-w-3xl w-full space-y-16 relative">

          {/* ══ SAVE THE DATE SECTION ══ */}
          <div className="std-section">

            {/* Blur orbs */}
            <div className="std-orb-1" />
            <div className="std-orb-2" />
            <div className="std-orb-3" />

            {/* Decor using Sage assets (flower1 and flower2 mirrored for top/bottom corners) */}
            <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="std-fl-tl" />
            <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="std-fl-tr" />
            <img src="/sage-theme-assets/images/slider/flower2.png" alt="" className="std-fl-bl" />
            <img src="/sage-theme-assets/images/slider/flower2.png" alt="" className="std-fl-br" />

            {/* ── Content ── */}
            <div className="std-content">

              {/* Title decoration */}
              <img src="/sage-theme-assets/images/section-title2.png" alt="" className="w-16 opacity-75 mb-2 pointer-events-none" />

              {/* Title */}
              <p className="std-title">Save The Date</p>

              {/* Heart divider */}
              <div className="std-divider">
                <div className="std-div-line" />
                <div className="std-div-heart">
                  <span className="std-div-dot" />
                  <span className="std-heart-sym">♥</span>
                  <span className="std-div-dot" />
                </div>
                <div className="std-div-line r" />
              </div>

              {/* Info Card */}
              <div className="std-card">

                {/* Top calendar icon row */}
                <div className="std-cal-icon">
                  <span className="std-cal-line" />
                  <Calendar size={22} color="#779B88" />
                  <span className="std-cal-line" />
                </div>

                {/* Date */}
                <p className="std-date-text">
                  {eventDate.toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </p>

                {/* Mini heart */}
                <span className="std-mini-heart">♥</span>

                {/* Location */}
                {event.location && (
                  <p className="std-location">
                    <MapPin size={16} color="#678970" />
                    {event.location}
                  </p>
                )}

                {/* Leaf ornament SVG */}
                <div className="std-leaf-row">
                  <svg width="68" height="14" viewBox="0 0 68 14" fill="none">
                    <path d="M0 7 Q8 1 17 7 Q26 13 34 7 Q42 1 51 7 Q60 13 68 7" stroke="rgba(119, 155, 136, 0.45)" strokeWidth="1.2" fill="none"/>
                    <circle cx="34" cy="7" r="2" fill="rgba(119, 155, 136, 0.5)"/>
                  </svg>
                </div>

                {/* Add to Calendar button */}
                <button
                  className="std-cal-btn"
                  onClick={() => {
                    if (event.location_url) {
                      window.open(event.location_url, "_blank");
                    } else {
                      // Build Google Calendar link
                      const title = encodeURIComponent(`${event.bride_name || ""} & ${event.groom_name || ""} Wedding`);
                      const start = eventDate.toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
                      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=Wedding+Invitation`, "_blank");
                    }
                  }}
                >
                  <Calendar size={16} />
                  Add to Calendar
                </button>

              </div>{/* end std-card */}

              {/* Countdown */}
              <div className="std-countdown">
                {[
                  { label: "Days",    value: timeLeft.days },
                  { label: "Hours",   value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="std-cd-card">
                    <span className="std-cd-num">{String(item.value).padStart(2, "0")}</span>
                    <span className="std-cd-heart">♥</span>
                    <span className="std-cd-label">{item.label}</span>
                  </div>
                ))}
              </div>

            </div>{/* end std-content */}
          </div>{/* end std-section */}

          {/* ══ OUR STORY SECTION ══ */}
          {event.description && (
            <div className="os-section">
              {/* Background blur orbs */}
              <div className="os-bg-orb-1" />

              {/* Decorative Corner Ornaments to match Sage theme */}
              <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="os-fl-tl" style={{ position: "absolute", top: 0, left: 0, width: "clamp(60px, 12vw, 120px)", opacity: 0.25, pointerEvents: "none" }} />
              <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="os-fl-tr" style={{ position: "absolute", top: 0, right: 0, width: "clamp(60px, 12vw, 120px)", opacity: 0.25, pointerEvents: "none", transform: "scaleX(-1)" }} />

              <div className="os-header">
                {/* Title ornament */}
                <img src="/sage-theme-assets/images/section-title2.png" alt="" className="w-16 opacity-75 mb-2 pointer-events-none" />
                <p className="os-title">Our Story</p>
                <p className="os-subtitle">A Journey of Love</p>

                {/* Heart Divider */}
                <div className="os-title-divider">
                  <div className="os-divider-line" />
                  <div className="os-divider-heart">
                    <span className="os-divider-dot" />
                    <span className="os-heart-symbol" style={{ color: "#335F48" }}>♥</span>
                    <span className="os-divider-dot" />
                  </div>
                  <div className="os-divider-line right" />
                </div>
              </div>

              {/* Story content */}
              <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="os-card" style={{ textAlign: "center", fontStyle: "italic", fontSize: "16px", lineHeight: "1.8", color: "#2d4436", background: "rgba(255, 255, 255, 0.6)", borderRadius: "24px", border: "1px solid rgba(148, 177, 158, 0.25)", padding: "28px" }}>
                  <span style={{ display: "block", fontSize: "40px", color: "#779B88", fontFamily: "Playfair Display, serif", lineHeight: "1", marginBottom: "-10px" }}>&ldquo;</span>
                  <p className="os-desc" style={{ fontSize: "clamp(15px, 2.5vw, 18px)", fontFamily: "Cormorant Garamond, serif", color: "#2d4436" }}>
                    {event.description}
                  </p>
                  <span style={{ display: "block", fontSize: "40px", color: "#779B88", fontFamily: "Playfair Display, serif", lineHeight: "1", marginTop: "10px" }}>&rdquo;</span>
                </div>
              </div>
            </div>
          )} {/* end .os-section */}

          {/* ══ AGENDA SECTION ══ */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="ag-section">
              {/* Corner Ornaments */}
              <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="ag-fl-tl" />
              <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="ag-fl-tr" />

              <div className="ag-header">
                {/* Title Ornament */}
                <img src="/sage-theme-assets/images/section-title2.png" alt="" className="w-16 opacity-75 mb-2 pointer-events-none" />
                <p className="ag-title">Wedding Agenda</p>
                <p className="ag-subtitle">Order of Event</p>

                {/* Divider */}
                <div className="os-title-divider">
                  <div className="os-divider-line" />
                  <div className="os-divider-heart">
                    <span className="os-divider-dot" />
                    <span className="os-heart-symbol">♥</span>
                    <span className="os-divider-dot" />
                  </div>
                  <div className="os-divider-line right" />
                </div>
              </div>

              {/* Agenda Grid cards */}
              <div className="ag-grid">
                {event.agenda.map((item: any, idx: number) => (
                  <div key={idx} className="ag-card">
                    {/* Circle wrapper icon based on title/desc */}
                    <div className="ag-icon-wrap">
                      {getTimelineIcon(item.title || "", item.description || "")}
                    </div>

                    {/* Time */}
                    <p className="ag-time">
                      <Clock size={12} className="inline mr-1" />
                      {item.time}
                    </p>

                    {/* Title */}
                    <h3 className="ag-h3">{item.title || item.description}</h3>

                    {/* Description */}
                    {item.title && item.description && <p className="ag-desc">{item.description}</p>}

                    {/* Location link */}
                    {item.location && (
                      <p className="ag-loc">
                        <MapPin size={13} />
                        {item.location_url ? (
                          <a href={item.location_url} target="_blank" rel="noopener noreferrer">
                            {item.location}
                          </a>
                        ) : (
                          <span>{item.location}</span>
                        )}
                      </p>
                    )}
                    
                    {/* Flower shape decorative overlays */}
                    <img src="/sage-theme-assets/images/event-shape-1.png" alt="" className="absolute top-2 right-2 w-8 opacity-[0.15] pointer-events-none" />
                  </div>
                ))}
              </div>
            </div> /* end ag-section */
          )}

          {/* ══ PHOTO GALLERY SECTION ══ */}
          {event.slider_images && event.slider_images.length > 0 && (
            <div className="gal-section">
              {/* Corner Ornaments */}
              <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="gal-fl-tl" />
              <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="gal-fl-tr" />

              <div className="gal-header">
                {/* Title Ornament */}
                <img src="/sage-theme-assets/images/section-title2.png" alt="" className="w-16 opacity-75 mb-2 pointer-events-none" />
                <p className="gal-title">Sweet Moments</p>
                <p className="gal-subtitle">Our Gallery</p>

                {/* Divider */}
                <div className="os-title-divider">
                  <div className="os-divider-line" />
                  <div className="os-divider-heart">
                    <span className="os-divider-dot" />
                    <span className="os-heart-symbol">♥</span>
                    <span className="os-divider-dot" />
                  </div>
                  <div className="os-divider-line right" />
                </div>
              </div>

              {/* Slider gallery */}
              <div className="relative w-full max-w-lg mx-auto">
                <div className="gal-carousel">
                  <motion.img
                    key={galleryIndex}
                    src={event.slider_images[galleryIndex]}
                    alt={`Gallery couples photograph ${galleryIndex + 1}`}
                    className="gal-img"
                    onClick={() => setLightboxIndex(galleryIndex)}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Left slide arrow */}
                  {event.slider_images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((prev) => (prev - 1 + event.slider_images.length) % event.slider_images.length)}
                      className="gal-arrow left"
                      aria-label="Previous photograph"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                  )}

                  {/* Right slide arrow */}
                  {event.slider_images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((prev) => (prev + 1) % event.slider_images.length)}
                      className="gal-arrow right"
                      aria-label="Next photograph"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Carousel dots indicators */}
                {event.slider_images.length > 1 && (
                  <div className="gal-indicator-row">
                    {event.slider_images.map((_: any, idx: number) => (
                      <span
                        key={idx}
                        onClick={() => setGalleryIndex(idx)}
                        className={`gal-indicator-dot ${galleryIndex === idx ? "active" : ""}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ THANK YOU SECTION ══ */}
          <div className="ty-section">

            {/* Floral placements using Sage assets */}
            <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="ty-fl-tl" />
            <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="ty-fl-tr" />
            <img src="/sage-theme-assets/images/slider/flower2.png" alt="" className="ty-fl-bl" />
            <img src="/sage-theme-assets/images/slider/flower2.png" alt="" className="ty-fl-br" />

            <div className="ty-content">
              {/* Title Ornament */}
              <img src="/sage-theme-assets/images/section-title2.png" alt="" className="w-16 opacity-75 mb-2 pointer-events-none" />

              {/* Title */}
              <p className="ty-title">Thank You</p>

              {/* Heart divider */}
              <div className="os-title-divider">
                <div className="os-divider-line" />
                <div className="os-divider-heart">
                  <span className="os-divider-dot" />
                  <span className="os-heart-symbol">♥</span>
                  <span className="os-divider-dot" />
                </div>
                <div className="os-divider-line right" />
              </div>

              {/* Message */}
              <p className="ty-msg">
                Your presence on our special day would mean the world to us. Thank you for being a part of our love story and celebrating these unforgettable moments with us.
              </p>

              {/* Couple names */}
              <p className="ty-names">{brideName} & {groomName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <footer className="w-full bg-[#132F1C]/95 backdrop-blur-md text-[#F6F8F5] py-8 px-4 text-center mt-auto border-t border-[#132F1C]/20 z-10 relative">
        <div className="max-w-md mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#94B19E]">{brideName} & {groomName}</p>
          <p className="text-sm font-serif">Made with love for our special guests</p>
        </div>
      </footer>

      {/* Fullscreen Photo Lightbox Carousel */}
      <AnimatePresence>
        {lightboxIndex !== null && event.slider_images && event.slider_images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out select-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-[#94B19E] transition-colors z-50 p-2 bg-black/40 rounded-full hover:bg-black/60"
              aria-label="Close preview"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Left Nav Arrow (Lightbox) */}
            {event.slider_images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => prev !== null ? (prev - 1 + event.slider_images.length) % event.slider_images.length : 0);
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-[#94B19E] transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
                aria-label="Previous image"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            {/* Main Image Slider with smooth Framer Motion */}
            <div className="relative max-w-full max-h-full flex items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={lightboxIndex}
                  src={event.slider_images[lightboxIndex]} 
                  alt={`Fullscreen preview image ${lightboxIndex + 1}`} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto" 
                />
              </AnimatePresence>
            </div>

            {/* Right Nav Arrow (Lightbox) */}
            {event.slider_images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => prev !== null ? (prev + 1) % event.slider_images.length : 0);
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-[#94B19E] transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
                aria-label="Next image"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}

            {/* Fullscreen Page Count indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1.5 rounded-full text-sm font-medium">
              {lightboxIndex + 1} / {event.slider_images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element for music */}
      <audio ref={audioRef} src={event?.audio_url || "/soft-background-music.mp3"} loop />
    </div>
  );
};

export default SageLayout;

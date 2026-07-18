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

interface RedRoseClassicLayoutProps {
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

const RedRoseClassicLayout: React.FC<RedRoseClassicLayoutProps> = ({
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
        // Confetti using Red and Gold colors
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#B91C1C', '#991B1B', '#D4AF37', '#F59E0B', '#FFF5F5']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#B91C1C', '#991B1B', '#D4AF37', '#F59E0B', '#FFF5F5']
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

  // Gallery slideshow autoplay effect
  useEffect(() => {
    if (!event?.slider_images || event.slider_images.length <= 1) return;

    const timer = setTimeout(() => {
      setGalleryIndex((prev) => (prev + 1) % event.slider_images.length);
    }, 4000);

    return () => clearTimeout(timer);
  }, [galleryIndex, event?.slider_images]);

  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF5F5]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-10 h-10 text-[#C59B27] animate-pulse" />
          </motion.div>
          <p className="text-[#7F1D1D] font-semibold animate-pulse">Loading Invitation...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF5F5] p-6">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-red-100">
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
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#B91C1C', '#991B1B', '#D4AF37', '#FFF5F5']
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F1D1D" strokeWidth="1.5" className="w-6 h-6">
          <circle cx="8" cy="14" r="4.5" />
          <circle cx="16" cy="10" r="4.5" />
          <path d="M15 6.5l1-1.5 1.5 1-1 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    if (text.includes("reception") || text.includes("cocktail") || text.includes("party") || text.includes("cheers")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M8 22h8M10 17v5M14 17v5" />
          <path d="M10 7a3 3 0 0 0-3 3v7h6v-7a3 3 0 0 0-3-3z" fill="#7F1D1D" fillOpacity="0.1" />
          <path d="M14 7a3 3 0 0 1 3 3v7h-6v-7a3 3 0 0 1 3-3z" fill="#7F1D1D" fillOpacity="0.1" />
          <path d="M11 6a2 2 0 0 1 2 0" />
        </svg>
      );
    }
    
    if (text.includes("dinner") || text.includes("food") || text.includes("feast") || text.includes("eat") || text.includes("lunch")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="5" fill="#7F1D1D" fillOpacity="0.1" />
          <path d="M5 4v9a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4M7 4v4M17 4v14M19 4h-4v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4" />
        </svg>
      );
    }
    
    if (text.includes("dance") || text.includes("dancing") || text.includes("music") || text.includes("dj") || text.includes("song")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" fill="#7F1D1D" fillOpacity="0.1" />
          <circle cx="18" cy="16" r="3" fill="#7F1D1D" fillOpacity="0.1" />
        </svg>
      );
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#7F1D1D" fillOpacity="0.1" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen text-[#2E050B] relative overflow-x-hidden flex flex-col items-center w-full redrose-root-wrapper">
      
      {/* ══ PENDING ACTIVATION BANNER ══ */}
      {!event?.is_active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-red-700/90 backdrop-blur-sm text-white py-6 px-8 rounded-2xl shadow-2xl text-center font-medium flex flex-col items-center gap-4 max-w-md pointer-events-auto border-2 border-white/20">
            <div className="bg-white/20 p-3 rounded-full">
              <X className="h-8 w-8 text-white" />
            </div>
            <span className="text-xl">This event is currently pending activation and cannot receive RSVP responses.</span>
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
          theme="redroseclassic"
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
          theme="redroseclassic"
          isPlaying={isPlaying}
          toggleMusic={toggleMusic}
          audioRef={audioRef}
        />
      )}

      {/* Import elegant fonts for wedding theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Courier+Prime&family=Great+Vibes&display=swap');

        .redrose-root-wrapper {
          background: radial-gradient(circle at center, #FFF5F5 0%, #F5D5D5 100%) fixed;
          font-family: 'Inter', sans-serif;
        }
        .wedding-names-font {
          font-family: 'Cormorant Garamond', serif;
          letter-spacing: 4px;
          text-shadow: 0 2px 10px rgba(139, 0, 0, 0.1);
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
          filter: brightness(1.3) saturate(1.1);
          pointer-events: none;
          z-index: 2;
        }
        .btn-rsvp-el {
          font-family: 'Great Vibes', 'Alex Brush', cursive;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: #FFF5F5;
          color: #7F1D1D;
          box-shadow: 0 4px 15px rgba(127, 29, 29, 0.15);
        }
        .btn-rsvp-el:hover {
          transform: translateY(-3px) scale(1.03);
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(127, 29, 29, 0.25);
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
          width: 100%;
          min-height: 760px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 72px 24px 80px;
          text-align: center;
          overflow: hidden;
          border-radius: 32px;
          background: linear-gradient(160deg, #FFF8F8 0%, #FCEAEA 55%, #FFF0O0 100%);
          border: 1px solid rgba(197, 155, 39, 0.2);
        }
        /* Blur orbs */
        .std-orb-1 {
          position: absolute; width: 380px; height: 380px; border-radius: 50%;
          background: rgba(220,38,38,0.06); filter: blur(75px);
          top: -80px; left: -60px; pointer-events: none; z-index: 0;
        }
        .std-orb-2 {
          position: absolute; width: 340px; height: 340px; border-radius: 50%;
          background: rgba(197,155,39,0.08); filter: blur(65px);
          bottom: -50px; right: -50px; pointer-events: none; z-index: 0;
        }
        .std-orb-3 {
          position: absolute; width: 220px; height: 220px; border-radius: 50%;
          background: rgba(254,243,199,0.25); filter: blur(50px);
          top: 45%; left: 20%; pointer-events: none; z-index: 0;
        }
        /* Floral assets */
        .std-fl-tl {
          position: absolute; top: -22px; left: -28px;
          width: clamp(160px, 33vw, 270px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 8px 22px rgba(139,0,0,0.15));
        }
        .std-fl-tr {
          position: absolute; top: 22px; right: 16px;
          width: clamp(52px, 11vw, 90px);
          pointer-events: none; z-index: 2; opacity: 0.9;
          filter: drop-shadow(0 4px 10px rgba(139,0,0,0.12));
        }
        .std-fl-stem-r {
          position: absolute; top: 50%; right: 14px;
          transform: translateY(-50%);
          width: clamp(26px, 5.5vw, 44px);
          pointer-events: none; z-index: 2; opacity: 0.7;
        }
        .std-fl-br-bouquet {
          position: absolute; bottom: -24px; right: -28px;
          width: clamp(170px, 34vw, 290px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 -8px 22px rgba(139,0,0,0.15));
        }
        .std-fl-br-rose {
          position: absolute; bottom: 85px; right: 125px;
          width: clamp(56px, 11vw, 90px);
          pointer-events: none; z-index: 3;
          animation: float-rose-el 6s ease-in-out infinite;
        }
        @keyframes float-rose-el {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        .std-fl-bl {
          position: absolute; bottom: 24px; left: 16px;
          width: clamp(48px, 10vw, 80px);
          pointer-events: none; z-index: 2; opacity: 0.85;
          filter: drop-shadow(0 4px 10px rgba(139,0,0,0.1));
        }
        .std-fl-float {
          position: absolute; top: 40px; left: 45%;
          width: clamp(24px, 5vw, 40px);
          pointer-events: none; z-index: 2; opacity: 0.6;
          animation: float-acc-el 5s ease-in-out infinite;
        }
        @keyframes float-acc-el {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-5deg); }
        }

        /* Content elements */
        .std-content {
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center;
          width: 100%;
        }
        .std-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(48px, 10vw, 76px);
          color: #7F1D1D;
          margin-bottom: 4px;
          text-shadow: 0 2px 8px rgba(139,0,0,0.06);
        }
        
        .std-divider {
          display: flex; align-items: center; gap: clamp(12px, 3.5vw, 24px);
          width: 100%; max-width: 280px;
          margin-bottom: clamp(28px, 6vw, 44px);
        }
        .std-div-line {
          height: 1px; flex-grow: 1;
          background: linear-gradient(to right, transparent, #C59B27 70%);
        }
        .std-div-line.r {
          background: linear-gradient(to left, transparent, #C59B27 70%);
        }
        .std-div-heart {
          display: flex; align-items: center; gap: 6px;
        }
        .std-div-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #C59B27; opacity: 0.7;
        }
        .std-heart-sym {
          font-size: 16px; color: #B91C1C;
        }

        .std-card {
          background: rgba(252, 251, 247, 0.9);
          border: 1.5px solid rgba(197, 155, 39, 0.25);
          border-radius: 28px;
          padding: 36px 24px;
          width: 100%; max-width: 400px;
          box-shadow: 0 10px 30px rgba(139,0,0,0.05);
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: clamp(32px, 7vw, 48px);
        }
        .std-cal-icon {
          display: flex; align-items: center; gap: 12px;
          width: 100%; justify-content: center; margin-bottom: 16px;
        }
        .std-cal-line {
          height: 1px; width: 44px; background: rgba(197,155,39,0.3);
        }
        .std-date-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 5vw, 28px);
          font-weight: 500; color: #2E050B;
          letter-spacing: 1.5px; margin-bottom: 6px;
        }
        .std-mini-heart {
          color: #B91C1C; font-size: 13px; margin-bottom: 14px;
        }
        .std-location {
          font-size: clamp(13px, 3vw, 15px);
          color: #7F1D1D;
          display: flex; align-items: center; gap: 8px; justify-content: center;
          max-width: 320px; line-height: 1.5; margin-bottom: 24px;
        }
        .std-leaf-row {
          margin-bottom: 24px;
        }
        .std-cal-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #C59B27; color: #FCFBF7;
          border-radius: 99px; padding: 11px 28px;
          font-size: 13.5px; font-weight: 600;
          letter-spacing: 0.5px; transition: all 0.3s ease;
          border: 1px solid #AA7C11;
          box-shadow: 0 4px 12px rgba(197,155,39,0.25);
        }
        .std-cal-btn:hover {
          background: #AA7C11;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(197,155,39,0.45);
        }

        /* Countdown display */
        .std-countdown {
          display: grid; grid-template-cols: repeat(4, 1fr);
          gap: clamp(8px, 2.5vw, 16px);
          width: 100%; max-width: 480px;
        }
        .std-cd-card {
          background: rgba(252, 251, 247, 0.9);
          border: 1px solid rgba(197, 155, 39, 0.2);
          border-radius: 20px;
          padding: 16px 8px 14px;
          display: flex; flex-direction: column; align-items: center;
          box-shadow: 0 4px 12px rgba(139,0,0,0.02);
        }
        .std-cd-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 4.5vw, 32px);
          font-weight: 700; color: #7F1D1D; line-height: 1;
        }
        .std-cd-heart {
          color: #C59B27; font-size: 8px; margin: 4px 0 2px;
        }
        .std-cd-label {
          font-size: 9px; font-weight: 600; color: #AA7C11;
          text-transform: uppercase; letter-spacing: 1px;
        }

        /* ════════════════════════════════════════
           OUR STORY SECTION
        ════════════════════════════════════════ */
        .os-section {
          position: relative; width: 100%;
          padding: 80px 24px; text-align: center;
          overflow: hidden; border-radius: 32px;
          background: linear-gradient(160deg, #FFF8F8 0%, #FCEAEA 100%);
          border: 1px solid rgba(197, 155, 39, 0.2);
        }
        .os-bg-orb-1 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: rgba(197,155,39,0.06); filter: blur(80px);
          bottom: -100px; left: -100px; pointer-events: none; z-index: 0;
        }
        .os-header {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 60px;
        }
        .os-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(48px, 10vw, 76px);
          color: #7F1D1D; margin-bottom: 4px;
        }
        .os-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(14px, 3.5vw, 17px);
          font-weight: 600; letter-spacing: 3px;
          color: #C59B27; text-transform: uppercase;
        }

        /* Timeline structure */
        .os-timeline {
          position: relative; max-width: 600px;
          margin: 0 auto; padding-left: 32px; text-align: left;
        }
        .os-timeline::before {
          content: ''; position: absolute;
          left: 11px; top: 12px; bottom: 12px; width: 1.5px;
          background: linear-gradient(to bottom, #C59B27 0%, rgba(197,155,39,0.15) 100%);
        }
        .os-item {
          position: relative; margin-bottom: 56px;
        }
        .os-item:last-child {
          margin-bottom: 0;
        }
        .os-marker {
          position: absolute; left: -32px; top: 6px;
          width: 24px; height: 24px; border-radius: 50%;
          background: #FCFBF7; border: 2.5px solid #C59B27;
          display: flex; align-items: center; justify-content: center;
          color: #B91C1C; font-size: 11px; z-index: 10;
          box-shadow: 0 2px 6px rgba(139,0,0,0.1);
        }
        .os-card {
          background: rgba(252, 251, 247, 0.9);
          border: 1.5px solid rgba(197, 155, 39, 0.25);
          border-radius: 24px; padding: 28px;
          box-shadow: 0 4px 18px rgba(139,0,0,0.02);
          transition: all 0.35s ease;
        }
        .os-card:hover {
          transform: translateX(4px);
          border-color: rgba(197, 155, 39, 0.4);
          box-shadow: 0 8px 24px rgba(139,0,0,0.06);
        }
        .os-date {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px; font-weight: 700;
          color: #C59B27; text-transform: uppercase;
          letter-spacing: 1.5px; display: block; margin-bottom: 6px;
        }
        .os-h3 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 4vw, 22px);
          font-weight: 750; color: #2E050B; margin-bottom: 10px;
        }
        .os-desc {
          font-size: 14px; color: #7F1D1D; line-height: 1.65;
        }

        /* ════════════════════════════════════════
           AGENDA SECTION
        ════════════════════════════════════════ */
        .ag-section {
          position: relative; width: 100%;
          padding: 80px 24px; text-align: center;
          overflow: hidden; border-radius: 32px;
          background: linear-gradient(160deg, #FFF8F8 0%, #FCEAEA 100%);
          border: 1px solid rgba(197, 155, 39, 0.2);
        }
        .ag-header {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 60px;
        }
        .ag-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(48px, 10vw, 76px);
          color: #7F1D1D; margin-bottom: 4px;
        }
        .ag-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(14px, 3.5vw, 17px);
          font-weight: 600; letter-spacing: 3px;
          color: #C59B27; text-transform: uppercase;
        }
        /* Ornaments */
        .ag-fl-tl {
          position: absolute; top: -18px; left: -22px;
          width: clamp(120px, 24vw, 180px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 6px 15px rgba(139,0,0,0.12));
        }
        .ag-fl-tr {
          position: absolute; top: 18px; right: 14px;
          width: clamp(44px, 9vw, 70px);
          pointer-events: none; z-index: 2; opacity: 0.85;
          filter: drop-shadow(0 4px 8px rgba(139,0,0,0.1));
        }
        .ag-fl-stem-r {
          position: absolute; top: 50%; right: 12px;
          transform: translateY(-50%);
          width: clamp(22px, 5vw, 36px);
          pointer-events: none; z-index: 2; opacity: 0.65;
        }
        .ag-fl-br-bouquet {
          position: absolute; bottom: -20px; right: -22px;
          width: clamp(130px, 26vw, 200px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 -6px 15px rgba(139,0,0,0.12));
        }
        .ag-fl-br-rose {
          position: absolute; bottom: 65px; right: 90px;
          width: clamp(44px, 9vw, 70px);
          pointer-events: none; z-index: 3;
        }
        .ag-fl-bl {
          position: absolute; bottom: 20px; left: 14px;
          width: clamp(40px, 8vw, 60px);
          pointer-events: none; z-index: 2; opacity: 0.8;
        }
        .ag-fl-accent {
          position: absolute; top: 40px; left: 45%;
          width: clamp(20px, 4vw, 32px);
          pointer-events: none; z-index: 2; opacity: 0.55;
        }

        .ag-grid {
          display: grid; grid-template-cols: 1fr; gap: 20px;
          width: 100%; max-width: 640px; margin: 0 auto;
        }
        .ag-card {
          background: rgba(252, 251, 247, 0.9);
          border: 1.5px solid rgba(197, 155, 39, 0.25);
          border-radius: 28px; padding: 32px 24px;
          box-shadow: 0 4px 18px rgba(139,0,0,0.02);
          display: flex; flex-direction: column; align-items: center;
          transition: all 0.35s ease;
        }
        .ag-card:hover {
          transform: translateY(-4px);
          border-color: rgba(197, 155, 39, 0.4);
          box-shadow: 0 10px 25px rgba(139,0,0,0.05);
        }
        .ag-icon-wrap {
          width: 54px; height: 54px; border-radius: 50%;
          background: #FFF5F5; color: #B91C1C;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; border: 1.5px solid rgba(197, 155, 39, 0.3);
          box-shadow: 0 4px 10px rgba(139,0,0,0.02);
        }
        .ag-time {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px; font-weight: 700;
          color: #C59B27; letter-spacing: 1.5px;
          margin-bottom: 6px; text-transform: uppercase;
        }
        .ag-h3 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 4vw, 22px);
          font-weight: 750; color: #2E050B; margin-bottom: 8px;
        }
        .ag-desc {
          font-size: 13.5px; color: #7F1D1D;
          line-height: 1.6; margin-bottom: 16px; max-width: 320px;
        }
        .ag-loc {
          font-size: 13.5px; font-weight: 600;
          color: #AA7C11; display: flex; align-items: center; gap: 6px;
        }
        .ag-loc a {
          color: #C59B27; text-decoration: underline; transition: color 0.2s;
        }
        .ag-loc a:hover {
          color: #AA7C11;
        }

        /* ════════════════════════════════════════
           GALLERY SECTION
        ════════════════════════════════════════ */
        .gal-section {
          position: relative; width: 100%;
          padding: 80px 24px; text-align: center;
          overflow: hidden; border-radius: 32px;
          background: linear-gradient(160deg, #FFF8F8 0%, #FCEAEA 100%);
          border: 1px solid rgba(197, 155, 39, 0.2);
        }
        .gal-header {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 60px;
        }
        .gal-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(48px, 10vw, 76px);
          color: #7F1D1D; margin-bottom: 4px;
        }
        .gal-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(14px, 3.5vw, 17px);
          font-weight: 600; letter-spacing: 3px;
          color: #C59B27; text-transform: uppercase;
        }
        /* Ornaments */
        .gal-fl-tl {
          position: absolute; top: -18px; left: -22px;
          width: clamp(120px, 24vw, 180px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 6px 15px rgba(139,0,0,0.12));
        }
        .gal-fl-tr {
          position: absolute; top: 18px; right: 14px;
          width: clamp(44px, 9vw, 70px);
          pointer-events: none; z-index: 2; opacity: 0.85;
          filter: drop-shadow(0 4px 8px rgba(139,0,0,0.1));
        }
        .gal-fl-stem-r {
          position: absolute; top: 50%; right: 12px;
          transform: translateY(-50%);
          width: clamp(22px, 5vw, 36px);
          pointer-events: none; z-index: 2; opacity: 0.65;
        }
        .gal-fl-br-bouquet {
          position: absolute; bottom: -20px; right: -22px;
          width: clamp(130px, 26vw, 200px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 -6px 15px rgba(139,0,0,0.12));
        }
        .gal-fl-br-rose {
          position: absolute; bottom: 65px; right: 90px;
          width: clamp(44px, 9vw, 70px);
          pointer-events: none; z-index: 3;
        }
        .gal-fl-bl {
          position: absolute; bottom: 20px; left: 14px;
          width: clamp(40px, 8vw, 60px);
          pointer-events: none; z-index: 2; opacity: 0.8;
        }
        .gal-fl-accent {
          position: absolute; top: 40px; left: 45%;
          width: clamp(20px, 4vw, 32px);
          pointer-events: none; z-index: 2; opacity: 0.55;
        }

        .gal-carousel-wrap {
          position: relative; width: 100%; max-width: 580px;
          margin: 0 auto; aspect-ratio: 4 / 3;
          border-radius: 28px; overflow: hidden;
          box-shadow: 0 12px 36px rgba(139,0,0,0.06);
          border: 1.5px solid rgba(197, 155, 39, 0.25);
        }
        .gal-img {
          width: 100%; height: 100%; object-fit: cover;
          cursor: zoom-in; transition: transform 0.5s ease;
        }
        .gal-img:hover {
          transform: scale(1.02);
        }
        .gal-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(252, 251, 247, 0.9); color: #7F1D1D;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(139,0,0,0.08); z-index: 10;
          transition: all 0.2s;
        }
        .gal-arrow:hover {
          background: #ffffff; color: #B91C1C;
          transform: translateY(-50%) scale(1.05);
        }
        .gal-arrow.left { left: 16px; }
        .gal-arrow.right { right: 16px; }
        .gal-dots {
          display: flex; justify-content: center; gap: 8px; margin-top: 20px;
        }
        .gal-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(197, 155, 39, 0.3); transition: all 0.3s;
          cursor: pointer;
        }
        .gal-dot.active {
          background: #C59B27; width: 24px; border-radius: 99px;
        }

        /* ════════════════════════════════════════
           THANK YOU SECTION
        ════════════════════════════════════════ */
        .ty-section {
          position: relative; width: 100%;
          padding: 80px 24px 84px; text-align: center;
          overflow: hidden; border-radius: 32px;
          background: linear-gradient(160deg, #FFF8F8 0%, #FCEAEA 100%);
          border: 1px solid rgba(197, 155, 39, 0.2);
        }
        .ty-fl-tl {
          position: absolute; top: -18px; left: -22px;
          width: clamp(120px, 24vw, 180px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 6px 15px rgba(139,0,0,0.12));
        }
        .ty-fl-tr {
          position: absolute; top: 18px; right: 14px;
          width: clamp(44px, 9vw, 70px);
          pointer-events: none; z-index: 2; opacity: 0.85;
        }
        .ty-fl-br-bouquet {
          position: absolute; bottom: -20px; right: -22px;
          width: clamp(130px, 26vw, 200px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 -6px 15px rgba(139,0,0,0.12));
        }
        .ty-fl-br-rose {
          position: absolute; bottom: 65px; right: 90px;
          width: clamp(44px, 9vw, 70px);
          pointer-events: none; z-index: 3;
        }
        .ty-fl-bl {
          position: absolute; bottom: 20px; left: 14px;
          width: clamp(40px, 8vw, 60px);
          pointer-events: none; z-index: 2; opacity: 0.8;
        }
        .ty-content {
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center;
        }
        .ty-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(48px, 10vw, 76px);
          color: #7F1D1D; margin-bottom: 4px;
        }
        .ty-msg {
          font-family: 'Inter', sans-serif;
          font-size: clamp(13.5px, 3.2vw, 15px);
          color: #7F1D1D; line-height: 1.7;
          max-width: 460px; margin: 24px 0 28px;
        }
        .ty-names {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 4.5vw, 24px);
          font-weight: 500; letter-spacing: 1.5px;
          color: #2E050B; text-transform: uppercase;
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
          className="fixed top-4 right-4 z-40 p-2.5 rounded-full bg-white/80 hover:bg-white shadow-md border border-[#C59B27]/20 text-[#7F1D1D] transition-all"
          aria-label="Toggle music"
        >
          {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse text-[#B91C1C]" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}

      {/* Corner Decor Images - Fixed position in background using Red Rose assets */}
      <img src="/red-rose-theme-assets/top-left-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] top-0 left-0 -translate-x-[15px] -translate-y-[15px] md:-translate-x-[35px] md:-translate-y-[35px]" />
      <img src="/red-rose-theme-assets/top-right-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] top-0 right-0 translate-x-[15px] -translate-y-[15px] md:translate-x-[35px] md:-translate-y-[35px]" />
      <img src="/red-rose-theme-assets/bottom-left-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] bottom-0 left-0 -translate-x-[15px] translate-y-[15px] md:-translate-x-[35px] md:translate-y-[35px]" />
      <img src="/red-rose-theme-assets/bottom-right-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] bottom-0 right-0 translate-x-[15px] translate-y-[15px] md:translate-x-[35px] md:translate-y-[35px]" />

      {/* Hero Section Container */}
      <div className="w-full min-h-screen relative flex justify-center items-center px-4 py-8 bg-transparent overflow-hidden">
        {(event.background_image_url || event.image_url) && (
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.9] mix-blend-overlay"
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
            className="wedding-names-font text-3xl md:text-5xl font-medium text-[#7F1D1D] text-center uppercase tracking-widest"
          >
            {brideName} <span className="text-4xl md:text-6xl font-normal lowercase mx-2 text-[#C59B27]">&amp;</span> {groomName}
          </motion.h1>

          {/* Couple Image framed by Classic Rotating Flower Ring (with red/rose color filter) */}
          {event.image_url ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="mt-8 relative w-56 h-56 sm:w-80 sm:h-80 flex items-center justify-center my-4"
            >
              <img
                src="/assets/flower2-red.png"
                alt="Decorative floral frame"
                className="absolute inset-0 w-full h-full object-contain animate-[spin_80s_linear_infinite]"
                //style={{ filter: "hue-rotate(300deg) saturate(2.5) brightness(0.85) contrast(1.1)" }}
              />
              <img
                src={event.image_url}
                alt={`${brideName} & ${groomName}`}
                className="relative z-10 w-44 h-44 sm:w-60 sm:h-60 rounded-full object-cover border-4 border-[#C59B27]/70 shadow-2xl"
              />
            </motion.div>
          ) : null}

          {/* RSVP Interaction Section */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, cubicBezier: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="w-full max-w-[460px] flex flex-col items-center gap-4 text-center mt-2 px-4"
          >
            {/* If NOT verified: Verification flow styled in red rose theme */}
            {!isVerified ? (
              <div className="w-full space-y-4">
                <p className="font-mono text-sm font-semibold tracking-wider text-[#7F1D1D] uppercase">
                  Verify your invitation to RSVP
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                  <input
                    type="text"
                    placeholder="Enter WhatsApp Number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full sm:w-64 h-12 px-5 rounded-full border-[1.5px] border-[#7F1D1D] bg-[#FFF5F5] text-[#7F1D1D] placeholder-red-300 text-center font-semibold outline-none focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    onClick={() => verifyAttendee()}
                    className="h-12 w-full sm:w-auto px-6 rounded-full border-[1.5px] border-[#7F1D1D] bg-[#7F1D1D] text-white hover:bg-white hover:text-[#7F1D1D] font-semibold transition-all shadow-md active:translate-y-0.5"
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
                    className="p-4 bg-white/90 border border-red-100 rounded-2xl shadow-sm text-center"
                  >
                    <p className="font-serif text-lg text-[#B91C1C] italic">{rsvpSubmittedMsg}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">You can change your response using the options below</p>
                  </motion.div>
                ) : (
                  <p className="font-mono text-sm md:text-base font-semibold tracking-wider text-[#7F1D1D]">
                    Hi {attendee?.name || "Guest"}! Let us know you're coming
                  </p>
                )}

                <div className="flex gap-2 justify-center items-center w-full mt-2">
                  <button
                    onClick={() => handleRSVP("yes")}
                    disabled={isSubmittingRSVP}
                    className={`btn-rsvp-el flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#7F1D1D] rounded-l-full rounded-r-none outline-none ${attendee?.response === "yes" ? "bg-[#991B1B] text-white ring-2 ring-[#C59B27] font-bold shadow-inner" : ""}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleRSVP("no")}
                    disabled={isSubmittingRSVP}
                    className={`btn-rsvp-el flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#7F1D1D] rounded-lg outline-none ${attendee?.response === "no" ? "bg-[#991B1B] text-white ring-2 ring-[#C59B27] font-bold shadow-inner" : ""}`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleRSVP("maybe")}
                    disabled={isSubmittingRSVP}
                    className={`btn-rsvp-el flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#7F1D1D] rounded-r-full rounded-l-none outline-none ${attendee?.response === "maybe" ? "bg-[#991B1B] text-white ring-2 ring-[#C59B27] font-bold shadow-inner" : ""}`}
                  >
                    Maybe
                  </button>
                </div>
              </div>
            )}

            {/* Chevron Arrow for scrolling down */}
            <div className="scroll-arrow-el mt-6 cursor-pointer" onClick={scrollToContent}>
              <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2L12 10L20 2" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
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

            {/* deco1 — large floral corner, top-left */}
            <img src="/red-rose-theme-assets/deco1.png"      alt="" className="std-fl-tl" />
            {/* deco-2 — small flower, top-right */}
            <img src="/red-rose-theme-assets/deco-2.png"     alt="" className="std-fl-tr" />
            {/* deco8 — stem, right vertical */}
            <img src="/red-rose-theme-assets/deco8.png"      alt="" className="std-fl-stem-r" />
            {/* deco5 — bouquet, bottom-right */}
            {/* <img src="/red-rose-theme-assets/deco5.png"      alt="" className="std-fl-br-bouquet" /> */}
            {/* deco4 — rose over bouquet */}
            <img src="/red-rose-theme-assets/deco4.png"      alt="" className="std-fl-br-rose" />
            {/* deco7 — flower, bottom-left */}
            <img src="/red-rose-theme-assets/deco7.png"      alt="" className="std-fl-bl" />
            {/* deco3 — floating accent, top-center */}
            <img src="/red-rose-theme-assets/deco3.png"      alt="" className="std-fl-float" />

            {/* ── Content ── */}
            <div className="std-content">

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
                  <Calendar size={22} color="#C59B27" />
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
                    <MapPin size={16} color="#B91C1C" />
                    {event.location}
                  </p>
                )}

                {/* Leaf ornament SVG */}
                <div className="std-leaf-row">
                  <svg width="68" height="14" viewBox="0 0 68 14" fill="none">
                    <path d="M0 7 Q8 1 17 7 Q26 13 34 7 Q42 1 51 7 Q60 13 68 7" stroke="rgba(197,155,39,0.45)" strokeWidth="1.2" fill="none"/>
                    <circle cx="34" cy="7" r="2" fill="rgba(197,155,39,0.5)"/>
                  </svg>
                </div>

                {/* Add to Calendar button */}
                <button
                  className="std-cal-btn"
                  onClick={() => {
                    if (event.location_url) {
                      window.open(event.location_url, "_blank");
                    } else {
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

              {/* Decorative Corner Ornaments to match Red Rose theme */}
              <img src="/red-rose-theme-assets/deco1.png" alt="" className="os-fl-tl" style={{ position: "absolute", top: 0, left: 0, width: "clamp(80px, 15vw, 150px)", opacity: 0.85, pointerEvents: "none" }} />
              <img src="/red-rose-theme-assets/deco-2.png" alt="" className="os-fl-tr" style={{ position: "absolute", top: 0, right: 0, width: "clamp(60px, 12vw, 110px)", opacity: 0.85, pointerEvents: "none" }} />
              <img src="/red-rose-theme-assets/deco7.png" alt="" className="os-fl-bl" style={{ position: "absolute", bottom: 0, left: 0, width: "clamp(60px, 12vw, 110px)", opacity: 0.85, pointerEvents: "none" }} />
              <img src="/red-rose-theme-assets/deco4.png" alt="" className="os-fl-br" style={{ position: "absolute", bottom: 0, right: 0, width: "clamp(80px, 15vw, 150px)", opacity: 0.85, pointerEvents: "none" }} />

              <div className="os-header">
                <p className="os-title">Our Story</p>
                <p className="os-subtitle">A Journey of Love</p>

                {/* Heart Divider */}
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

              {/* Story content */}
              <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="os-card" style={{ textAlign: "center", fontStyle: "italic", fontSize: "16px", lineHeight: "1.8", color: "#450A0A" }}>
                  <span style={{ display: "block", fontSize: "40px", color: "#C59B27", fontFamily: "Playfair Display, serif", lineHeight: "1", marginBottom: "-10px" }}>&ldquo;</span>
                  <p className="os-desc" style={{ fontSize: "clamp(15px, 2.5vw, 18px)", fontFamily: "Cormorant Garamond, serif", color: "#450a0a" }}>
                    {event.description}
                  </p>
                  <span style={{ display: "block", fontSize: "40px", color: "#C59B27", fontFamily: "Playfair Display, serif", lineHeight: "1", marginTop: "10px" }}>&rdquo;</span>
                </div>
              </div>
            </div>
          )} {/* end .os-section */}

          {/* ══ AGENDA SECTION ══ */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="ag-section">
              {/* Corner Ornaments */}
              <img src="/red-rose-theme-assets/deco1.png"  alt="" className="ag-fl-tl" />
              <img src="/red-rose-theme-assets/deco-2.png" alt="" className="ag-fl-tr" />
              <img src="/red-rose-theme-assets/deco8.png"  alt="" className="ag-fl-stem-r" />
              {/* <img src="/red-rose-theme-assets/deco5.png"  alt="" className="ag-fl-br-bouquet" /> */}
              <img src="/red-rose-theme-assets/deco4.png"  alt="" className="ag-fl-br-rose" />
              <img src="/red-rose-theme-assets/deco7.png"  alt="" className="ag-fl-bl" />
              <img src="/red-rose-theme-assets/deco3.png"  alt="" className="ag-fl-accent" />

              <div className="ag-header">
                <p className="ag-title">Schedule</p>
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
                    {/* Circle wrapper icon */}
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
                  </div>
                ))}
              </div>
            </div> /* end ag-section */
          )}

          {/* ══ PHOTO GALLERY SECTION ══ */}
          {event.slider_images && event.slider_images.length > 0 && (
            <div className="gal-section">
              {/* Corner Ornaments */}
              <img src="/red-rose-theme-assets/deco1.png"  alt="" className="gal-fl-tl" />
              <img src="/red-rose-theme-assets/deco-2.png" alt="" className="gal-fl-tr" />
              <img src="/red-rose-theme-assets/deco8.png"  alt="" className="gal-fl-stem-r" />
              {/* <img src="/red-rose-theme-assets/deco5.png"  alt="" className="gal-fl-br-bouquet" /> */}
              <img src="/red-rose-theme-assets/deco4.png"  alt="" className="gal-fl-br-rose" />
              <img src="/red-rose-theme-assets/deco7.png"  alt="" className="gal-fl-bl" />
              <img src="/red-rose-theme-assets/deco3.png"  alt="" className="gal-fl-accent" />

              <div className="gal-header">
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
                <div className="gal-carousel-wrap">
                  <motion.img
                    key={galleryIndex}
                    src={event.slider_images[galleryIndex]}
                    alt={`Gallery photograph ${galleryIndex + 1}`}
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
                      aria-label="Previous image"
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
                      aria-label="Next image"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Carousel dots indicators */}
                {event.slider_images.length > 1 && (
                  <div className="gal-dots">
                    {event.slider_images.map((_: any, idx: number) => (
                      <span
                        key={idx}
                        onClick={() => setGalleryIndex(idx)}
                        className={`gal-dot ${galleryIndex === idx ? "active" : ""}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ THANK YOU SECTION ══ */}
          <div className="ty-section">

            {/* Floral placements */}
            <img src="/red-rose-theme-assets/deco1.png"  alt="" className="ty-fl-tl" />
            <img src="/red-rose-theme-assets/deco-2.png" alt="" className="ty-fl-tr" />
            {/* <img src="/red-rose-theme-assets/deco5.png"  alt="" className="ty-fl-br-bouquet" /> */}
            <img src="/red-rose-theme-assets/deco4.png"  alt="" className="ty-fl-br-rose" />
            <img src="/red-rose-theme-assets/deco7.png"  alt="" className="ty-fl-bl" />

            <div className="ty-content">
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
                Your presence on our special day would mean the world to us. Thank you for being part of our love story and for celebrating these unforgettable moments with us.
              </p>

              {/* Couple names */}
              <p className="ty-names">{brideName} & {groomName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <footer className="w-full bg-[#7F1D1D]/95 backdrop-blur-md text-red-100 py-8 px-4 text-center mt-auto border-t border-red-950/20 z-10 relative">
        <div className="max-w-md mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C59B27]">{brideName} & {groomName}</p>
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
              className="absolute top-4 right-4 text-white hover:text-red-300 transition-colors z-50 p-2 bg-black/40 rounded-full hover:bg-black/60"
              aria-label="Close preview"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Left Nav Arrow */}
            {event.slider_images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => prev !== null ? (prev - 1 + event.slider_images.length) % event.slider_images.length : 0);
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-red-300 transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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

            {/* Right Nav Arrow */}
            {event.slider_images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => prev !== null ? (prev + 1) % event.slider_images.length : 0);
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-red-300 transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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

export default RedRoseClassicLayout;

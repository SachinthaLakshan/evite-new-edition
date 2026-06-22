"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, Clock, Volume2, VolumeX, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LavenderLayoutProps {
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

const LavenderLayout: React.FC<LavenderLayoutProps> = ({
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

  const onClickOpenButton = () => {
    setIsOpened(true);
    if (!isPlaying) toggleMusic();
    if (audioRef?.current) {
      audioRef.current.play().catch(console.error);
    }
    try {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#a78bfa', '#c4b5fd', '#8b5cf6', '#d8b4fe']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a78bfa', '#c4b5fd', '#8b5cf6', '#d8b4fe']
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

  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e8daff]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-10 h-10 text-purple-600 animate-pulse" />
          </motion.div>
          <p className="text-[#3b226e] font-semibold animate-pulse">Loading Invitation...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e8daff] p-6">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
          <p className="text-red-500 font-bold text-lg">Event Not Found</p>
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

  // Helper to dynamically render timeline icons based on title and description
  const getTimelineIcon = (title: string, description: string) => {
    const text = (title + " " + description).toLowerCase();
    
    if (text.includes("ceremony") || text.includes("say i do") || text.includes("wedding") || text.includes("marry")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b226e" strokeWidth="1.5" className="w-6 h-6">
          <circle cx="8" cy="14" r="4.5" />
          <circle cx="16" cy="10" r="4.5" />
          <path d="M15 6.5l1-1.5 1.5 1-1 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    if (text.includes("reception") || text.includes("cocktail") || text.includes("party") || text.includes("cheers")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b226e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M8 22h8M10 17v5M14 17v5" />
          <path d="M10 7a3 3 0 0 0-3 3v7h6v-7a3 3 0 0 0-3-3z" fill="#3b226e" fillOpacity="0.1" />
          <path d="M14 7a3 3 0 0 1 3 3v7h-6v-7a3 3 0 0 1 3-3z" fill="#3b226e" fillOpacity="0.1" />
          <path d="M11 6a2 2 0 0 1 2 0" />
        </svg>
      );
    }
    
    if (text.includes("dinner") || text.includes("lunch") || text.includes("food") || text.includes("feast") || text.includes("eat")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b226e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="5" fill="#3b226e" fillOpacity="0.1" />
          <path d="M5 4v9a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4M7 4v4M17 4v14M19 4h-4v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4" />
        </svg>
      );
    }
    
    if (text.includes("dance") || text.includes("dancing") || text.includes("music") || text.includes("dj") || text.includes("song")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b226e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" fill="#3b226e" fillOpacity="0.1" />
          <circle cx="18" cy="16" r="3" fill="#3b226e" fillOpacity="0.1" />
        </svg>
      );
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b226e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#3b226e" fillOpacity="0.1" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen text-[#3b226e] relative overflow-x-hidden flex flex-col items-center w-full lavender-root-wrapper">
      
      {/* ══ PENDING ACTIVATION BANNER ══ */}
      {!event?.is_active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-red-600/90 backdrop-blur-sm text-white py-6 px-8 rounded-2xl shadow-2xl text-center font-medium flex flex-col items-center gap-4 max-w-md pointer-events-auto border-2 border-white/20">
            <div className="bg-white/20 p-3 rounded-full">
              <X className="h-8 w-8 text-white" />
            </div>
            <span className="text-xl">This event is currently pending activation and cannot receive RSVP responses.</span>
          </div>
        </div>
      )}

      {/* ══ OPEN INVITATION ENVELOPE OVERLAY ══ */}
      {!isOpened && (
        <div className="fixed inset-0 z-50 bg-[#eedfff]/95 backdrop-blur-md flex items-center justify-center p-4">
          <style dangerouslySetInnerHTML={{ __html: `
            .animated-open-btn {
              position: relative;
              padding: 14px 38px;  
              border: none;
              background: none;
              cursor: pointer;
              font-family: 'Great Vibes', cursive;
              font-size: 34px;  
              color: #ffffff;
              background-image: linear-gradient(135deg, #9b6de0 0%, #7c3aed 51%, #9b6de0 100%);
              border: 2px solid #ffffff;
              box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
              border-radius: 99px; 
              z-index: 1;  
              overflow: hidden;   
              transition: all 0.3s ease;
            }
            .animated-open-btn:hover {
              transform: translateY(-3px) scale(1.03);
              box-shadow: 0 12px 30px rgba(124, 58, 237, 0.45);
            }
            .animated-open-btn:active {
              transform: translateY(-1px) scale(1.01);
            }
            .animated-open-btn::before {
              content: '';
              pointer-events: none;
              opacity: .4;
              background:
                radial-gradient(circle at 20% 35%,  transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
                radial-gradient(circle at 75% 44%, transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
                radial-gradient(circle at 46% 52%, transparent 0, transparent 4px, rgba(255,255,255,1) 5px, rgba(255,255,255,1) 6px, transparent 6px);
              width: 100%;
              height: 300%;
              top: 0;
              left: 0;
              position: absolute;
              animation: btn-bubbles 4s linear infinite both;
            }
            @keyframes btn-bubbles {
              from { transform: translate(0, 0); }
              to { transform: translate(0, -66.666%); }
            }
            
            .envelope-card {
              background: rgba(255, 255, 255, 0.65);
              backdrop-filter: blur(18px);
              -webkit-backdrop-filter: blur(18px);
              border: 1.5px solid rgba(155, 107, 203, 0.3);
              border-radius: 36px;
              padding: 48px 32px;
              width: 100%;
              max-width: 460px;
              box-shadow: 0 12px 40px rgba(155, 107, 203, 0.2);
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 24px;
              position: relative;
            }
          `}} />
          
          <div className="envelope-card">
            {/* Envelope absolute decorations */}
            <img src="/lavender-theme-assets/deco1.png" alt="" className="absolute -top-10 -left-10 w-28 pointer-events-none opacity-80" />
            <img src="/lavender-theme-assets/deco-2.png" alt="" className="absolute -top-6 -right-6 w-14 pointer-events-none opacity-80" />
            <img src="/lavender-theme-assets/deco5.png" alt="" className="absolute -bottom-10 -right-10 w-28 pointer-events-none opacity-80" />

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-semibold tracking-[0.3em] text-[#9B6BCB] uppercase text-center block">Wedding Invitation</span>
              <h2 className="wedding-names-font text-2xl md:text-3xl font-medium text-[#3b226e] uppercase tracking-widest mt-1 text-center">
                {brideName} <span className="font-normal lowercase text-[#7b4fcf]">&amp;</span> {groomName}
              </h2>
            </div>
            
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#B78DDA]/60 to-transparent" />
            
            <p className="font-serif text-[#6B4E8A] italic text-base px-4 text-center">
              We request the honor of your presence as we celebrate our love.
            </p>
            
            <button
              type="button"
              onClick={onClickOpenButton}
              className="animated-open-btn mt-2"
            >
              Open Invitation
            </button>
          </div>
        </div>
      )}

      {/* Import elegant fonts for wedding theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Courier+Prime&family=Great+Vibes&display=swap');

        .lavender-root-wrapper {
          background: radial-gradient(circle at center, #e8daff 0%, #c1a4fc 100%) fixed;
          font-family: 'Inter', sans-serif;
        }
        .wedding-names-font {
          font-family: 'Cormorant Garamond', serif;
          letter-spacing: 4px;
          text-shadow: 0 2px 10px rgba(123, 79, 207, 0.1);
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
          filter: url(#remove-black-filter);
          pointer-events: none;
          z-index: 2;
        }
        .btn-rsvp-el {
          font-family: 'Great Vibes', 'Alex Brush', cursive;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: #e8daff;
          color: #3b226e;
          box-shadow: 0 4px 15px rgba(59, 34, 110, 0.1);
        }
        .btn-rsvp-el:hover {
          transform: translateY(-3px) scale(1.03);
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(59, 34, 110, 0.2);
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
          background: linear-gradient(160deg, #F8F1FF 0%, #EADCF8 55%, #F4ECFF 100%);
        }
        /* Blur orbs */
        .std-orb-1 {
          position: absolute; width: 380px; height: 380px; border-radius: 50%;
          background: rgba(196,165,240,0.25); filter: blur(75px);
          top: -80px; left: -60px; pointer-events: none; z-index: 0;
        }
        .std-orb-2 {
          position: absolute; width: 340px; height: 340px; border-radius: 50%;
          background: rgba(167,139,250,0.16); filter: blur(65px);
          bottom: -50px; right: -50px; pointer-events: none; z-index: 0;
        }
        .std-orb-3 {
          position: absolute; width: 220px; height: 220px; border-radius: 50%;
          background: rgba(221,204,255,0.2); filter: blur(50px);
          top: 45%; left: 20%; pointer-events: none; z-index: 0;
        }
        /* Floral assets */
        .std-fl-tl {
          position: absolute; top: -22px; left: -28px;
          width: clamp(160px, 33vw, 270px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 8px 22px rgba(124,58,237,0.2));
        }
        .std-fl-tr {
          position: absolute; top: 22px; right: 16px;
          width: clamp(52px, 11vw, 90px);
          pointer-events: none; z-index: 2; opacity: 0.9;
          filter: drop-shadow(0 4px 10px rgba(124,58,237,0.14));
        }
        .std-fl-stem-r {
          position: absolute; top: 50%; right: 14px;
          transform: translateY(-50%);
          width: clamp(26px, 5.5vw, 44px);
          pointer-events: none; z-index: 2; opacity: 0.7;
        }
        .std-fl-br-bouquet {
          position: absolute; bottom: -22px; right: -22px;
          width: clamp(140px, 28vw, 240px);
          pointer-events: none; z-index: 2;
          transform: scaleX(-1);
          filter: drop-shadow(0 6px 18px rgba(124,58,237,0.16));
        }
        .std-fl-br-rose {
          position: absolute; bottom: 32px; right: 72px;
          width: clamp(62px, 13vw, 108px);
          pointer-events: none; z-index: 3;
          transform: rotate(10deg);
          filter: drop-shadow(0 4px 12px rgba(124,58,237,0.13));
        }
        .std-fl-bl {
          position: absolute; bottom: 22px; left: 16px;
          width: clamp(44px, 9vw, 76px);
          pointer-events: none; z-index: 2; opacity: 0.8;
          transform: rotate(-14deg);
        }
        .std-fl-float {
          position: absolute; top: 18px; left: 50%;
          transform: translateX(-50%) rotate(-6deg);
          width: clamp(20px, 4.5vw, 34px);
          pointer-events: none; z-index: 2; opacity: 0.45;
        }
        /* Content */
        .std-content {
          position: relative; z-index: 4;
          display: flex; flex-direction: column;
          align-items: center; gap: 0; width: 100%;
        }
        /* Title */
        .std-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(54px, 13vw, 92px);
          color: #4B2E63; line-height: 1;
          text-shadow: 0 4px 24px rgba(75,46,99,0.14);
          margin-bottom: 10px;
        }
        /* Heart divider */
        .std-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 30px;
        }
        .std-div-line {
          width: 52px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(155,107,203,0.55));
        }
        .std-div-line.r { background: linear-gradient(270deg, transparent, rgba(155,107,203,0.55)); }
        .std-div-heart {
          display: flex; align-items: center; gap: 5px;
        }
        .std-div-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(155,107,203,0.5);
        }
        .std-heart-sym { font-size: 13px; color: #9B6BCB; line-height: 1; }
        /* Info Card */
        .std-card {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(155,107,203,0.35);
          border-radius: 28px;
          padding: 36px 44px 32px;
          max-width: 500px; width: 100%;
          display: flex; flex-direction: column;
          align-items: center; gap: 14px;
          box-shadow:
            0 8px 32px rgba(155,107,203,0.18),
            0 2px 8px rgba(155,107,203,0.1),
            inset 0 1px 0 rgba(255,255,255,0.85);
        }
        /* Calendar icon row inside card */
        .std-cal-icon {
          display: flex; align-items: center; gap: 12px;
          color: rgba(155,107,203,0.5);
        }
        .std-cal-line { width: 48px; height: 1px; background: rgba(155,107,203,0.3); }
        /* Date text */
        .std-date-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(24px, 6vw, 38px);
          font-weight: 700; color: #4B2E63;
          letter-spacing: 0.02em; line-height: 1;
        }
        /* Heart dot separator */
        .std-mini-heart { font-size: 12px; color: #9B6BCB; }
        /* Location row */
        .std-location {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(16px, 3.8vw, 20px);
          font-weight: 500; color: #4B2E63;
        }
        /* Leaf ornament SVG row */
        .std-leaf-row {
          display: flex; align-items: center; gap: 10px;
          opacity: 0.55;
        }
        /* Add to Calendar button */
        .std-cal-btn {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 13px 30px;
          border-radius: 100px;
          background: linear-gradient(135deg, #9B6BCB, #7c3aed);
          color: #fff; font-size: 14px; font-weight: 600;
          letter-spacing: 0.07em; cursor: pointer; border: none;
          box-shadow: 0 6px 22px rgba(124,58,237,0.32);
          transition: all 0.25s ease;
          text-transform: none;
          font-family: 'Inter', sans-serif;
        }
        .std-cal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(124,58,237,0.42);
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        }
        /* Countdown grid */
        .std-countdown {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%; max-width: 500px;
          margin-top: 28px;
        }
        @media (max-width: 440px) {
          .std-countdown { grid-template-columns: repeat(2, 1fr); }
        }
        /* Countdown card */
        .std-cd-card {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(155,107,203,0.3);
          border-radius: 20px;
          padding: 18px 10px 14px;
          display: flex; flex-direction: column;
          align-items: center; gap: 4px;
          box-shadow: 0 4px 18px rgba(155,107,203,0.14), inset 0 1px 0 rgba(255,255,255,0.8);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .std-cd-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(155,107,203,0.24);
        }
        .std-cd-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 7vw, 48px);
          font-weight: 700; color: #4B2E63;
          line-height: 1;
        }
        .std-cd-heart { font-size: 9px; color: rgba(155,107,203,0.6); }
        .std-cd-label {
          font-size: 9px; letter-spacing: 0.22em;
          text-transform: uppercase; font-weight: 700;
          color: #9B6BCB;
        }
        /* Mobile */
        @media (max-width: 560px) {
          .std-fl-stem-r { display: none; }
          .std-fl-float  { display: none; }
          .std-fl-tr     { width: 46px; right: 6px; }
          .std-fl-bl     { width: 40px; }
          .std-fl-tl     { width: 140px; }
          .std-fl-br-bouquet { width: 120px; }
          .std-fl-br-rose    { width: 56px; right: 48px; }
          .std-card { padding: 28px 20px 24px; }
        }
        /* ════════════════════════════════════════
           AGENDA SECTION
        ════════════════════════════════════════ */
        .ag-section {
          position: relative;
          width: 100%;
          min-height: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 64px 32px 80px;
          text-align: center;
          overflow: hidden;
          border-radius: 32px;
          background: linear-gradient(165deg, #F8F1FF 0%, #EADCF8 55%, #EDE0FF 100%);
        }
        /* Blur orbs */
        .ag-orb-1 {
          position: absolute; width: 320px; height: 320px; border-radius: 50%;
          background: rgba(196,165,240,0.22); filter: blur(65px);
          top: -60px; left: -40px; pointer-events: none; z-index: 0;
        }
        .ag-orb-2 {
          position: absolute; width: 280px; height: 280px; border-radius: 50%;
          background: rgba(167,139,250,0.14); filter: blur(55px);
          bottom: -40px; right: -30px; pointer-events: none; z-index: 0;
        }
        /* Floral assets */
        .ag-fl-tl {
          position: absolute; top: -16px; left: -20px;
          width: clamp(130px, 26vw, 220px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 6px 16px rgba(124,58,237,0.18));
        }
        .ag-fl-tr {
          position: absolute; top: 16px; right: 12px;
          width: clamp(44px, 9vw, 80px);
          pointer-events: none; z-index: 2; opacity: 0.88;
        }
        .ag-fl-stem-r {
          position: absolute; top: 38%; right: 8px;
          width: clamp(70px, 13vw, 115px);
          pointer-events: none; z-index: 2; opacity: 0.72;
        }
        .ag-fl-br-bouquet {
          position: absolute; bottom: -16px; right: -16px;
          width: clamp(120px, 24vw, 200px);
          pointer-events: none; z-index: 2; transform: scaleX(-1);
          filter: drop-shadow(0 5px 14px rgba(124,58,237,0.15));
        }
        .ag-fl-br-rose {
          position: absolute; bottom: 26px; right: 60px;
          width: clamp(55px, 11vw, 95px);
          pointer-events: none; z-index: 3; transform: rotate(8deg);
        }
        .ag-fl-bl {
          position: absolute; bottom: 44px; left: 10px;
          width: clamp(50px, 10vw, 85px);
          pointer-events: none; z-index: 2; opacity: 0.8;
          transform: rotate(-10deg);
        }
        .ag-fl-accent {
          position: absolute; top: 48%; left: 6%;
          width: clamp(18px, 3.5vw, 28px);
          pointer-events: none; z-index: 2; opacity: 0.38;
          transform: rotate(-14deg);
        }
        /* Content wrapper */
        .ag-content {
          position: relative; z-index: 4;
          width: 100%; max-width: 720px;
          display: flex; flex-direction: column;
          align-items: center;
        }
        /* Title */
        .ag-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(52px, 11vw, 84px);
          color: #4B2E63; line-height: 1;
          text-shadow: 0 4px 20px rgba(75,46,99,0.14);
          margin-bottom: 10px;
        }
        /* Divider */
        .ag-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 44px;
        }
        .ag-div-line {
          width: 44px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(155,107,203,0.55));
        }
        .ag-div-line.r {
          background: linear-gradient(270deg, transparent, rgba(155,107,203,0.55));
        }
        .ag-div-ornament { font-size: 12px; color: #B78DDA; letter-spacing: 3px; }
        /* ── TIMELINE: CSS Grid approach ──
           Columns: [left-card] [center-dot] [right-card]
           Each row: card fills its column, dot always centered  */
        .ag-timeline {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        /* Vertical dashed line — absolutely centered */
        .ag-vline {
          position: absolute;
          top: 0; bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          border-left: 2.5px dashed rgba(183,141,218,0.5);
          z-index: 1;
          pointer-events: none;
        }
        /* One timeline row */
        .ag-row {
          display: grid;
          grid-template-columns: 1fr 40px 1fr;
          align-items: center;
          width: 100%;
          position: relative;
          z-index: 2;
          margin-bottom: 32px;
          min-height: 100px;
        }
        /* Dot cell (always center column) */
        .ag-dot-cell {
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3;
        }
        .ag-dot {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid #B78DDA;
          box-shadow: 0 0 0 5px rgba(183,141,218,0.22), 0 0 14px rgba(183,141,218,0.3);
          flex-shrink: 0;
        }
        /* Card placed in left column */
        .ag-col-left {
          display: flex;
          justify-content: flex-end;
          padding-right: 20px;
        }
        /* Card placed in right column */
        .ag-col-right {
          display: flex;
          justify-content: flex-start;
          padding-left: 20px;
        }
        /* Empty cell */
        .ag-col-empty { display: block; }
        /* Event card */
        .ag-card {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(155,107,203,0.3);
          border-radius: 24px;
          padding: 18px 20px 16px;
          width: 100%;
          max-width: 280px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow:
            0 4px 20px rgba(155,107,203,0.18),
            inset 0 1px 0 rgba(255,255,255,0.9);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        .ag-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(155,107,203,0.26);
        }
        /* Leaf watermark */
        .ag-card-leaf {
          position: absolute; bottom: 5px; right: 8px;
          font-size: 18px; opacity: 0.1;
          pointer-events: none; user-select: none;
        }
        /* Icon circle */
        .ag-icon-circle {
          width: 42px; height: 42px; border-radius: 50%;
          background: rgba(183,141,218,0.16);
          border: 1.5px solid rgba(155,107,203,0.28);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #7c3aed;
        }
        /* Time */
        .ag-time {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 4.5vw, 28px);
          font-weight: 700; color: #4B2E63;
          line-height: 1; letter-spacing: 0.03em;
        }
        /* Heart sub-row */
        .ag-time-sub {
          display: flex; align-items: center; gap: 4px;
          margin: 4px 0 5px;
        }
        .ag-ts-dot { width: 3px; height: 3px; border-radius: 50%; background: #B78DDA; }
        .ag-ts-heart { font-size: 8px; color: #B78DDA; line-height: 1; }
        /* Event name */
        .ag-event-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(12px, 2.8vw, 15px);
          color: #6B4E8A; font-weight: 500; line-height: 1.4;
        }
        /* Mobile — single column layout */
        @media (max-width: 600px) {
          .ag-section { padding: 56px 16px 60px; }
          .ag-vline { left: 20px; transform: none; }
          .ag-row {
            grid-template-columns: 40px 1fr;
            grid-template-rows: auto;
          }
          /* Force all rows: dot in col 1, card in col 2 */
          .ag-dot-cell  { grid-column: 1; grid-row: 1; }
          .ag-col-left, .ag-col-right {
            grid-column: 2; grid-row: 1;
            justify-content: flex-start;
            padding-left: 14px; padding-right: 0;
          }
          .ag-col-empty { display: none; }
          .ag-card { max-width: 100%; }
          .ag-fl-tl { width: 110px; }
          .ag-fl-br-bouquet { width: 100px; }
          .ag-fl-br-rose { width: 48px; right: 40px; }
          .ag-fl-stem-r { display: none; }
          .ag-fl-accent { display: none; }
        }

        /* ══════════════════════════════════════════
           OUR STORY SECTION
        ══════════════════════════════════════════ */
        .os-section {
          position: relative;
          width: 100%;
          min-height: 720px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 80px;
          text-align: center;
          overflow: hidden;
          border-radius: 32px;
          background: linear-gradient(160deg, #F7F0FF 0%, #EADDF8 55%, #E0CCFF 100%);
        }
        /* Soft blurred background orbs */
        .os-bg-orb-1 {
          position: absolute;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: rgba(196,165,240,0.28);
          filter: blur(80px);
          top: -80px; left: -80px;
          pointer-events: none; z-index: 0;
        }
        .os-bg-orb-2 {
          position: absolute;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: rgba(167,139,250,0.18);
          filter: blur(70px);
          bottom: -60px; right: -60px;
          pointer-events: none; z-index: 0;
        }
        .os-bg-orb-3 {
          position: absolute;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(221,204,255,0.22);
          filter: blur(55px);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none; z-index: 0;
        }
        /* ── Flower positions ── */
        /* deco1: large floral corner – top-left */
        .os-flower-tl {
          position: absolute;
          top: -20px; left: -30px;
          width: clamp(160px, 32vw, 260px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 8px 20px rgba(124,58,237,0.18));
        }
        /* deco-2: small purple flower – top-right */
        .os-flower-tr {
          position: absolute;
          top: 24px; right: 20px;
          width: clamp(55px, 12vw, 95px);
          pointer-events: none; z-index: 2;
          opacity: 0.88;
          filter: drop-shadow(0 4px 10px rgba(124,58,237,0.14));
        }
        /* deco8: thin lavender stem – right side vertical */
        .os-flower-stem-r {
          position: absolute;
          top: 50%; right: 18px;
          transform: translateY(-50%);
          width: clamp(28px, 6vw, 48px);
          pointer-events: none; z-index: 2;
          opacity: 0.72;
        }
        /* deco5: floral bouquet – bottom-right */
        .os-flower-br-bouquet {
          position: absolute;
          bottom: -24px; right: -24px;
          width: clamp(130px, 26vw, 220px);
          pointer-events: none; z-index: 2;
          transform: scaleX(-1);
          filter: drop-shadow(0 6px 18px rgba(124,58,237,0.16));
        }
        /* deco4: white rose – near bottom-right over bouquet */
        .os-flower-br-rose {
          position: absolute;
          bottom: 30px; right: 70px;
          width: clamp(65px, 14vw, 110px);
          pointer-events: none; z-index: 3;
          transform: rotate(12deg);
          filter: drop-shadow(0 4px 12px rgba(124,58,237,0.13));
        }
        /* deco7: small lavender flower – left/bottom */
        .os-flower-bl {
          position: absolute;
          bottom: 24px; left: 20px;
          width: clamp(48px, 10vw, 80px);
          pointer-events: none; z-index: 2;
          opacity: 0.82;
          transform: rotate(-12deg);
          filter: drop-shadow(0 3px 8px rgba(124,58,237,0.12));
        }
        /* deco3: floating accent – top-center */
        .os-flower-float {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) rotate(-8deg);
          width: clamp(22px, 5vw, 36px);
          pointer-events: none; z-index: 2;
          opacity: 0.5;
        }
        /* ── Content layer ── */
        .os-content {
          position: relative; z-index: 4;
          display: flex; flex-direction: column;
          align-items: center; gap: 0;
        }
        /* Title */
        .os-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(58px, 14vw, 96px);
          color: #4B2E63;
          line-height: 1;
          text-shadow: 0 4px 24px rgba(75,46,99,0.15);
          margin-bottom: 10px;
        }
        /* Heart divider below title */
        .os-title-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 28px;
        }
        .os-divider-line {
          width: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(150,110,190,0.6));
        }
        .os-divider-line.right {
          background: linear-gradient(270deg, transparent, rgba(150,110,190,0.6));
        }
        .os-divider-heart {
          display: flex; align-items: center; gap: 5px;
        }
        .os-divider-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(150,110,190,0.55);
        }
        .os-heart-symbol {
          font-size: 13px;
          color: #9b6de0;
          line-height: 1;
        }
        /* Quote Card */
        .os-card {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.72) 0%,
            rgba(243,233,255,0.65) 100%
          );
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(150,110,190,0.35);
          border-radius: 32px;
          padding: 44px 44px 38px;
          max-width: 480px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow:
            0 8px 32px rgba(150,110,190,0.18),
            0 2px 8px rgba(150,110,190,0.10),
            inset 0 1px 0 rgba(255,255,255,0.90);
        }
        /* Large decorative quote marks */
        .os-q-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 110px;
          line-height: 0.5;
          color: rgba(150,110,190,0.22);
          user-select: none;
          pointer-events: none;
        }
        .os-q-mark.open  { align-self: flex-start; margin-bottom: -18px; }
        .os-q-mark.close { align-self: flex-end;   margin-top: -18px; }
        /* Quote text */
        .os-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 4.2vw, 22px);
          font-weight: 500;
          color: #4B2E63;
          line-height: 1.9;
          text-align: center;
          padding: 0 8px;
        }
        .os-forever {
          font-style: italic;
          font-family: 'Playfair Display', serif;
          color: #7c3aed;
          font-weight: 600;
        }
        /* Inner card divider */
        .os-inner-divider {
          display: flex; align-items: center; gap: 10px;
          width: 100%; margin: 2px 0;
        }
        .os-inner-line { flex: 1; height: 1px; background: rgba(150,110,190,0.25); }
        .os-inner-heart { font-size: 10px; color: #c4a5f0; }
        /* Inner ornament wave */
        .os-wave { opacity: 0.65; }
        /* Mobile overrides */
        @media (max-width: 560px) {
          .os-flower-stem-r  { display: none; }
          .os-flower-float   { display: none; }
          .os-flower-tr      { width: 48px; top: 10px; right: 8px; }
          .os-flower-bl      { width: 44px; bottom: 12px; left: 10px; }
          .os-flower-tl      { width: 140px; }
          .os-flower-br-bouquet { width: 120px; }
          .os-flower-br-rose    { width: 60px; right: 50px; }
          .os-card { padding: 32px 22px 26px; }
        }

        /* ══════════════════════════════════════════
           GALLERY SECTION
        ══════════════════════════════════════════ */
        .gal-section {
          position: relative;
          width: 100%;
          min-height: 760px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 72px 24px 80px;
          text-align: center;
          overflow: hidden;
          border-radius: 32px;
          background: linear-gradient(165deg, #F8F1FF 0%, #EADCF8 55%, #EDE0FF 100%);
        }
        /* Blur orbs */
        .gal-orb-1 {
          position: absolute; width: 340px; height: 340px; border-radius: 50%;
          background: rgba(196,165,240,0.22); filter: blur(70px);
          top: -40px; left: -40px; pointer-events: none; z-index: 0;
        }
        .gal-orb-2 {
          position: absolute; width: 300px; height: 300px; border-radius: 50%;
          background: rgba(167,139,250,0.15); filter: blur(60px);
          bottom: -30px; right: -30px; pointer-events: none; z-index: 0;
        }
        /* Floral assets */
        .gal-fl-tl {
          position: absolute; top: -16px; left: -20px;
          width: clamp(130px, 26vw, 220px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 6px 16px rgba(124,58,237,0.18));
        }
        .gal-fl-tr {
          position: absolute; top: 18px; right: 14px;
          width: clamp(44px, 9vw, 80px);
          pointer-events: none; z-index: 2; opacity: 0.88;
        }
        .gal-fl-stem-r {
          position: absolute; top: 40%; right: 10px;
          width: clamp(70px, 13vw, 115px);
          pointer-events: none; z-index: 2; opacity: 0.72;
        }
        .gal-fl-br-bouquet {
          position: absolute; bottom: -16px; right: -16px;
          width: clamp(120px, 24vw, 200px);
          pointer-events: none; z-index: 2; transform: scaleX(-1);
          filter: drop-shadow(0 5px 14px rgba(124,58,237,0.15));
        }
        .gal-fl-br-rose {
          position: absolute; bottom: 26px; right: 60px;
          width: clamp(55px, 11vw, 95px);
          pointer-events: none; z-index: 3; transform: rotate(8deg);
        }
        .gal-fl-bl {
          position: absolute; bottom: 44px; left: 10px;
          width: clamp(50px, 10vw, 85px);
          pointer-events: none; z-index: 2; opacity: 0.8;
          transform: rotate(-10deg);
        }
        .gal-fl-accent {
          position: absolute; top: 45%; left: 8%;
          width: clamp(18px, 3.5vw, 28px);
          pointer-events: none; z-index: 2; opacity: 0.38;
        }
        /* Content wrapper */
        .gal-content {
          position: relative; z-index: 4;
          width: 100%; max-width: 720px;
          display: flex; flex-direction: column;
          align-items: center;
        }
        .gal-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(52px, 11vw, 84px);
          color: #4B2E63; line-height: 1;
          text-shadow: 0 4px 20px rgba(75,46,99,0.14);
          margin-bottom: 10px;
        }
        .gal-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 40px;
        }
        .gal-div-line {
          width: 44px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(155,107,203,0.55));
        }
        .gal-div-line.r {
          background: linear-gradient(270deg, transparent, rgba(155,107,203,0.55));
        }
        .gal-div-ornament { font-size: 12px; color: #B78DDA; letter-spacing: 3px; }
        
        /* Carousel Container */
        .gal-carousel-card {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(155, 107, 203, 0.35);
          border-radius: 32px;
          padding: 24px;
          width: 100%;
          max-width: 580px;
          box-shadow:
            0 10px 30px rgba(155, 107, 203, 0.16),
            inset 0 1px 0 rgba(255,255,255,0.9);
          position: relative;
        }
        .gal-slider {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(235, 225, 250, 0.4);
          box-shadow: inset 0 2px 8px rgba(75,46,99,0.06);
        }
        .gal-slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: zoom-in;
        }
        .gal-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(155, 107, 203, 0.3);
          color: #4B2E63;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(155,107,203,0.15);
        }
        .gal-nav-btn:hover {
          background: #ffffff;
          color: #7c3aed;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 18px rgba(155,107,203,0.22);
        }
        .gal-nav-btn.prev { left: 12px; }
        .gal-nav-btn.next { right: 12px; }
        .gal-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: translateY(-50%);
        }
        .gal-indicator-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
        }
        .gal-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(155, 107, 203, 0.3);
          border: 1px solid rgba(155, 107, 203, 0.2);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .gal-dot.active {
          background: #9B6BCB;
          width: 24px;
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(155,107,203,0.4);
        }

        /* ══════════════════════════════════════════
           THANK YOU SECTION
        ══════════════════════════════════════════ */
        .ty-section {
          position: relative;
          width: 100%;
          min-height: 520px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 90px;
          text-align: center;
          overflow: hidden;
          border-radius: 32px;
          background: linear-gradient(180deg, #F8F1FF 0%, #EADDF8 100%);
        }
        .ty-orb {
          position: absolute; width: 360px; height: 360px; border-radius: 50%;
          background: rgba(196,165,240,0.25); filter: blur(75px);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none; z-index: 0;
        }
        .ty-fl-tl {
          position: absolute; top: -20px; left: -30px;
          width: clamp(140px, 28vw, 240px);
          pointer-events: none; z-index: 2;
          filter: drop-shadow(0 6px 16px rgba(124,58,237,0.15));
        }
        .ty-fl-br-bouquet {
          position: absolute; bottom: -20px; right: -20px;
          width: clamp(130px, 26vw, 210px);
          pointer-events: none; z-index: 2; transform: scaleX(-1);
          filter: drop-shadow(0 5px 14px rgba(124,58,237,0.14));
        }
        .ty-fl-br-rose {
          position: absolute; bottom: 24px; right: 54px;
          width: clamp(52px, 10.5vw, 90px);
          pointer-events: none; z-index: 3; transform: rotate(10deg);
        }
        .ty-fl-tr {
          position: absolute; top: 22px; right: 18px;
          width: clamp(40px, 8vw, 70px);
          pointer-events: none; z-index: 2; opacity: 0.8;
        }
        .ty-fl-bl {
          position: absolute; bottom: 32px; left: 16px;
          width: clamp(42px, 8.5vw, 72px);
          pointer-events: none; z-index: 2; opacity: 0.75;
          transform: rotate(-12deg);
        }
        .ty-content {
          position: relative; z-index: 4;
          width: 100%; max-width: 600px;
          display: flex; flex-direction: column;
          align-items: center;
        }
        .ty-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(56px, 12vw, 90px);
          color: #4B2E63; line-height: 1;
          text-shadow: 0 4px 20px rgba(75,46,99,0.14);
          margin-bottom: 8px;
        }
        .ty-msg {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 4.2vw, 24px);
          font-weight: 500;
          color: #6B4E8A;
          line-height: 1.8;
          max-width: 480px;
          padding: 0 12px;
          margin-top: 14px;
          font-style: italic;
        }
        .ty-names {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(14px, 3vw, 18px);
          font-weight: 600;
          color: #4B2E63;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 24px;
        }
        
        /* Mobile overrides for Gallery & Thank You */
        @media (max-width: 560px) {
          .gal-nav-btn { width: 36px; height: 36px; }
          .gal-nav-btn.prev { left: 6px; }
          .gal-nav-btn.next { right: 6px; }
          .gal-carousel-card { padding: 14px; border-radius: 24px; }
          .gal-fl-stem-r { display: none; }
          .gal-fl-accent { display: none; }
          .gal-fl-tr { width: 44px; top: 12px; right: 8px; }
          .gal-fl-bl { width: 44px; bottom: 12px; left: 8px; }
          .gal-fl-tl { width: 120px; }
          .gal-fl-br-bouquet { width: 100px; }
          .gal-fl-br-rose { width: 50px; right: 44px; }
          
          .ty-fl-tr { width: 38px; top: 12px; right: 8px; }
          .ty-fl-bl { width: 38px; bottom: 12px; left: 8px; }
          .ty-fl-tl { width: 120px; }
          .ty-fl-br-bouquet { width: 100px; }
          .ty-fl-br-rose { width: 50px; right: 44px; }
        }
      `}</style>

      {/* SVG Filter to remove black background from overlay gif */}
      <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="remove-black-filter" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
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
          className="fixed top-4 right-4 z-40 p-2.5 rounded-full bg-white/80 hover:bg-white shadow-md border border-purple-100 text-[#3b226e] transition-all"
          aria-label="Toggle music"
        >
          {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}

      {/* Corner Decor Images - Fixed position in background */}
      <img src="/lavender-theme-assets/top-left-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] top-0 left-0 -translate-x-[15px] -translate-y-[15px] md:-translate-x-[35px] md:-translate-y-[35px]" />
      <img src="/lavender-theme-assets/top-right-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] top-0 right-0 translate-x-[15px] -translate-y-[15px] md:translate-x-[35px] md:-translate-y-[35px]" />
      <img src="/lavender-theme-assets/bottom-left-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] bottom-0 left-0 -translate-x-[15px] translate-y-[15px] md:-translate-x-[35px] md:translate-y-[35px]" />
      <img src="/lavender-theme-assets/bottom-right-coner.png" alt="" className="fixed pointer-events-none z-0 w-[20vw] max-w-[250px] min-w-[80px] bottom-0 right-0 translate-x-[15px] translate-y-[15px] md:translate-x-[35px] md:translate-y-[35px]" />

      {/* Hero Section Container */}
      <div className="w-full min-h-screen relative flex justify-center items-center px-4 py-8 bg-transparent overflow-hidden">
        {(event.background_image_url || event.image_url) && (
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.4] mix-blend-overlay"
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
            className="wedding-names-font text-3xl md:text-5xl font-medium text-[#3b226e] text-center uppercase tracking-widest"
          >
            {brideName} <span className="text-4xl md:text-6xl font-normal lowercase mx-2 text-[#7b4fcf]">&amp;</span> {groomName}
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
            {/* If NOT verified: Verification flow styled in lavender theme */}
            {!isVerified ? (
              <div className="w-full space-y-4">
                <p className="font-mono text-sm font-semibold tracking-wider text-[#3b226e] uppercase">
                  Verify your invitation to RSVP
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                  <input
                    type="text"
                    placeholder="Enter WhatsApp Number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full sm:w-64 h-12 px-5 rounded-full border-[1.5px] border-[#3b226e] bg-[#e8daff] text-[#3b226e] placeholder-purple-400/70 text-center font-semibold outline-none focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    onClick={() => verifyAttendee()}
                    className="h-12 w-full sm:w-auto px-6 rounded-full border-[1.5px] border-[#3b226e] bg-[#3b226e] text-white hover:bg-white hover:text-[#3b226e] font-semibold transition-all shadow-md active:translate-y-0.5"
                  >
                    Verify
                  </button>
                </div>
              </div>
            ) : (
              /* If verified: Show custom YES/NO/MAYBE buttons or Thank you message */
              <div className="w-full space-y-4">
                <AnimatePresence mode="wait">
                  {
                    <motion.div
                      key="rsvp-buttons-block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 w-full"
                    >
                      <p className="font-mono text-sm md:text-base font-semibold tracking-wider text-[#3b226e]">
                        Hi {attendee?.name || "Guest"}! Let us know you're coming
                      </p>
                      <div className="flex gap-2 justify-center items-center w-full">
                        <button
                          onClick={() => handleRSVP("yes")}
                          disabled={isSubmittingRSVP}
                          className="btn-rsvp-el btn-yes flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#3b226e] rounded-l-full rounded-r-none outline-none"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleRSVP("no")}
                          disabled={isSubmittingRSVP}
                          className="btn-rsvp-el btn-no flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#3b226e] rounded-lg outline-none"
                        >
                          No
                        </button>
                        <button
                          onClick={() => handleRSVP("maybe")}
                          disabled={isSubmittingRSVP}
                          className="btn-rsvp-el btn-maybe flex-1 h-14 text-2xl font-normal border-[1.5px] border-[#3b226e] rounded-r-full rounded-l-none outline-none"
                        >
                          Maybe
                        </button>
                      </div>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>
            )}

            {/* Dark Purple Chevron Arrow for scrolling down */}
            <div className="scroll-arrow-el mt-6 cursor-pointer" onClick={scrollToContent}>
              <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2L12 10L20 2" stroke="#3b226e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
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
        {/* Scrollable Floating Ornaments at the sides */}
        

        <div className="max-w-3xl w-full space-y-16 relative">

          {/* ══ SAVE THE DATE SECTION ══ */}
          <div className="std-section">

            {/* Blur orbs */}
            <div className="std-orb-1" />
            <div className="std-orb-2" />
            <div className="std-orb-3" />

            {/* deco1 — large floral corner, top-left */}
            <img src="/lavender-theme-assets/deco1.png"      alt="" className="std-fl-tl" />
            {/* deco-2 — small purple flower, top-right */}
            <img src="/lavender-theme-assets/deco-2.png"     alt="" className="std-fl-tr" />
            {/* deco8 — thin lavender stem, right vertical */}
            <img src="/lavender-theme-assets/deco8.png"      alt="" className="std-fl-stem-r" />
            {/* deco5 — bouquet, bottom-right */}
            <img src="/lavender-theme-assets/deco5.png"      alt="" className="std-fl-br-bouquet" />
            {/* deco4 — white rose over bouquet */}
            <img src="/lavender-theme-assets/deco4.png"      alt="" className="std-fl-br-rose" />
            {/* deco7 — small lavender flower, bottom-left */}
            <img src="/lavender-theme-assets/deco7.png"      alt="" className="std-fl-bl" />
            {/* deco3 — floating accent, top-center */}
            <img src="/lavender-theme-assets/deco3.png"      alt="" className="std-fl-float" />

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
                  <Calendar size={22} color="rgba(155,107,203,0.7)" />
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
                    <MapPin size={16} color="#9B6BCB" />
                    {event.location}
                  </p>
                )}

                {/* Leaf ornament SVG */}
                <div className="std-leaf-row">
                  <svg width="68" height="14" viewBox="0 0 68 14" fill="none">
                    <path d="M0 7 Q8 1 17 7 Q26 13 34 7 Q42 1 51 7 Q60 13 68 7" stroke="rgba(155,107,203,0.45)" strokeWidth="1.2" fill="none"/>
                    <circle cx="34" cy="7" r="2" fill="rgba(155,107,203,0.5)"/>
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
          <div className="os-section">

            {/* Background blur orbs */}
            <div className="os-bg-orb-1" />
            <div className="os-bg-orb-2" />
            <div className="os-bg-orb-3" />

            {/* deco-2 — small purple flower, top-right */}
            <img
              src="/lavender-theme-assets/deco-2.png"
              alt=""
              className="os-flower-tr"
            />

            {/* deco8 — thin lavender stem, right side vertical */}
            <img
              src="/lavender-theme-assets/deco8.png"
              alt=""
              className="os-flower-stem-r"
            />

            {/* deco5 — floral bouquet, bottom-right */}
            <img
              src="/lavender-theme-assets/deco5.png"
              alt=""
              className="os-flower-br-bouquet"
            />

            {/* deco4 — white rose over bouquet, bottom-right */}
            <img
              src="/lavender-theme-assets/deco4.png"
              alt=""
              className="os-flower-br-rose"
            />

            {/* deco7 — small lavender flower, bottom-left */}
            <img
              src="/lavender-theme-assets/deco7.png"
              alt=""
              className="os-flower-bl"
            />

            {/* deco3 — floating accent, top-center */}
            <img
              src="/lavender-theme-assets/deco3.png"
              alt=""
              className="os-flower-float"
            />

            {/* ── Content ── */}
            <div className="os-content">

              {/* Title */}
              <p className="os-title">Our Story</p>

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

              {/* Quote Card */}
              <div className="os-card">

                {/* Top wave ornament */}
                <svg className="os-wave" width="130" height="14" viewBox="0 0 130 14" fill="none">
                  <path
                    d="M0 7 Q16 1 32 7 Q48 13 65 7 Q82 1 98 7 Q114 13 130 7"
                    stroke="rgba(150,110,190,0.45)" strokeWidth="1.3" fill="none"
                  />
                  <circle cx="65" cy="7" r="2.5" fill="rgba(150,110,190,0.55)"/>
                  <circle cx="45" cy="7" r="1.5" fill="rgba(196,165,240,0.6)"/>
                  <circle cx="85" cy="7" r="1.5" fill="rgba(196,165,240,0.6)"/>
                </svg>

                {/* Large opening quote */}
                <span className="os-q-mark open">&ldquo;</span>

                {/* Quote text */}
                <p className="os-text">
                  {event.description || "Every love story is beautiful, but ours is my favorite."}
                </p>

                {/* Inner heart divider */}
                <div className="os-inner-divider">
                  <span className="os-inner-line" />
                  <span className="os-inner-heart">♥</span>
                  <span className="os-inner-line" />
                </div>

                {/* Large closing quote */}
                <span className="os-q-mark close">&rdquo;</span>

                {/* Bottom wave ornament */}
                <svg className="os-wave" width="130" height="14" viewBox="0 0 130 14" fill="none">
                  <path
                    d="M0 7 Q16 1 32 7 Q48 13 65 7 Q82 1 98 7 Q114 13 130 7"
                    stroke="rgba(150,110,190,0.45)" strokeWidth="1.3" fill="none"
                  />
                  <circle cx="65" cy="7" r="2.5" fill="rgba(150,110,190,0.55)"/>
                  <circle cx="45" cy="7" r="1.5" fill="rgba(196,165,240,0.6)"/>
                  <circle cx="85" cy="7" r="1.5" fill="rgba(196,165,240,0.6)"/>
                </svg>

              </div>{/* end .os-card */}
            </div>{/* end .os-content */}
          </div>{/* end .os-section */}

          {/* ══ AGENDA SECTION ══ */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="ag-section">

              {/* Blur orbs */}
              <div className="ag-orb-1" />
              <div className="ag-orb-2" />

              {/* deco1 — large floral corner, top-left */}
              <img src="/lavender-theme-assets/deco1.png"  alt="" className="ag-fl-tl" />
              {/* deco-2 — small purple flower, top-right */}
              <img src="/lavender-theme-assets/deco-2.png" alt="" className="ag-fl-tr" />
              {/* deco8 — lavender stem, right side */}
              <img src="/lavender-theme-assets/deco8.png"  alt="" className="ag-fl-stem-r" />
              {/* deco5 — bouquet, bottom-right */}
              <img src="/lavender-theme-assets/deco5.png"  alt="" className="ag-fl-br-bouquet" />
              {/* deco4 — white rose, over bouquet */}
              <img src="/lavender-theme-assets/deco4.png"  alt="" className="ag-fl-br-rose" />
              {/* deco7 — small flower, bottom-left */}
              <img src="/lavender-theme-assets/deco7.png"  alt="" className="ag-fl-bl" />
              {/* deco3 — small accent near timeline */}
              <img src="/lavender-theme-assets/deco3.png"  alt="" className="ag-fl-accent" />

              {/* Content */}
              <div className="ag-content">

                {/* Title */}
                <p className="ag-title">Agenda</p>

                {/* Divider */}
                <div className="ag-divider">
                  <div className="ag-div-line" />
                  <span className="ag-div-ornament">❧ ♥ ❦</span>
                  <div className="ag-div-line r" />
                </div>

                {/* Timeline */}
                <div className="ag-timeline">

                  {/* Vertical dashed line */}
                  <div className="ag-vline" />

                  {event.agenda.map((item: any, idx: number) => {
                    const isLeft  = idx % 2 === 0;
                    const desc    = item.description || "";
                    const descLow = desc.toLowerCase();

                    // Pick icon based on description keywords
                    let icon = (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                      </svg>
                    );
                    if (descLow.includes("ceremony") || descLow.includes("poruwa") || descLow.includes("wed")) {
                      icon = (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="14" r="4"/><circle cx="16" cy="10" r="4"/>
                          <path d="M15 6.5l1-1.5 1.5 1-1 2"/>
                        </svg>
                      );
                    } else if (descLow.includes("registr") || descLow.includes("check")) {
                      icon = (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <line x1="10" y1="9" x2="8" y2="9"/>
                        </svg>
                      );
                    } else if (descLow.includes("lunch") || descLow.includes("dinner") || descLow.includes("food") || descLow.includes("feast")) {
                      icon = (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                          <path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
                        </svg>
                      );
                    } else if (descLow.includes("exit") || descLow.includes("couple") || descLow.includes("send") || descLow.includes("depart")) {
                      icon = (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                      );
                    } else if (descLow.includes("dance") || descLow.includes("music") || descLow.includes("party")) {
                      icon = (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18V5l12-2v13"/>
                          <circle cx="6" cy="18" r="3"/>
                          <circle cx="18" cy="16" r="3"/>
                        </svg>
                      );
                    }

                    return (
                      <div key={idx} className={`ag-row ${isLeft ? "left" : "right"}`}>

                        {isLeft ? (
                          <>
                            <div className="ag-col-left">
                              <div className="ag-card">
                                <div className="ag-icon-circle">{icon}</div>
                                <div>
                                  <div className="ag-time">{item.time}</div>
                                  <div className="ag-time-sub">
                                    <span className="ag-ts-dot" />
                                    <span className="ag-ts-heart">♥</span>
                                    <span className="ag-ts-dot" />
                                  </div>
                                  <div className="ag-event-name">{desc}</div>
                                </div>
                                <span className="ag-card-leaf">🌿</span>
                              </div>
                            </div>
                            <div className="ag-dot-cell"><div className="ag-dot" /></div>
                            <div className="ag-col-empty" />
                          </>
                        ) : (
                          <>
                            <div className="ag-col-empty" />
                            <div className="ag-dot-cell"><div className="ag-dot" /></div>
                            <div className="ag-col-right">
                              <div className="ag-card">
                                <div className="ag-icon-circle">{icon}</div>
                                <div>
                                  <div className="ag-time">{item.time}</div>
                                  <div className="ag-time-sub">
                                    <span className="ag-ts-dot" />
                                    <span className="ag-ts-heart">♥</span>
                                    <span className="ag-ts-dot" />
                                  </div>
                                  <div className="ag-event-name">{desc}</div>
                                </div>
                                <span className="ag-card-leaf">🌿</span>
                              </div>
                            </div>
                          </>
                        )}

                      </div>
                    );
                  })}

                </div>{/* end ag-timeline */}
              </div>{/* end ag-content */}
            </div> /* end ag-section */
          )}

          {/* ══ PHOTO GALLERY SECTION ══ */}
          {event.slider_images && event.slider_images.length > 0 && (
            <div className="gal-section">
              {/* Blur orbs */}
              <div className="gal-orb-1" />
              <div className="gal-orb-2" />

              {/* Floral placements (deco1, deco5, deco4, deco2, deco8, deco7, deco3) */}
              <img src="/lavender-theme-assets/deco1.png"  alt="" className="gal-fl-tl" />
              <img src="/lavender-theme-assets/deco-2.png" alt="" className="gal-fl-tr" />
              <img src="/lavender-theme-assets/deco8.png"  alt="" className="gal-fl-stem-r" />
              <img src="/lavender-theme-assets/deco5.png"  alt="" className="gal-fl-br-bouquet" />
              <img src="/lavender-theme-assets/deco4.png"  alt="" className="gal-fl-br-rose" />
              <img src="/lavender-theme-assets/deco7.png"  alt="" className="gal-fl-bl" />
              <img src="/lavender-theme-assets/deco3.png"  alt="" className="gal-fl-accent" />

              <div className="gal-content">
                {/* Title */}
                <p className="gal-title">Gallery</p>

                {/* Divider */}
                <div className="gal-divider">
                  <div className="gal-div-line" />
                  <span className="gal-div-ornament">❧ ♥ ❦</span>
                  <div className="gal-div-line r" />
                </div>

                {/* Carousel Card */}
                <div className="gal-carousel-card">
                  <div className="gal-slider">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={galleryIndex}
                        src={event.slider_images[galleryIndex]}
                        alt={`Gallery Image ${galleryIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="gal-slide-img"
                        onClick={() => setLightboxIndex(galleryIndex)}
                      />
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    {event.slider_images.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="gal-nav-btn prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGalleryIndex((prev) => (prev - 1 + event.slider_images.length) % event.slider_images.length);
                          }}
                          aria-label="Previous image"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="gal-nav-btn next"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGalleryIndex((prev) => (prev + 1) % event.slider_images.length);
                          }}
                          aria-label="Next image"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Indicator Dots */}
                  {event.slider_images.length > 1 && (
                    <div className="gal-indicator-dots">
                      {event.slider_images.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          className={`gal-dot ${galleryIndex === idx ? "active" : ""}`}
                          onClick={() => setGalleryIndex(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ THANK YOU SECTION ══ */}
          <div className="ty-section">
            {/* Blur orb */}
            <div className="ty-orb" />

            {/* Floral placements (deco1, deco5, deco4, deco2, deco7) */}
            <img src="/lavender-theme-assets/deco1.png"  alt="" className="ty-fl-tl" />
            <img src="/lavender-theme-assets/deco-2.png" alt="" className="ty-fl-tr" />
            <img src="/lavender-theme-assets/deco5.png"  alt="" className="ty-fl-br-bouquet" />
            <img src="/lavender-theme-assets/deco4.png"  alt="" className="ty-fl-br-rose" />
            <img src="/lavender-theme-assets/deco7.png"  alt="" className="ty-fl-bl" />

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
                Your presence on our special day would mean the world to us. Thank you for being a part of our love story and celebrating these unforgettable moments with us.
              </p>

              {/* Couple names */}
              <p className="ty-names">{brideName} & {groomName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <footer className="w-full bg-[#3b226e]/95 backdrop-blur-md text-purple-200 py-8 px-4 text-center mt-auto border-t border-purple-950/20 z-10 relative">
        <div className="max-w-md mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-purple-300">{brideName} & {groomName}</p>
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
              className="absolute top-4 right-4 text-white hover:text-purple-300 transition-colors z-50 p-2 bg-black/40 rounded-full hover:bg-black/60"
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
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-purple-300 transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-purple-300 transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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

export default LavenderLayout;

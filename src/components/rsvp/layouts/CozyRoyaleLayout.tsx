"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, Clock, Volume2, VolumeX, X } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CozyRoyaleLayoutProps {
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

const CozyRoyaleLayout: React.FC<CozyRoyaleLayoutProps> = ({
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
  const showMaybeButton = event?.show_maybe_button !== false;
  
  const detailsRef = useRef<HTMLDivElement>(null);
  const openerVideoRef = useRef<HTMLVideoElement>(null);
  const [isOpenerVideoPlaying, setIsOpenerVideoPlaying] = useState(false);

  const triggerConfettiAndMusic = () => {
    if (!isPlaying) toggleMusic();
    if (audioRef?.current) {
      audioRef.current.play().catch(console.error);
    }
    try {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        // Confetti using sage and gold
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#C9D4C4', '#C9A88A', '#C4A574', '#7D8E76', '#F7F6F1']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#C9D4C4', '#C9A88A', '#C4A574', '#7D8E76', '#F7F6F1']
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

  const finishOpener = () => {
    triggerConfettiAndMusic();
    setIsOpened(true);
  };

  const startOpenerVideo = () => {
    const video = openerVideoRef.current;
    if (!video) return;
    const playPromise = video.play();
    setIsOpenerVideoPlaying(true);
    if (playPromise) {
      playPromise.catch(() => {
        setIsOpenerVideoPlaying(false);
      });
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
      <div className="flex items-center justify-center min-h-screen bg-[#F7F6F1]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-10 h-10 text-[#C4A574] animate-pulse" />
          </motion.div>
          <p className="text-[#2F3D32] font-semibold animate-pulse">Loading Invitation...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F6F1] p-6">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-[#C9D4C4]/20">
          <p className="text-red-600 font-bold text-lg">Event Not Found</p>
          <p className="text-gray-500 text-sm mt-2">The invitation link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const brideName = event.bride_name || "Bride";
  const groomName = event.groom_name || "Groom";
  const eventDate = event.date ? new Date(event.date) : new Date();
  const firstLetter = (name: string) => {
    const match = name.trim().match(/[A-Za-z]/);
    return (match ? match[0] : name.trim().charAt(0) || "A").toUpperCase();
  };
  const brideInitial = firstLetter(brideName);
  const groomInitial = firstLetter(groomName);

  const FloralRule = () => (
    <div className="cr-rule" aria-hidden="true">
      <span />
      <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
        <path d="M13 14c0-5-5-7-7.2-5.2 2.2.2 4.4 2 7.2 5.2Z" fill="#C6A15A" />
        <path d="M13 14c0-5 5-7 7.2-5.2-2.2.2-4.4 2-7.2 5.2Z" fill="#D7B56C" />
        <path d="M13 13.2c0-3.4-2.6-5.2-3.8-4.2 1.2.4 2.4 1.8 3.8 4.2Z" fill="#E8D09A" />
        <circle cx="13" cy="5.2" r="1.35" fill="#C6A15A" />
      </svg>
      <span />
    </div>
  );

  const PortraitSprig = () => (
    <svg viewBox="0 0 90 160" fill="none" aria-hidden="true">
      <path d="M78 16c-18 24-30 52-38 84-6 22-12 40-18 52" stroke="#8E9E90" strokeWidth="1.2" />
      <ellipse cx="60" cy="42" rx="14" ry="6" transform="rotate(-42 60 42)" fill="#A7B7A0" />
      <ellipse cx="48" cy="70" rx="13" ry="5.5" transform="rotate(-18 48 70)" fill="#8E9E90" />
      <ellipse cx="42" cy="98" rx="12" ry="5" transform="rotate(12 42 98)" fill="#A3B5A0" />
      <ellipse cx="34" cy="124" rx="11" ry="4.8" transform="rotate(28 34 124)" fill="#9AAB96" />
      <circle cx="28" cy="146" r="4.2" fill="#8E9E90" />
    </svg>
  );

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
            colors: ['#C9D4C4', '#C9A88A', '#C4A574', '#5C6E58', '#2A382C']
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3D32" strokeWidth="1.5" className="w-6 h-6">
          <circle cx="8" cy="14" r="4.5" />
          <circle cx="16" cy="10" r="4.5" />
          <path d="M15 6.5l1-1.5 1.5 1-1 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    if (text.includes("reception") || text.includes("cocktail") || text.includes("party") || text.includes("cheers")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M8 22h8M10 17v5M14 17v5" />
          <path d="M10 7a3 3 0 0 0-3 3v7h6v-7a3 3 0 0 0-3-3z" fill="#2F3D32" fillOpacity="0.1" />
          <path d="M14 7a3 3 0 0 1 3 3v7h-6v-7a3 3 0 0 1 3-3z" fill="#2F3D32" fillOpacity="0.1" />
          <path d="M11 6a2 2 0 0 1 2 0" />
        </svg>
      );
    }
    
    if (text.includes("dinner") || text.includes("food") || text.includes("feast") || text.includes("eat") || text.includes("lunch")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="5" fill="#2F3D32" fillOpacity="0.1" />
          <path d="M5 4v9a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4M7 4v4M17 4v14M19 4h-4v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4" />
        </svg>
      );
    }
    
    if (text.includes("dance") || text.includes("dancing") || text.includes("music") || text.includes("dj") || text.includes("song")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" fill="#2F3D32" fillOpacity="0.1" />
          <circle cx="18" cy="16" r="3" fill="#2F3D32" fillOpacity="0.1" />
        </svg>
      );
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#2F3D32" fillOpacity="0.1" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen text-[#2F3D32] relative overflow-x-hidden flex flex-col items-center w-full cozy-royale-root">
      
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

      {!isOpened && (
        <div className="fixed inset-0 z-[80] bg-black">
          <video
            ref={openerVideoRef}
            src="/cozy-royale-theme-assets/openner.mp4"
            poster="/cozy-royale-theme-assets/thumb.jpg"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            playsInline
            preload="none"
            onEnded={finishOpener}
          />
          {!isOpenerVideoPlaying && (
            <button
              type="button"
              onClick={startOpenerVideo}
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
              aria-label="Tap to open invitation"
            >
              <span className="cr-opener-seal block w-44 sm:w-56">
                <img
                  src="/cozy-royale-theme-assets/opnerlogo.png"
                  alt=""
                  className="h-auto w-full drop-shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
                />
                <span className="cr-opener-monogram" aria-hidden="true">
                  <span className="cr-opener-letter">{brideInitial}</span>
                  <span className="cr-opener-amp">&amp;</span>
                  <span className="cr-opener-letter">{groomInitial}</span>
                </span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Import elegant fonts for wedding theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Courier+Prime&family=Great+Vibes&display=swap');

        .cr-opener-seal {
          position: relative;
          display: block;
        }
        .cr-opener-monogram {
          position: absolute;
          left: 50%;
          top: 57%;
          transform: translate(-50%, -50%);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          width: 68%;
          pointer-events: none;
          color: #5C4524;
        }
        .cr-opener-letter {
          font-family: 'Great Vibes', cursive;
          font-size: 36px;
          line-height: 1;
          text-align: center;
        }
        .cr-opener-letter:first-child { justify-self: end; }
        .cr-opener-letter:last-child { justify-self: start; }
        .cr-opener-amp {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 22px;
          line-height: 1;
          justify-self: center;
          padding: 0 2px;
        }
        @media (min-width: 640px) {
          .cr-opener-letter { font-size: 42px; }
          .cr-opener-amp { font-size: 26px; }
        }

        .cozy-royale-root {
          background: radial-gradient(circle at center, #F7F6F1 0%, #E4E6D8 100%) fixed;
          font-family: 'Inter', sans-serif;
        }
        .cr-hero-inner {
          width: min(440px, 100%);
          min-height: 100dvh;
          margin-left: auto;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #3E4F40;
        }
        .cr-title-veil {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 10px 8px 2px;
        }
        .cr-kicker {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(26px, 6.4vw, 34px);
          letter-spacing: 0.01em;
          color: #4A5C48;
          line-height: 1;
          -webkit-text-stroke: 2px rgba(255, 252, 248, 0.92);
          paint-order: stroke fill;
          text-shadow:
            0 0 2px rgba(255, 252, 248, 1),
            0 0 8px rgba(255, 250, 244, 0.95),
            0 0 14px rgba(255, 246, 236, 0.85);
        }
        .cr-names {
          margin-top: 8px;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: clamp(36px, 10vw, 54px);
          line-height: 0.9;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #3E4F40;
          display: flex;
          flex-direction: column;
          align-items: center;
          -webkit-text-stroke: 3px rgba(255, 252, 248, 0.92);
          paint-order: stroke fill;
          text-shadow:
            0 0 2px rgba(255, 252, 248, 1),
            0 0 8px rgba(255, 250, 244, 0.95),
            0 0 16px rgba(255, 246, 236, 0.88);
        }
        .cr-amp {
          font-family: 'Great Vibes', cursive;
          font-size: 58px;
          letter-spacing: 0;
          text-transform: none;
          font-weight: 400;
          color: #C6A15A;
          line-height: 0.55;
          margin: 18px 0 8px;
          -webkit-text-stroke: 2px rgba(255, 250, 242, 0.9);
          paint-order: stroke fill;
          text-shadow:
            0 0 2px rgba(255, 252, 248, 1),
            0 0 8px rgba(255, 236, 204, 0.95),
            0 0 16px rgba(255, 246, 230, 0.85);
        }
        .cr-rule {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: min(210px, 62vw);
          margin-top: 14px;
        }
        .cr-rule span {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C6A15A 20%, #C6A15A 80%, transparent);
        }
        .cr-date {
          margin-top: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: #3E4F40;
        }
        .cr-portrait-wrap {
          position: relative;
          margin: 16px 0 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cr-portrait {
          position: relative;
          width: min(186px, 48vw);
          aspect-ratio: 1;
          z-index: 1;
        }
        .cr-portrait::before,
        .cr-portrait::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid #C6A15A;
          pointer-events: none;
        }
        .cr-portrait::before { inset: -9px; }
        .cr-portrait::after { inset: -4px; }
        .cr-portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          border-radius: 50%;
          border: 3px solid #F6EFE6;
        }
        .cr-sprig {
          position: absolute;
          width: 72px;
          height: 118px;
          z-index: 2;
          pointer-events: none;
        }
        .cr-sprig svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .cr-sprig-left { left: -28px; bottom: 8px; }
        .cr-sprig-right { right: -28px; top: 6px; transform: scaleX(-1); }
        .cr-rsvp {
          width: min(340px, 100%);
          background: none;
          border: none;
          box-shadow: none;
        }
        .cr-greet {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(36px, 9vw, 46px);
          line-height: 1;
          color: #4A5C48;
          font-weight: 400;
        }
        .cr-ask {
          margin-top: 8px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #3E4F40;
        }
        .cr-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 16px;
        }
        .cr-choice {
          min-width: 104px;
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1.5px solid #C6A15A;
          background: rgba(255, 250, 245, 0.35);
          color: #3E4F40;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .cr-choice.is-on {
          background: #4A5C48;
          border-color: #4A5C48;
          color: #F7F6F1;
        }
        .cr-choice:disabled { opacity: 0.55; }
        .cr-field {
          width: min(260px, 80vw);
          height: 44px;
          margin-top: 14px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1.5px solid #C6A15A;
          background: rgba(255, 250, 245, 0.45);
          color: #3E4F40;
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          outline: none;
        }
        .cr-field::placeholder { color: #B7A394; }
        .cr-verify {
          min-width: 140px;
          height: 44px;
          margin-top: 12px;
          padding: 0 22px;
          border-radius: 999px;
          border: 1.5px solid #C6A15A;
          background: rgba(255, 250, 245, 0.35);
          color: #3E4F40;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .cr-note {
          margin-top: 8px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 16px;
          color: #4A5C48;
        }
        .cr-scroll-dock {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 100dvh;
          width: 100%;
          margin-bottom: -100dvh;
          pointer-events: none;
        }
        .cr-scroll {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          width: max-content;
          margin:-5px auto;
          padding: 8px 26px 6px;
          border: none;
          
          color: #4A5C48;
          cursor: pointer;
          pointer-events: auto;
          animation: bounce-el 2s infinite;
        }
        .cr-scroll-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          line-height: 1;
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
          box-shadow: 0 10px 40px rgba(47, 61, 50, 0.04);
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
        /* Section corner placement */
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
          color: #5C6E58;
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
          background: linear-gradient(to right, transparent, #C9D4C4);
          flex-grow: 1;
        }
        .std-div-line.r {
          background: linear-gradient(to left, transparent, #C9D4C4);
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
          background: #C9A88A;
        }
        .std-heart-sym {
          font-size: 14px;
          color: #C4A574;
        }
        
        .std-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(148, 177, 158, 0.2);
          border-radius: 24px;
          padding: 36px 24px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 6px 20px rgba(74, 28, 42, 0.02);
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
          color: #2F3D32;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .std-mini-heart {
          color: #C9D4C4;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .std-location {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #7D8E76;
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
          background: #5C6E58;
          color: #F7F6F1;
          border-radius: 99px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          border: 1px solid #2F3D32;
          box-shadow: 0 4px 10px rgba(74, 28, 42, 0.15);
        }
        .std-cal-btn:hover {
          background: #2A382C;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(74, 28, 42, 0.25);
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
          box-shadow: 0 4px 12px rgba(74, 28, 42, 0.01);
        }
        .std-cd-num {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #2A382C;
          line-height: 1.1;
        }
        .std-cd-heart {
          color: #C9D4C4;
          font-size: 8px;
          margin: 3px 0;
        }
        .std-cd-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #C9A88A;
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
          box-shadow: 0 10px 40px rgba(47, 61, 50, 0.04);
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
          color: #5C6E58;
          line-height: 1;
          margin-bottom: 8px;
        }
        .os-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 2px;
          color: #C9A88A;
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
          background: linear-gradient(to right, transparent, #C9D4C4);
          flex-grow: 1;
        }
        .os-divider-line.right {
          background: linear-gradient(to left, transparent, #C9D4C4);
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
          background: #C9A88A;
        }
        .os-heart-symbol {
          font-size: 14px;
          color: #C4A574;
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
          background: linear-gradient(to bottom, #C9D4C4 0%, rgba(148, 177, 158, 0.2) 100%);
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
          background: #F7F6F1;
          border: 2px solid #C4A574;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5C6E58;
          font-size: 10px;
          box-shadow: 0 2px 6px rgba(74, 28, 42, 0.1);
          z-index: 10;
        }
        .os-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(148, 177, 158, 0.25);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(74, 28, 42, 0.015);
          transition: all 0.3s ease;
        }
        .os-card:hover {
          transform: translateX(4px);
          border-color: rgba(148, 177, 158, 0.4);
          box-shadow: 0 6px 20px rgba(74, 28, 42, 0.04);
        }
        .os-date {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          color: #C9A88A;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: block;
          margin-bottom: 4px;
        }
        .os-h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #2F3D32;
          margin-bottom: 8px;
        }
        .os-desc {
          font-size: 13.5px;
          color: #7D8E76;
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
          box-shadow: 0 10px 40px rgba(47, 61, 50, 0.04);
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
          color: #5C6E58;
          line-height: 1;
          margin-bottom: 8px;
        }
        .ag-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 2px;
          color: #C9A88A;
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
          box-shadow: 0 4px 15px rgba(74, 28, 42, 0.01);
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
          box-shadow: 0 8px 25px rgba(74, 28, 42, 0.05);
        }
        
        .ag-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #F6F5F0;
          color: #5C6E58;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(148, 177, 158, 0.3);
          box-shadow: 0 2px 10px rgba(74, 28, 42, 0.02);
        }
        .ag-time {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          color: #C9A88A;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .ag-h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #2F3D32;
          margin-bottom: 12px;
        }
        .ag-desc {
          font-size: 13px;
          color: #7D8E76;
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 240px;
        }
        .ag-loc {
          font-size: 12.5px;
          font-weight: 600;
          color: #5C6E58;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: auto;
        }
        .ag-loc a {
          color: #C4A574;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .ag-loc a:hover {
          color: #2A382C;
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
          box-shadow: 0 10px 40px rgba(47, 61, 50, 0.04);
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
          color: #5C6E58;
          line-height: 1;
          margin-bottom: 8px;
        }
        .gal-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 2px;
          color: #C9A88A;
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
          box-shadow: 0 10px 30px rgba(74, 28, 42, 0.08);
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
          color: #2F3D32;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(74, 28, 42, 0.1);
          z-index: 10;
          transition: all 0.2s;
        }
        .gal-arrow:hover {
          background: #ffffff;
          color: #5C6E58;
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
          background: #5C6E58;
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
          box-shadow: 0 10px 40px rgba(47, 61, 50, 0.04);
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
          color: #5C6E58;
          line-height: 1;
          margin-bottom: 8px;
        }
        .ty-msg {
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          color: #7D8E76;
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
          color: #2F3D32;
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
          className="fixed top-4 right-4 z-40 p-2.5 rounded-full bg-[#F7F6F1]/75 hover:bg-[#F7F6F1] shadow-md border border-[#C4A574]/50 text-[#6B7A64] backdrop-blur-sm transition-all"
          aria-label="Toggle music"
        >
          {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse text-[#5C6E58]" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}

      {/* Hero */}
      <div className="cr-hero relative min-h-[100dvh] w-full bg-[#F3F1E8]">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src="/cozy-royale-theme-assets/background.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="cr-scroll-dock">
          <button type="button" className="cr-scroll" onClick={scrollToContent} aria-label="See the rest of the invitation">
            <span className="cr-scroll-label">Scroll</span>
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
              <path d="M6 4.5 14 11l8-6.5" stroke="#4A5C48" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 11.5 14 18l8-6.5" stroke="#4A5C48" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </svg>
          </button>
        </div>
        <div className="cr-hero-inner relative z-10 px-5 pb-16 pt-8">
          <div className="cr-title-veil">
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="cr-kicker"
            >
              The Wedding of
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="cr-names"
            >
              <span>{brideName}</span>
              <span className="cr-amp">&amp;</span>
              <span>{groomName}</span>
            </motion.h1>

            <FloralRule />
          </div>

          {event.date ? (
            <p className="cr-date">
              {eventDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.15 }}
            className="cr-portrait-wrap"
          >
            <span className="cr-sprig cr-sprig-left"><PortraitSprig /></span>
            <div className="cr-portrait">
              <img
                src={event.image_url || "/assets/placeholder-couple.jpg"}
                alt={`${brideName} and ${groomName}`}
              />
            </div>
            <span className="cr-sprig cr-sprig-right"><PortraitSprig /></span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="cr-rsvp"
          >
            {!isVerified ? (
              <>
                <p className="cr-greet">Your invitation</p>
                <p className="cr-ask">Verify to reply</p>
                <input
                  type="text"
                  placeholder="WhatsApp number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="cr-field"
                />
                <button type="button" onClick={() => verifyAttendee()} className="cr-verify">
                  Verify
                </button>
              </>
            ) : (
              <>
                <p className="cr-greet">
                  {rsvpSubmittedMsg ? "Thank you" : `Dear ${attendee?.name || "Guest"}`}
                </p>
                <p className="cr-ask">{rsvpSubmittedMsg ? "Your reply is saved" : "Will you join us?"}</p>
                {rsvpSubmittedMsg ? <p className="cr-note">{rsvpSubmittedMsg}</p> : null}
                <div className="cr-actions">
                  <button
                    type="button"
                    onClick={() => handleRSVP("yes")}
                    disabled={isSubmittingRSVP || !event?.is_active}
                    className={`cr-choice ${attendee?.response === "yes" ? "is-on" : ""}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRSVP("no")}
                    disabled={isSubmittingRSVP || !event?.is_active}
                    className={`cr-choice ${attendee?.response === "no" ? "is-on" : ""}`}
                  >
                    No
                  </button>
                  {showMaybeButton && (
                    <button
                      type="button"
                      onClick={() => handleRSVP("maybe")}
                      disabled={isSubmittingRSVP || !event?.is_active}
                      className={`cr-choice ${attendee?.response === "maybe" ? "is-on" : ""}`}
                    >
                      Maybe
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>

          <FloralRule />
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

            {/* ── Content ── */}
            <div className="std-content">

              {/* Title decoration */}

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
                  <Calendar size={22} color="#C9A88A" />
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
                {(event.location || event.location_url) && (
                  <div className="flex flex-col items-center w-full" style={{ marginBottom: '20px' }}>
                    {event.location && (
                      <p className="std-location" style={{ marginBottom: event.location_url ? '10px' : '0' }}>
                        <MapPin size={16} color="#C4A574" />
                        {event.location}
                      </p>
                    )}
                    {event.location_url && (
                      <a
                        href={event.location_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#C4A574]/15 hover:bg-[#C4A574]/25 border border-[#C4A574]/30 transition-all text-xs font-semibold text-[#2E4A37] hover:text-[#1E3325] shadow-sm"
                      >
                        <MapPin size={12} />
                        View Map
                      </a>
                    )}
                  </div>
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
                    const title = encodeURIComponent(`${event.bride_name || ""} & ${event.groom_name || ""} Wedding`);
                    const start = eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
                    const locationParam = event.location ? `&location=${encodeURIComponent(event.location)}` : "";
                    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}&details=Wedding+Invitation${locationParam}`, "_blank");
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

              {/* Story */}

              <div className="os-header">
                {/* Title ornament */}
                <p className="os-title">Our Story</p>
                <p className="os-subtitle">A Journey of Love</p>

                {/* Heart Divider */}
                <div className="os-title-divider">
                  <div className="os-divider-line" />
                  <div className="os-divider-heart">
                    <span className="os-divider-dot" />
                    <span className="os-heart-symbol" style={{ color: "#5C6E58" }}>♥</span>
                    <span className="os-divider-dot" />
                  </div>
                  <div className="os-divider-line right" />
                </div>
              </div>

              {/* Story content */}
              <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="os-card" style={{ textAlign: "center", fontStyle: "italic", fontSize: "16px", lineHeight: "1.8", color: "#2d4436", background: "rgba(255, 255, 255, 0.6)", borderRadius: "24px", border: "1px solid rgba(148, 177, 158, 0.25)", padding: "28px" }}>
                  <span style={{ display: "block", fontSize: "40px", color: "#C9A88A", fontFamily: "Playfair Display, serif", lineHeight: "1", marginBottom: "-10px" }}>&ldquo;</span>
                  <p className="os-desc" style={{ fontSize: "clamp(15px, 2.5vw, 18px)", fontFamily: "Cormorant Garamond, serif", color: "#2d4436" }}>
                    {event.description}
                  </p>
                  <span style={{ display: "block", fontSize: "40px", color: "#C9A88A", fontFamily: "Playfair Display, serif", lineHeight: "1", marginTop: "10px" }}>&rdquo;</span>
                </div>
              </div>
            </div>
          )} {/* end .os-section */}

          {/* ══ AGENDA SECTION ══ */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="ag-section">
              {/* Corner Ornaments */}

              <div className="ag-header">
                {/* Title Ornament */}
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
                  </div>
                ))}
              </div>
            </div> /* end ag-section */
          )}

          {/* ══ PHOTO GALLERY SECTION ══ */}
          {event.slider_images && event.slider_images.length > 0 && (
            <div className="gal-section">
              {/* Corner Ornaments */}

              <div className="gal-header">
                {/* Title Ornament */}
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

            {/* Thank you */}

            <div className="ty-content">
              {/* Title Ornament */}

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
      <footer className="w-full bg-[#2F3D32]/95 backdrop-blur-md text-[#F7F6F1] py-8 px-4 text-center mt-auto border-t border-[#2F3D32]/20 z-10 relative">
        <div className="max-w-md mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C9D4C4]">{brideName} & {groomName}</p>
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
              className="absolute top-4 right-4 text-white hover:text-[#C9D4C4] transition-colors z-50 p-2 bg-black/40 rounded-full hover:bg-black/60"
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
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-[#C9D4C4] transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-[#C9D4C4] transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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

export default CozyRoyaleLayout;

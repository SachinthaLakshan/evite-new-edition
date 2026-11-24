"use client";

import "./BlushGardenRomanceLayout.css";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, Clock, Volume2, VolumeX, X, Leaf } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InviteGiftSection } from "../InviteGiftSection";
import { OpenRsvpSection } from "../OpenRsvp";

interface BlushGardenRomanceLayoutProps {
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

const BlushGardenRomanceLayout: React.FC<BlushGardenRomanceLayoutProps> = ({
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const showMaybeButton = event?.show_maybe_button !== false;
  
  const detailsRef = useRef<HTMLDivElement>(null);
  const openerVideoRef = useRef<HTMLVideoElement>(null);
  const petalCanvasRef = useRef<HTMLCanvasElement>(null);
  const invitePetalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpenerVideoPlaying, setIsOpenerVideoPlaying] = useState(false);

  const startPetalFall = (canvas: HTMLCanvasElement) => {
    const fire = confetti.create(canvas, { resize: true, useWorker: false });
    const petal = confetti.shapeFromPath({
      path: "M0 0 C5 1.2 8.5 8 0 17 C-8.5 8 -5 1.2 0 0",
    });
    const colors = ["#F7D2CE", "#E7A8B0", "#F4D7C6", "#E8B89A", "#F8E7E3", "#D98996", "#F2C4B8"];
    const id = window.setInterval(() => {
      fire({
        particleCount: 2,
        angle: 270,
        spread: 90,
        startVelocity: 4,
        gravity: 0.32,
        drift: Math.random() * 0.9 - 0.45,
        ticks: 420,
        scalar: 0.7 + Math.random() * 0.55,
        origin: { x: Math.random(), y: -0.04 },
        colors,
        shapes: [petal],
        flat: false,
        disableForReducedMotion: true,
      });
    }, 240);

    return () => {
      window.clearInterval(id);
      fire.reset();
    };
  };

  useEffect(() => {
    if (isOpened || isOpenerVideoPlaying) return;
    const canvas = petalCanvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return startPetalFall(canvas);
  }, [isOpened, isOpenerVideoPlaying]);

  useEffect(() => {
    if (!isOpened) return;
    const canvas = invitePetalCanvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return startPetalFall(canvas);
  }, [isOpened]);

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
          colors: ['#F0D0CB', '#E8B4A8', '#C4A574', '#8A6A62', '#FBF6F1']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F0D0CB', '#E8B4A8', '#C4A574', '#8A6A62', '#FBF6F1']
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
    video.play().catch(() => {
      setIsOpenerVideoPlaying(false);
    });
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
      <div className="flex items-center justify-center min-h-screen bg-[#FBF6F1]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-10 h-10 text-[#C4A574] animate-pulse" />
          </motion.div>
          <p className="text-[#243E38] font-semibold animate-pulse">Loading Invitation...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBF6F1] p-6">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-[#F0D0CB]/20">
          <p className="text-red-600 font-bold text-lg">Event Not Found</p>
          <p className="text-gray-500 text-sm mt-2">The invitation link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const brideName = event.bride_name || "Bride";
  const groomName = event.groom_name || "Groom";
  const eventDate = event.date ? new Date(event.date) : new Date();
  const formatInvitationDate = (date: Date) => {
    const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
    const month = date.toLocaleDateString("en-GB", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    const mod100 = day % 100;
    const suffix =
      mod100 >= 11 && mod100 <= 13 ? "th" : ["th", "st", "nd", "rd"][day % 10] || "th";
    return `${weekday}, ${day}${suffix} ${month} ${year}`;
  };
  const dateMonth = eventDate.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const dateDay = String(eventDate.getDate());
  const dateYear = String(eventDate.getFullYear());
  const countdownParts = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

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
      <path d="M78 16c-18 24-30 52-38 84-6 22-12 40-18 52" stroke="#C4898C" strokeWidth="1.2" />
      <ellipse cx="60" cy="42" rx="14" ry="6" transform="rotate(-42 60 42)" fill="#E8C4C0" />
      <ellipse cx="48" cy="70" rx="13" ry="5.5" transform="rotate(-18 48 70)" fill="#C4898C" />
      <ellipse cx="42" cy="98" rx="12" ry="5" transform="rotate(12 42 98)" fill="#E7B7B4" />
      <ellipse cx="34" cy="124" rx="11" ry="4.8" transform="rotate(28 34 124)" fill="#D9A3A0" />
      <circle cx="28" cy="146" r="4.2" fill="#C4898C" />
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
            colors: ['#F0D0CB', '#E8B4A8', '#C4A574', '#3E6B5A', '#2A3C36']
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#243E38" strokeWidth="1.5" className="w-6 h-6">
          <circle cx="8" cy="14" r="4.5" />
          <circle cx="16" cy="10" r="4.5" />
          <path d="M15 6.5l1-1.5 1.5 1-1 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    if (text.includes("reception") || text.includes("cocktail") || text.includes("party") || text.includes("cheers")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#243E38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M8 22h8M10 17v5M14 17v5" />
          <path d="M10 7a3 3 0 0 0-3 3v7h6v-7a3 3 0 0 0-3-3z" fill="#243E38" fillOpacity="0.1" />
          <path d="M14 7a3 3 0 0 1 3 3v7h-6v-7a3 3 0 0 1 3-3z" fill="#243E38" fillOpacity="0.1" />
          <path d="M11 6a2 2 0 0 1 2 0" />
        </svg>
      );
    }
    
    if (text.includes("dinner") || text.includes("food") || text.includes("feast") || text.includes("eat") || text.includes("lunch")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#243E38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="5" fill="#243E38" fillOpacity="0.1" />
          <path d="M5 4v9a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4M7 4v4M17 4v14M19 4h-4v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4" />
        </svg>
      );
    }
    
    if (text.includes("dance") || text.includes("dancing") || text.includes("music") || text.includes("dj") || text.includes("song")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#243E38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" fill="#243E38" fillOpacity="0.1" />
          <circle cx="18" cy="16" r="3" fill="#243E38" fillOpacity="0.1" />
        </svg>
      );
    }
    
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#243E38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#243E38" fillOpacity="0.1" />
      </svg>
    );
  };

  const galleryPhotos: string[] = Array.isArray(event?.slider_images) ? event.slider_images : [];
  const galleryGroups: string[][] = [];
  for (let photoStart = 0; photoStart < galleryPhotos.length; photoStart += 6) {
    galleryGroups.push(galleryPhotos.slice(photoStart, photoStart + 6));
  }

  return (
    <div className="min-h-screen text-[#243E38] relative overflow-x-hidden flex flex-col items-center w-full blush-garden-root">
      <div className="bgr-invite-bg" aria-hidden="true">
        <img
          src="/blush-garden-romance-assets/opener-back.jpeg"
          alt=""
          className="bgr-invite-back"
        />
        <div className="bgr-invite-mandala">
          <img
            src="/blush-garden-romance-assets/top-round-design.png"
            alt=""
            className="bgr-mandala"
          />
        </div>
        <canvas ref={invitePetalCanvasRef} className="bgr-petals" aria-hidden="true" />
      </div>

      {/* ══ PENDING ACTIVATION BANNER ══ */}
      {!event?.is_active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-red-700/95 backdrop-blur-sm text-white py-6 px-8 rounded-2xl shadow-2xl text-center font-medium flex flex-col items-center gap-4 max-w-md pointer-events-auto border border-white/20">
            <div className="bg-white/20 p-3 rounded-full">
              <X className="h-8 w-8 text-white" />
            </div>
            <span className="text-lg">This event is currently pending activation and cannot receive RSVP responses.</span>
            <span className="text-lg">To activate your event for sharing, please contact us on WhatsApp (0716561975).</span>
          </div>
        </div>
      )}

      {!isOpened && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#F6EBE4]">
          <video
            ref={openerVideoRef}
            src="/blush-garden-romance-assets/open-video.mp4"
            className={`pointer-events-none absolute inset-0 z-30 h-full w-full bg-black object-cover ${
              isOpenerVideoPlaying ? "opacity-100" : "opacity-0"
            }`}
            playsInline
            preload="auto"
            onPlaying={() => setIsOpenerVideoPlaying(true)}
            onEnded={finishOpener}
          />
          {!isOpenerVideoPlaying && (
            <div className="bgr-opener">
              <img
                src="/blush-garden-romance-assets/opener-back.jpeg"
                alt=""
                className="bgr-opener-back"
              />
              <div className="bgr-mandala-slot" aria-hidden="true">
                <img
                  src="/blush-garden-romance-assets/top-round-design.png"
                  alt=""
                  className="bgr-mandala"
                />
              </div>
              <canvas ref={petalCanvasRef} className="bgr-petals" aria-hidden="true" />
              <div className="bgr-opener-copy">
                <p className="bgr-kicker">The Wedding of</p>
                <span className="bgr-diamond" aria-hidden="true" />
                <h1 className="bgr-names">
                  {brideName} <span>&amp;</span> {groomName}
                </h1>
                {event.date ? <p className="bgr-date">{formatInvitationDate(eventDate)}</p> : null}
                <button type="button" className="bgr-open-btn" onClick={startOpenerVideo}>
                  <Leaf className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  Open Invitation
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Great+Vibes&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
      />

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
          className="fixed top-4 right-4 z-40 p-2.5 rounded-full bg-[#FBF6F1]/75 hover:bg-[#FBF6F1] shadow-md border border-[#C4A574]/50 text-[#6E564C] backdrop-blur-sm transition-all"
          aria-label="Toggle music"
        >
          {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse text-[#3E6B5A]" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}

      {/* Hero */}
      <div className="cr-hero relative z-10 min-h-[100dvh] w-full">
        <div className="cr-scroll-dock">
          <button type="button" className="cr-scroll" onClick={scrollToContent} aria-label="See the rest of the invitation">
            <span className="cr-scroll-label">Scroll</span>
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
              <path d="M6 4.5 14 11l8-6.5" stroke="#2C564C" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 11.5 14 18l8-6.5" stroke="#2C564C" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </svg>
          </button>
        </div>
        <div className="cr-hero-inner relative z-10">
          <div className="bgr-hero-veil">
          <div className="cr-title-veil">
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="cr-kicker"
            >
              {event.title || "The Wedding"}
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
              {formatInvitationDate(eventDate)}
            </p>
          ) : null}

          {event.image_url ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.15 }}
              className="cr-portrait-wrap"
            >
              <span className="cr-sprig cr-sprig-left"><PortraitSprig /></span>
              <div className="cr-portrait">
                <img
                  src={event.image_url}
                  alt={`${brideName} and ${groomName}`}
                />
              </div>
              <span className="cr-sprig cr-sprig-right"><PortraitSprig /></span>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="cr-rsvp"
          >
            <OpenRsvpSection event={event}>
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
            </OpenRsvpSection>
          </motion.div>

          <FloralRule />
          </div>
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

                <div className="bgr-date-lockup" aria-label={`${dateMonth} ${dateDay}, ${dateYear}`}>
                  <span className="bgr-date-rule" aria-hidden="true" />
                  <div className="bgr-date-row">
                    <span className="bgr-date-month">{dateMonth}</span>
                    <span className="bgr-date-day">{dateDay}</span>
                    <span className="bgr-date-year">{dateYear}</span>
                  </div>
                  <span className="bgr-date-rule" aria-hidden="true" />
                </div>

                <div className="bgr-countdown" aria-label="Time remaining">
                  {countdownParts.map((item) => (
                    <div key={item.label} className="bgr-cd-item">
                      <span className="bgr-cd-num">{String(item.value).padStart(2, "0")}</span>
                      <span className="bgr-cd-label">{item.label}</span>
                    </div>
                  ))}
                </div>

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
                    <span className="os-heart-symbol" style={{ color: "#3E6B5A" }}>♥</span>
                    <span className="os-divider-dot" />
                  </div>
                  <div className="os-divider-line right" />
                </div>
              </div>

              {/* Story content */}
              <div className="max-w-2xl mx-auto px-4 relative z-10">
                <div className="os-card" style={{ textAlign: "center", fontStyle: "italic", fontSize: "16px", lineHeight: "1.8", color: "#2A453C", background: "rgba(255, 255, 255, 0.6)", borderRadius: "24px", border: "1px solid rgba(212, 164, 158, 0.28)", padding: "28px" }}>
                  <span style={{ display: "block", fontSize: "40px", color: "#E8B4A8", fontFamily: "Playfair Display, serif", lineHeight: "1", marginBottom: "-10px" }}>&ldquo;</span>
                  <p className="os-desc" style={{ fontSize: "clamp(15px, 2.5vw, 18px)", fontFamily: "Cormorant Garamond, serif", color: "#2A453C" }}>
                    {event.description}
                  </p>
                  <span style={{ display: "block", fontSize: "40px", color: "#E8B4A8", fontFamily: "Playfair Display, serif", lineHeight: "1", marginTop: "10px" }}>&rdquo;</span>
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

              <div className="bgr-collage-stack">
                {galleryGroups.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="bgr-collage"
                    data-count={group.length}
                  >
                    {group.map((src, index) => {
                      const photoIndex = groupIndex * 6 + index;
                      return (
                        <button
                          key={photoIndex}
                          type="button"
                          className="bgr-collage-shot"
                          onClick={() => setLightboxIndex(photoIndex)}
                        >
                          <img src={src} alt={`Gallery photograph ${photoIndex + 1}`} />
                        </button>
                      );
                    })}
                  </div>
                ))}
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

      <InviteGiftSection
        eventId={event?.id}
        giftsEnabled={event?.gifts_enabled}
        isVerified={isVerified}
        attendeeId={attendee?.id}
      />

      {/* Brand Footer */}
      <footer className="w-full bg-[#243E38]/95 backdrop-blur-md text-[#FBF6F1] py-8 px-4 text-center mt-auto border-t border-[#243E38]/20 z-10 relative">
        <div className="max-w-md mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F0D0CB]">{brideName} & {groomName}</p>
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
              className="absolute top-4 right-4 text-white hover:text-[#F0D0CB] transition-colors z-50 p-2 bg-black/40 rounded-full hover:bg-black/60"
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
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-[#F0D0CB] transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-[#F0D0CB] transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full z-50 focus:outline-none"
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

export default BlushGardenRomanceLayout;

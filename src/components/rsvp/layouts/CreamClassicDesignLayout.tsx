"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClassicButtonOpener } from "../openers/ClassicButtonOpener";
import { EnvelopeOpener } from "../openers/EnvelopeOpener";
import { Sparkles, Volume2, VolumeX, MapPin, ChevronDown, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CreamClassicDesignLayoutProps {
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

const CreamClassicDesignLayout: React.FC<CreamClassicDesignLayoutProps> = ({
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
  const CardTemplateImage = ({ templateId, finalCardUrl, eventTitle }: any) => {
    const [template, setTemplate] = useState<any>(null);

    useEffect(() => {
      if (finalCardUrl) return; 
      if (!templateId) return;

      const fetchTemplate = async () => {
        const { data } = await (supabase.from("card_templates" as any) as any)
          .select("*")
          .eq("id", templateId)
          .single();
        if (data) setTemplate(data);
      };
      fetchTemplate();
    }, [templateId, finalCardUrl]);

    const displayUrl = finalCardUrl || template?.image_url;

    if (!displayUrl) return null;

    return (
      <img
        src={displayUrl}
        alt={eventTitle}
        className="relative z-10 w-full h-full object-contain rounded-lg shadow-2xl border-4 border-amber-300/30"
      />
    );
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isOpened, setIsOpened] = useState(false);
  const [isUpdatingResponse, setIsUpdatingResponse] = useState(false);

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
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [event?.date]);

  const titleParts = useMemo(() => {
    const brideName = (event?.bride_name || "").trim();
    const groomName = (event?.groom_name || "").trim();
    if (brideName || groomName) {
      return [brideName, groomName];
    }

    const title = event?.title || "";
    const splitByAmpersand = title.split("&").map((part: string) => part.trim());
    if (splitByAmpersand.length === 2 && splitByAmpersand[0] && splitByAmpersand[1]) {
      return splitByAmpersand;
    }
    return [title, ""];
  }, [event?.title, event?.bride_name, event?.groom_name]);

  const updateResponse = async (response: "yes" | "no" | "maybe") => {
    if (!attendee?.id) {
      toast.error("Please verify your invitation first.");
      return;
    }

    setIsUpdatingResponse(true);
    try {
      const { data, error } = await supabase
        .from("attendees")
        .update({ response })
        .eq("id", attendee.id)
        .select();

      if (error) {
        toast.error(`RSVP Error: ${error.message || "Please check your network."}`);
        console.error("Supabase update error:", error);
        return;
      }
      
      if (!data || data.length === 0) {
        toast.error("RSVP Error: 0 rows updated. Check Supabase RLS policies for UPDATE.");
        console.error("0 rows updated, data:", data);
        setIsUpdatingResponse(false);
        return;
      }

      setAttendee(data[0]);
      toast.success("Thank you for your response!");
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast.error("Failed to update RSVP. Please try again.");
    } finally {
      setIsUpdatingResponse(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!event?.date) return;

    // We assume the event starts at the provided date/time and lasts 2 hours
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDateForICS = (dateStr: Date) => {
      return dateStr.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const title = titleParts.join(' & ') || event?.title || "Wedding Event";
    const description = event?.description || "We are so excited to celebrate with you!";
    const locationStr = event?.location || "";

    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:${window.location.href}\nDTSTART:${formatDateForICS(startDate)}\nDTEND:${formatDateForICS(endDate)}\nSUMMARY:${title}\nDESCRIPTION:${description}\nLOCATION:${locationStr}\nEND:VEVENT\nEND:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Save_The_Date_${title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="text-center">
          <motion.div
            className="inline-flex"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-10 w-10 text-amber-700" />
          </motion.div>
          <p className="mt-3 text-lg text-amber-900 font-medium">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="text-center px-4">
          <X className="h-10 w-10 text-red-600 mx-auto" />
          <h1 className="mt-3 text-2xl font-semibold text-red-900">Event not found</h1>
          <p className="text-gray-600 mt-2">This invitation link is invalid or no longer available.</p>
        </div>
      </div>
    );
  }

  const dayText = new Date(event.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const createParticle = (x: number, y: number, type: string) => {
    const particle = document.createElement('div');
    document.body.appendChild(particle);
    
    // Ensure particle is strictly positioned above everything
    particle.style.position = 'fixed';
    particle.style.left = '0';
    particle.style.top = '0';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '99999';
    particle.style.display = 'flex';
    particle.style.alignItems = 'center';
    particle.style.justifyContent = 'center';
    
    let width: number | string = Math.floor(Math.random() * 30 + 8);
    let height: number | string = width;
    let destinationX = (Math.random() - 0.5) * 300;
    let destinationY = (Math.random() - 0.5) * 300;
    let rotation = Math.random() * 520;
    let delay = Math.random() * 200;

    switch (type) {
      case 'square':
        particle.style.background = `hsl(${Math.random() * 90 + 270}, 70%, 60%)`;
        particle.style.border = '1px solid white';
        break;
      case 'emoji':
        particle.innerHTML = ['❤', '🧡', '💛', '💚', '💙', '💜', '🧡'][Math.floor(Math.random() * 7)];
        particle.style.fontSize = `${Math.random() * 24 + 10}px`;
        width = 'auto';
        height = 'auto';
        break;
      case 'mario':
        particle.style.backgroundImage = 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/127738/mario-face.png)';
        particle.style.backgroundSize = 'cover';
        break;
      case 'shadow':
        const shadowColor = `hsl(${Math.random() * 90 + 90}, 70%, 50%)`;
        particle.style.boxShadow = `0 0 ${Math.floor(Math.random() * 10 + 10)}px ${shadowColor}`;
        particle.style.background = shadowColor;
        particle.style.borderRadius = '50%';
        width = Math.random() * 5 + 4;
        height = width as number;
        break;
      case 'line':
        particle.style.background = 'black';
        height = 1;
        rotation += 1000;
        delay = Math.random() * 1000;
        break;
    }

    particle.style.width = typeof width === 'number' ? `${width}px` : width;
    particle.style.height = typeof height === 'number' ? `${height}px` : height;

    try {
      const animation = particle.animate([
        {
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(0deg)`,
          opacity: 1
        },
        {
          transform: `translate(-50%, -50%) translate(${x + destinationX}px, ${y + destinationY}px) rotate(${rotation}deg)`,
          opacity: 0
        }
      ], {
        duration: Math.random() * 1000 + 5000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: delay
      });
      animation.onfinish = () => {
        particle.remove();
      };
    } catch(err) {
      setTimeout(() => particle.remove(), 5000);
    }
  };

  const pop = (e: React.MouseEvent<any>) => {
    let amount = 30;
    const type = (e.currentTarget?.dataset?.type as string) || 'emoji';
    
    if (type === 'shadow' || type === 'line') {
      amount = 60;
    }
    
    if (e.clientX === 0 && e.clientY === 0) {
      const bbox = e.currentTarget.getBoundingClientRect();
      const x = bbox.left + bbox.width / 2;
      const y = bbox.top + bbox.height / 2;
      for (let i = 0; i < amount; i++) {
        createParticle(x, y, type);
      }
    } else {
      for (let i = 0; i < amount; i++) {
        createParticle(e.clientX, e.clientY, type);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-amber-100 overflow-x-hidden" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Import elegant fonts for wedding theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Courier+Prime&family=Great+Vibes&display=swap');

        .os-title-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 220px;
          margin: 14px auto 24px;
        }
        .os-divider-line {
          height: 1px;
          background: linear-gradient(to right, transparent, #7F1D1D);
          flex-grow: 1;
        }
        .os-divider-line.right {
          background: linear-gradient(to left, transparent, #7F1D1D);
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
          background: #7F1D1D;
        }
        .os-heart-symbol {
          font-size: 14px;
          color: #7F1D1D;
          line-height: 1;
        }
        .ty-section {
          position: relative;
          width: 100%;
          padding: 80px 24px 84px;
          text-align: center;
          overflow: hidden;
          background: #FDFBF7;
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
          font-size: clamp(48px, 10vw, 76px);
          color: #7F1D1D;
          margin-bottom: 4px;
        }
        .ty-msg {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(14px, 3.2vw, 17px);
          color: #5E0F14;
          line-height: 1.7;
          max-width: 460px;
          margin: 24px auto 28px;
        }
        .ty-names {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 4.5vw, 24px);
          font-weight: 500;
          letter-spacing: 1.5px;
          color: #7F1D1D;
          text-transform: uppercase;
        }
      `}</style>
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
      {event?.opener_style === 'envelope' ? (
        <EnvelopeOpener
          isOpened={isOpened}
          setIsOpened={setIsOpened}
          brideName={titleParts[0]}
          groomName={titleParts[1]}
          theme="classic"
          isPlaying={isPlaying}
          toggleMusic={toggleMusic}
          audioRef={audioRef}
          onTriggerOpen={pop}
        />
      ) : (
        <ClassicButtonOpener
          isOpened={isOpened}
          onOpen={(e) => {
            pop(e);
            setIsOpened(true);
          }}
          brideName={titleParts[0]}
          groomName={titleParts[1]}
          theme="classic"
          isPlaying={isPlaying}
          toggleMusic={toggleMusic}
          audioRef={audioRef}
        />
      )}

      <button
        type="button"
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-40 p-2 rounded-full bg-black/35 hover:bg-black/50 transition"
        aria-label="Toggle music"
      >
        {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>

      <section
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${event.background_image_url || event.image_url || "/assets/back.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* {(event.final_card_url || event.selected_template_id) ? (
          <div className="mt-8 relative w-72 h-96 sm:w-[400px] sm:h-[533px] flex items-center justify-center animate-in fade-in zoom-in duration-700">
             <div className="absolute inset-0 bg-amber-200/20 blur-3xl rounded-full animate-pulse" />
             <CardTemplateImage 
               templateId={event.selected_template_id} 
               finalCardUrl={event.final_card_url} 
               eventTitle={event.title}
             />
          </div>
        ) : ( */}
          <>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-wide" style={{ fontFamily: "'Great Vibes', cursive" }}>
              {titleParts[0]} & {titleParts[1]}
            </h1>

            {event.image_url ? (
              <div className="mt-8 relative w-56 h-56 sm:w-80 sm:h-80 flex items-center justify-center">
                <img
                  src="/assets/flower2.png"
                  alt="Decorative floral frame"
                  className="absolute inset-0 w-full h-full object-contain animate-[spin_80s_linear_infinite]"
                />
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="relative z-10 w-44 h-44 sm:w-60 sm:h-60 rounded-full object-cover border-4 border-amber-300/70 shadow-2xl"
                />
              </div>
            ) : null}
          </>
        

        <div id="rsvp-section" className="mt-10 w-full max-w-xl">
            <div className="space-y-3">
              <p className="text-xl text-amber-100" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Hi {attendee?.name || "Guest"}! Let us know you&apos;re coming</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  style={{ fontFamily: "'Great Vibes', cursive" }}
                  disabled={isUpdatingResponse || !event?.is_active}
                  onClick={() => updateResponse("yes")}
                  className={`px-6 py-2 rounded-l-full rounded-r-md border border-amber-300 transition ${attendee?.response === "yes" ? "bg-green-600/80" : "bg-black/35 hover:bg-green-700/50"} ${!event?.is_active ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Yes
                </button>
                <button
                  style={{ fontFamily: "'Great Vibes', cursive" }}
                  disabled={isUpdatingResponse || !event?.is_active}
                  onClick={() => updateResponse("no")}
                  className={`px-6 py-2 rounded-md border border-amber-300 transition ${attendee?.response === "no" ? "bg-red-600/80" : "bg-black/35 hover:bg-red-700/50"} ${!event?.is_active ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  No
                </button>
                <button
                  style={{ fontFamily: "'Great Vibes', cursive" }}
                  disabled={isUpdatingResponse || !event?.is_active}
                  onClick={() => updateResponse("maybe")}
                  className={`px-6 py-2 rounded-r-full rounded-l-md border border-amber-300 transition ${attendee?.response === "maybe" ? "bg-orange-500/80" : "bg-black/35 hover:bg-orange-600/50"} ${!event?.is_active ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Maybe
                </button>
              </div>
            </div>
        </div>

        <ChevronDown className="h-8 w-8 mt-10 animate-bounce text-amber-200/90" />
      </section>

      {event.description ? (
        <section className="py-12 px-4 relative flex flex-col items-center justify-center bg-[#FDFBF7] text-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="w-full max-w-3xl mx-auto relative z-10 flex flex-col items-center"
          >
            {/* <div className="mb-6 drop-shadow-xl">
              <img src="/assets/rings.png" alt="Rings" className="h-16 sm:h-20 w-auto opacity-90" />
            </div> */}

            <img
              src="/assets/floral-divider.png"
              alt="Divider"
              className="w-48 sm:w-64 mb-6 opacity-80 drop-shadow-md"
            />

            <h2 className="text-5xl sm:text-6xl mb-10 text-[#7F1D1D] tracking-wider" style={{ fontFamily: "'Great Vibes', cursive" }}>
              Our Story
            </h2>

            <div className="relative w-full px-6 sm:px-12 py-12 sm:py-14 bg-white/70 border border-[#7F1D1D]/20 rounded-3xl shadow-xl backdrop-blur-md">
              <span className="absolute top-4 left-6 text-6xl sm:text-7xl text-[#7F1D1D]/30 font-serif leading-none">"</span>
              <p className="relative z-10 text-lg sm:text-xl md:text-2xl leading-relaxed text-[#5E0F14] font-light px-4 sm:px-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {event.description}
              </p>
              <span className="absolute -bottom-2 right-6 sm:-bottom-4 sm:right-8 text-6xl sm:text-7xl text-[#7F1D1D]/30 font-serif leading-none rotate-180">"</span>
            </div>

            <img
              src="/assets/floral-divider.png"
              alt="Divider"
              className="w-48 sm:w-64 mt-10 opacity-80 rotate-180 drop-shadow-md"
            />
          </motion.div>
        </section>
      ) : null}

      <section
        className="relative py-24 px-4 text-center overflow-hidden bg-[#FDFBF7]"
      >
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl sm:text-7xl text-[#7F1D1D] tracking-wider mb-8" style={{ fontFamily: "'Great Vibes', cursive" }}>
            Save The Date
          </h2>

          <div className="bg-white/70 backdrop-blur-md border border-[#7F1D1D]/20 rounded-3xl p-8 sm:p-12 w-full max-w-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7F1D1D]/50 to-transparent"></div>

            <p className="text-3xl sm:text-4xl text-[#5E0F14] font-light tracking-wide mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {dayText}
            </p>

            {event.location && (
              <div className="flex flex-col items-center gap-3 mb-8">
                <p className="text-lg sm:text-xl text-[#7F1D1D] max-w-md font-semibold">{event.location}</p>
                {event.location_url && (
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#7F1D1D]/10 hover:bg-[#7F1D1D]/20 border border-[#7F1D1D]/30 transition-all text-[#7F1D1D]"
                  >
                    <MapPin className="h-4 w-4" />
                    View Map
                  </a>
                )}
              </div>
            )}

            <button
              onClick={handleAddToCalendar}
              className="mt-2 px-8 py-3 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white shadow-[0_4px_12px_rgba(127,29,29,0.2)] transition-all flex items-center gap-2 mx-auto font-medium"
            >
              <Calendar className="h-5 w-5" />
              Add to Calendar
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-6 mt-16 max-w-3xl mx-auto w-full">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center justify-center p-3 sm:p-6 bg-white/70 rounded-2xl border border-[#7F1D1D]/20 shadow-md">
                <p className="text-2xl sm:text-5xl md:text-6xl font-semibold text-[#7F1D1D] drop-shadow-sm mb-1 sm:mb-2">{item.value}</p>
                <p className="text-[10px] sm:text-sm uppercase tracking-widest text-[#7F1D1D]/80 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {Array.isArray(event.agenda) && event.agenda.length > 0 ? (
        <section className="relative py-24 px-4 bg-[#FDFBF7] overflow-hidden">
          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl sm:text-7xl text-[#7F1D1D] tracking-wider mb-6" style={{ fontFamily: "'Great Vibes', cursive" }}>
                Schedule
              </h2>
              <img src="/assets/floral-divider.png" alt="Divider" className="w-48 sm:w-64 mx-auto opacity-70 drop-shadow-md" />
            </motion.div>

            <div className="relative mx-auto w-full px-2 sm:px-0">
              {/* Vertical Center Line */}
              <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-[#7F1D1D]/30 to-transparent sm:-translate-x-1/2 shadow-[0_0_5px_rgba(127,29,29,0.2)]" />

              <div className="space-y-12 sm:space-y-16">
                {event.agenda.map((item: any, index: number) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <motion.div 
                      key={`${item.time}-${index}`}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.7 }}
                      className={`relative w-full flex flex-col sm:flex-row items-start sm:items-center ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-6 sm:left-1/2 w-5 h-5 rounded-full bg-[#7F1D1D] border-[5px] border-[#FDFBF7] shadow-[0_0_10px_rgba(127,29,29,0.5)] transform -translate-x-1/2 sm:-translate-y-1/2 sm:top-1/2 top-8 z-10" />

                      {/* Content Card Wrapper */}
                      <div className={`w-full sm:w-5/12 ml-14 sm:ml-0 ${isLeft ? 'sm:pr-10 lg:pr-16 text-left sm:text-right' : 'sm:pl-10 lg:pl-16 text-left'}`}>
                        <div className="bg-white/70 backdrop-blur-md border border-[#7F1D1D]/20 rounded-3xl p-6 sm:p-8 w-full shadow-xl hover:border-[#7F1D1D]/40 transition-all duration-500 relative overflow-hidden group">
                           {/* Hover Glow Effect */}
                           <div className="absolute -inset-2 bg-gradient-to-r from-[#7F1D1D]/0 via-[#7F1D1D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                           
                           <h3 className="relative z-10 text-2xl sm:text-3xl text-[#7F1D1D] tracking-wider mb-2 drop-shadow-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                             {item.time}
                           </h3>
                           <p className="relative z-10 text-lg sm:text-xl text-[#5E0F14] font-light leading-relaxed">
                             {item.description || item.title}
                           </p>
                        </div>
                      </div>

                      {/* Spacer to balance the layout on desktop */}
                      <div className="hidden sm:block sm:w-5/12" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {Array.isArray(event.slider_images) && event.slider_images.length > 0 ? (
        <section className="py-16 px-4 bg-[#F8F5EC]">
          <h2 className="text-4xl text-center mb-8 text-[#7F1D1D]" style={{ fontFamily: "'Great Vibes', cursive" }}>
            Gallery
          </h2>
          <div className="max-w-5xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {event.slider_images.map((image: string, index: number) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <img
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      className="aspect-square object-cover rounded-xl shadow-lg"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 sm:-left-12 bg-[#FDFBF7]/95 border-[#7F1D1D]/30 text-[#7F1D1D] hover:bg-[#7F1D1D] hover:text-white hover:border-[#7F1D1D] transition-all duration-300 shadow-md h-9 w-9" />
              <CarouselNext className="right-2 sm:-right-12 bg-[#FDFBF7]/95 border-[#7F1D1D]/30 text-[#7F1D1D] hover:bg-[#7F1D1D] hover:text-white hover:border-[#7F1D1D] transition-all duration-300 shadow-md h-9 w-9" />
            </Carousel>
          </div>
        </section>
      ) : null}

      <section className="ty-section bg-[#FDFBF7]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="ty-content w-full max-w-3xl mx-auto"
        >
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
          <p className="ty-names">{titleParts[0]} & {titleParts[1]}</p>
        </motion.div>
      </section>

      <audio ref={audioRef} src={event?.audio_url || "/soft-background-music.mp3"} loop />
    </div>
  );
};

export default CreamClassicDesignLayout;

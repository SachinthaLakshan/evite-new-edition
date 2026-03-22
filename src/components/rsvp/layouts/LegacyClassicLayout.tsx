"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

interface LegacyClassicLayoutProps {
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

const LegacyClassicLayout: React.FC<LegacyClassicLayoutProps> = ({
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
        .select()
        .single();

      if (error) {
        toast.error("Failed to update RSVP. Please try again.");
        return;
      }

      if (data) {
        setAttendee(data);
        toast.success("Thank you for your response!");
      }
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

  const pop = (e: React.MouseEvent<HTMLButtonElement>) => {
    let amount = 30;
    const type = (e.currentTarget.dataset.type as string) || 'emoji';
    
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

  const onClickOpenButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    pop(e);
    setIsOpened(true);
    if (!isPlaying) toggleMusic();
    if (audioRef?.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#1a120b] text-amber-100 overflow-x-hidden">
      {!isOpened && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <style dangerouslySetInnerHTML={{ __html: `
            .animated-open-btn {
              position: relative;
              padding: 10px 30px;  
              border: none;
              background: none;
              cursor: pointer;
              font-family: 'Parisienne', cursive;
              font-weight: 900;
              font-size: 34px;  
              color: hsla(210, 50%, 85%, 1);
              background-image: linear-gradient(to right, #FF512F 0%, #F09819 51%, #FF512F 100%);
              border: 3px solid #fff;
              box-shadow: hsla(210, 40%, 52%, .94) 2px 2px 22px;
              border-radius: 12px; 
              z-index: 0;  
              overflow: hidden;   
            }
            .animated-open-btn:focus {
              outline-color: transparent;
              box-shadow: #e4752b;
            }
            .animated-open-btn .right::after, .animated-open-btn::after {
              content: "";
              display: block;
              position: absolute;
              white-space: nowrap;
              padding: 60px 60px;
              pointer-events: none;
            }
            .animated-open-btn::after {
              font-weight: 200;
              top: -30px;
              left: -20px;
            } 
            .animated-open-btn .right, .animated-open-btn .left {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
            }
            .animated-open-btn .right {
              left: 66%;
            }
            .animated-open-btn .left {
              right: 66%;
            }
            .animated-open-btn .right::after {
              top: -30px;
              left: calc(-66% - 20px);
              background-color: #141218;
              color: transparent;
              transition: transform .4s ease-out;
              transform: translate(0, -90%) rotate(0deg);
            }
            .animated-open-btn:hover .right::after {
              transform: translate(0, -47%) rotate(0deg);
            }
            .animated-open-btn .right:hover::after {
              transform: translate(0, -50%) rotate(-7deg);
            }
            .animated-open-btn .left:hover ~ .right::after {
              transform: translate(0, -50%) rotate(7deg);
            }
            /* bubbles */
            .animated-open-btn::before {
              content: '';
              pointer-events: none;
              opacity: .6;
              background:
                radial-gradient(circle at 20% 35%,  transparent 0,  transparent 2px, hsla(210, 50%, 85%, 1) 3px, hsla(210, 50%, 85%, 1) 4px, transparent 4px),
                radial-gradient(circle at 75% 44%, transparent 0,  transparent 2px, hsla(210, 50%, 85%, 1) 3px, hsla(210, 50%, 85%, 1) 4px, transparent 4px),
                radial-gradient(circle at 46% 52%, transparent 0, transparent 4px, hsla(210, 50%, 85%, 1) 5px, hsla(210, 50%, 85%, 1) 6px, transparent 6px);
              width: 100%;
              height: 300%;
              top: 0;
              left: 0;
              position: absolute;
              animation: btn-bubbles 5s linear infinite both;
            }
            @keyframes btn-bubbles {
              from {
                transform: translate(0, 0);
              }
              to {
                transform: translate(0, -66.666%);
              }
            }
          `}} />
          <button
            type="button"
            data-type="emoji"
            onClick={onClickOpenButton}
            className="animated-open-btn"
          >
            Open Invitation
            <div className="left"></div>
            <div className="right"></div>
          </button>
        </div>
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
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-wide" style={{ fontFamily: 'Parisienne' }}>
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

        <div id="rsvp-section" className="mt-10 w-full max-w-xl">
          {!isVerified ? (
            <div className="bg-black/45 border border-amber-200/30 rounded-2xl p-6">
              <p className="text-lg mb-4 text-amber-100">Verify your invitation to respond</p>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or WhatsApp number"
                className="w-full px-4 py-3 rounded-xl bg-white/95 text-gray-900 outline-none"
              />
              <button
                type="button"
                onClick={() => verifyAttendee()}
                className="mt-4 w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-600 transition text-white font-medium"
              >
                Verify Invitation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xl text-amber-100" style={{ fontFamily: 'Courier New' }}>Hi {attendee?.name || "Guest"}! Let us know you&apos;re coming</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  style={{ fontFamily: 'Parisienne' }}
                  disabled={isUpdatingResponse}
                  onClick={() => updateResponse("yes")}
                  className={`px-6 py-2 rounded-l-full rounded-r-md border border-amber-300 transition ${attendee?.response === "yes" ? "bg-green-600/80" : "bg-black/35 hover:bg-green-700/50"
                    }`}
                >
                  Yes
                </button>
                <button
                  style={{ fontFamily: 'Parisienne' }}
                  disabled={isUpdatingResponse}
                  onClick={() => updateResponse("no")}
                  className={`px-6 py-2 rounded-md border border-amber-300 transition ${attendee?.response === "no" ? "bg-red-600/80" : "bg-black/35 hover:bg-red-700/50"
                    }`}
                >
                  No
                </button>
                <button
                  style={{ fontFamily: 'Parisienne' }}
                  disabled={isUpdatingResponse}
                  onClick={() => updateResponse("maybe")}
                  className={`px-6 py-2 rounded-r-full rounded-l-md border border-amber-300 transition ${attendee?.response === "maybe" ? "bg-orange-500/80" : "bg-black/35 hover:bg-orange-600/50"
                    }`}
                >
                  Maybe
                </button>
              </div>
            </div>
          )}
        </div>

        <ChevronDown className="h-8 w-8 mt-10 animate-bounce text-amber-200/90" />
      </section>

      {event.description ? (
        <section className="py-12 px-4 relative flex flex-col items-center justify-center bg-[#1a120b] text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a120b] via-[#291d14] to-[#1a120b] opacity-80" />

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
              className="w-48 sm:w-64 mb-6 opacity-80 drop-shadow-md filter brightness-0 invert"
            />

            <h2 className="text-5xl sm:text-6xl mb-10 text-amber-200 tracking-wider" style={{ fontFamily: "Parisienne, cursive" }}>
              Our Story
            </h2>

            <div className="relative w-full px-6 sm:px-12 py-12 sm:py-14 bg-black/40 border border-amber-800/40 rounded-3xl shadow-2xl backdrop-blur-md">
              <span className="absolute top-4 left-6 text-6xl sm:text-7xl text-amber-700/40 font-serif leading-none">"</span>
              <p className="relative z-10 text-lg sm:text-xl md:text-2xl leading-relaxed text-amber-50/90 font-light px-4 sm:px-8" style={{ fontFamily: "Courier New, monospace" }}>
                {event.description}
              </p>
              <span className="absolute -bottom-2 right-6 sm:-bottom-4 sm:right-8 text-6xl sm:text-7xl text-amber-700/40 font-serif leading-none rotate-180">"</span>
            </div>

            <img
              src="/assets/floral-divider.png"
              alt="Divider"
              className="w-48 sm:w-64 mt-10 opacity-80 rotate-180 drop-shadow-md filter brightness-0 invert"
            />
          </motion.div>
        </section>
      ) : null}

      <section
        className="relative py-24 px-4 text-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img src="/assets/modern/calenderback.jpg" alt="Background" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl sm:text-7xl text-amber-100 tracking-wider mb-8" style={{ fontFamily: "Parisienne, cursive" }}>
            Save The Date
          </h2>

          <div className="bg-black/30 backdrop-blur-md border border-amber-800/50 rounded-3xl p-8 sm:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

            <p className="text-3xl sm:text-4xl text-amber-50 font-light tracking-wide mb-6" style={{ fontFamily: "Courier New, monospace" }}>
              {dayText}
            </p>

            {event.location && (
              <div className="flex flex-col items-center gap-3 mb-8">
                <p className="text-lg sm:text-xl text-amber-100/90 max-w-md">{event.location}</p>
                {event.location_url && (
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-amber-500/30 transition-all text-amber-100 hover:text-white"
                  >
                    <MapPin className="h-4 w-4" />
                    View Map
                  </a>
                )}
              </div>
            )}

            <button
              onClick={handleAddToCalendar}
              className="mt-2 px-8 py-3 rounded-full bg-amber-700/80 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_20px_rgba(217,119,6,0.6)] transition-all flex items-center gap-2 mx-auto font-medium"
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
              <div key={item.label} className="flex flex-col items-center justify-center p-3 sm:p-6 bg-amber-900/20 backdrop-blur-sm rounded-2xl border border-amber-500/20">
                <p className="text-2xl sm:text-5xl md:text-6xl font-semibold text-white drop-shadow-md mb-1 sm:mb-2">{item.value}</p>
                <p className="text-[10px] sm:text-sm uppercase tracking-widest text-amber-200/80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {Array.isArray(event.agenda) && event.agenda.length > 0 ? (
        <section className="relative py-24 px-4 bg-[#1a120b] overflow-hidden">
          {/* Subtle Background Overlay */}
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
            <img src="/assets/agendaback.png" alt="Agenda Background" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a120b] via-[#241a10]/95 to-[#1a120b] z-0" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl sm:text-7xl text-amber-100 tracking-wider mb-6" style={{ fontFamily: "Parisienne, cursive" }}>
                Agenda
              </h2>
              <img src="/assets/floral-divider.png" alt="Divider" className="w-48 sm:w-64 mx-auto opacity-70 filter brightness-0 invert drop-shadow-md" />
            </motion.div>

            <div className="relative mx-auto w-full px-2 sm:px-0">
              {/* Vertical Center Line */}
              <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-amber-700/50 to-transparent sm:-translate-x-1/2 shadow-[0_0_5px_rgba(217,119,6,0.3)]" />

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
                      <div className="absolute left-6 sm:left-1/2 w-5 h-5 rounded-full bg-amber-400 border-[5px] border-[#1a120b] shadow-[0_0_15px_rgba(251,191,36,0.7)] transform -translate-x-1/2 sm:-translate-y-1/2 sm:top-1/2 top-8 z-10" />

                      {/* Content Card Wrapper */}
                      <div className={`w-full sm:w-5/12 ml-14 sm:ml-0 ${isLeft ? 'sm:pr-10 lg:pr-16 text-left sm:text-right' : 'sm:pl-10 lg:pl-16 text-left'}`}>
                        <div className="bg-black/30 backdrop-blur-md border border-amber-800/30 rounded-3xl p-6 sm:p-8 w-full shadow-2xl hover:bg-black/50 hover:border-amber-600/40 transition-all duration-500 relative overflow-hidden group">
                           {/* Hover Glow Effect */}
                           <div className="absolute -inset-2 bg-gradient-to-r from-amber-900/0 via-amber-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
                           
                           <h3 className="relative z-10 text-2xl sm:text-3xl text-amber-200 tracking-wider mb-2 drop-shadow-md" style={{ fontFamily: "Courier New, monospace" }}>
                             {item.time}
                           </h3>
                           <p className="relative z-10 text-lg sm:text-xl text-amber-50/90 font-light leading-relaxed">
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
        <section className="py-16 px-4 bg-black/20">
          <h2 className="text-4xl text-center mb-8" style={{ fontFamily: "cursive" }}>
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
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </section>
      ) : null}

      <section
        className="relative py-28 sm:py-36 px-4 flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(26,18,11,1) 0%, rgba(26,18,11,0.5) 50%, rgba(26,18,11,1) 100%), url('/assets/thankyouback.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center w-full max-w-3xl mx-auto"
        >
          {/* Top Divider */}
          <img 
            src="/assets/floral-divider.png" 
            alt="Divider" 
            className="w-48 sm:w-64 mb-10 opacity-80 filter brightness-0 invert drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" 
          />
          
          {/* Main Thank You Image with subtle glow effect */}
          <div className="relative group flex justify-center w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amber-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0"></div>
            <img 
              src="/assets/thank-you.png" 
              alt="Thank You" 
              className="w-full max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          <p className="mt-10 sm:mt-12 text-lg sm:text-xl md:text-2xl text-amber-50/90 font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase drop-shadow-md text-center" style={{ fontFamily: "Courier New, monospace" }}>
            For Celebrating With Us
          </p>
          
          {/* Bottom Divider */}
          <img 
            src="/assets/floral-divider.png" 
            alt="Divider" 
            className="w-48 sm:w-64 mt-10 opacity-80 filter brightness-0 invert rotate-180 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" 
          />
        </motion.div>
      </section>

      <audio ref={audioRef} loop>
        <source src="/soft-background-music.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default LegacyClassicLayout;

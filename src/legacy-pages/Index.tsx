"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  Mail,
  Phone,
  MapPin,
  Check,
  PlayCircle,
  Gift,
  ArrowRight,
  ClipboardList,
  Wallet,
  Sparkles,
  Lock,
  ChevronRight,
  Shield,
  Scale,
  Calendar
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Landing: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const displayEvents =[
    {
      date: new Date('2026-11-20'),
      title:'My Wedding',
      groom_name:'Kasun',
      bride_name:'Imasha',
      url:'http://www.evite.lk/s/ip0s7',
      imageUrl:'/assets/invite-lavendra.png',
      id:1
    },
    {
      date: new Date('2026-10-15'),
      title:'Our Wedding',
      groom_name:'Supun',
      bride_name:'Imasha',
      url:'http://www.evite.lk/s/hSjPx',
      imageUrl:'/assets/invite-classc.png',
      id:2
    },
    {
      date: new Date('2026-12-31'),
      title:'Big Day',
      groom_name:'Lahiru',
      bride_name:'Imasha',
      url:'http://www.evite.lk/s/flZQr',
      imageUrl:'/assets/invite-lavendra.png',
      id:3
    }
  ]

  useEffect(() => {
    // Antigravity Confetti Animation on load
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: Math.random() * (120 - 60) + 60,
        spread: 55,
        origin: { x: Math.random(), y: 1.1 },
        gravity: -0.15,
        scalar: Math.random() * (1.2 - 0.8) + 0.8,
        drift: Math.random() * (1 - -1) + -1,
        colors: ["#ff604b", "#fba538", "#a855f7", "#6366f1"],
        ticks: 250,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const slides = [
    {
      title: "Exquisite Digital Invitations",
      description: "Create premium mobile-first invitations that captivate your guests.",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
      buttonText: "Create Free Invitation",
      buttonLink: "/auth",
    },
    {
      title: "Organized Wedding Checklist",
      description: "Tackle your milestones step-by-step with clean accordion task views.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      buttonText: "Check Your Checklist",
      buttonLink: "/auth",
    },
    {
      title: "Real-Time Budget Tracker",
      description: "Monitor expenses, unpaid dues, and payments in local Rupees currency.",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      buttonText: "Calculate Your Budget",
      buttonLink: "/auth",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);


  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Luxury E-Invites",
      description: "Exquisite mobile wedding cards with custom RSVP and map integrations.",
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "Wedding Checklist",
      description: "Interactive timeline breakdown with customizable accordion task views.",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Budget Management",
      description: "Track vendor payments, unpaid dues, and budget limits dynamically.",
    },
  ];

  const pricingPlans = [
    {
      name: "Silver Pack",
      price: "Rs. 2,999",
      description: "Essential digital suite",
      features: [
        "Unlimited E-cards Distribution",
        "Mobile-first RSVP Management",
        "Wedding Checklist Access",
        "Basic Budget Tracker Tool",
        "Google Maps Location Pins",
      ],
      buttonText: "Start Silver Pack",
      highlighted: false,
    },
    {
      name: "Gold Pack",
      price: "Rs. 7,999",
      description: "Premium digital + print bundle",
      features: [
        "Everything in Silver Pack",
        "Custom Music Background",
        "Detailed Guest RSVP Analytics",
        "100 Premium Printed Cards",
        "Priority Email & Chat Support",
      ],
      buttonText: "Upgrade to Gold",
      highlighted: true,
    },
    {
      name: "Platinum Pack",
      price: "Rs. 14,999",
      description: "The complete wedding experience",
      features: [
        "Everything in Gold Pack",
        "Full Custom Design Service",
        "Advanced Budget & Ledger Dashboard",
        "100 Luxury Printed Cards",
        "100 Custom Printed Cake Boxes",
        "Exclusive VIP Support Line",
      ],
      buttonText: "Get Platinum Pack",
      highlighted: false,
    },
  ];

  const products = [
    {
      title: "Video Booth Rental",
      description:
        "Capture authentic wedding moments with our professional video booth rental services. Includes lighting and custom accessories.",
      features: [
        "Full High-Definition recording",
        "Professional ring lighting setup",
        "Instant social media file sharing",
        "Dedicated attendant on site",
        "Fun custom props & backdrops",
      ],
      icon: <PlayCircle className="w-8 h-8" />,
      image: "/assets/booth.jpg",
      contactNumber: "071 656 1975",
    },
    {
      title: "Wedding Card Printing",
      description:
        "High-end custom wedding card printing services. Exquisite cardstock, gold foiling, and customized themes that stand out.",
      features: [
        "Luxury hot gold foil options",
        "Premium textured cardboards",
        "Tailored thematic design process",
        "Swift shipping and deliveries",
        "Attractive bulk order discounts",
      ],
      icon: <Mail className="w-8 h-8" />,
      image: "/assets/wedding-card.jpg",
      contactNumber: "071 656 1975",
    },
    {
      title: "Wedding Cake Box Printing",
      description:
        "Custom thematic cake boxes to present as wedding souvenirs. Fully aligned with your wedding colors and designs.",
      features: [
        "100% Food-grade premium board",
        "High fidelity offset printing",
        "Custom sized boxes available",
        "Tailored design coordination",
        "Fast bulk production cycles",
      ],
      icon: <Gift className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f",
      contactNumber: "071 656 1975",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-200">
      
      <nav className={`fixed inset-x-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "top-4 mx-auto max-w-7xl px-4 sm:px-6" 
          : "top-0 w-full"
      }`}>
        <div className={`transition-all duration-300 px-6 h-20 flex items-center justify-between ${
          isScrolled 
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-md" 
            : "bg-transparent border-transparent shadow-none"
        }`}>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="eVite Logo"
              width={90}
              height={90}
              className="h-12 w-auto transition-transform hover:scale-105"
              priority
            />
          </Link>

          <div className={`hidden lg:flex items-center gap-8 text-sm font-bold transition-colors duration-300 ${
            isScrolled ? "text-slate-600" : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]"
          }`}>
            <a href="#features" className={`transition-colors relative group py-2 ${
              isScrolled ? "hover:text-purple-600" : "hover:text-purple-300"
            }`}>
              Planner Tools
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-purple-600" : "bg-purple-300"
              }`} />
            </a>
            <a href="#active-events" className={`transition-colors relative group py-2 ${
              isScrolled ? "hover:text-purple-600" : "hover:text-purple-300"
            }`}>
              Active Invites
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-purple-600" : "bg-purple-300"
              }`} />
            </a>
            <a href="#products" className={`transition-colors relative group py-2 ${
              isScrolled ? "hover:text-purple-600" : "hover:text-purple-300"
            }`}>
              Products
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-purple-600" : "bg-purple-300"
              }`} />
            </a>
            <a href="#pricing" className={`transition-colors relative group py-2 ${
              isScrolled ? "hover:text-purple-600" : "hover:text-purple-300"
            }`}>
              Pricing
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-purple-600" : "bg-purple-300"
              }`} />
            </a>
            <a href="#contact" className={`transition-colors relative group py-2 ${
              isScrolled ? "hover:text-purple-600" : "hover:text-purple-300"
            }`}>
              Get In Touch
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-purple-600" : "bg-purple-300"
              }`} />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className={`rounded-xl font-bold transition-all duration-300 ${
                  isScrolled 
                    ? "text-slate-700 hover:text-purple-700 hover:bg-purple-50" 
                    : "text-white hover:text-purple-300 hover:bg-white/10 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]"
                }`}
              >
                Log In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-[#ff604b] hover:bg-[#e65533] text-white rounded-xl shadow-md hover:shadow-lg transition-all font-bold px-5">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Modern High-End Hero Slider Section */}
      <section className="relative h-screen overflow-hidden pt-20">
        <div className="absolute inset-0 bg-slate-950/40 z-10" />
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            className="absolute inset-0 bg-cover bg-center"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              backgroundImage: `url(${slides[currentSlide].image})`,
            }}
          >
            <div className="relative z-20 flex items-center justify-center h-full text-white text-center px-4">
              <div className="max-w-4xl space-y-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/20"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                  Premium Wedding Invite Platform
                </motion.div>
                <motion.h1
                  key={`title-${currentSlide}`}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p
                  key={`desc-${currentSlide}`}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium"
                >
                  {slides[currentSlide].description}
                </motion.p>
                <motion.div
                  key={`button-${currentSlide}`}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4"
                >
                  <Link href={slides[currentSlide].buttonLink}>
                    <Button
                      size="lg"
                      className="bg-white hover:bg-purple-600 text-slate-950 hover:text-white rounded-2xl shadow-xl hover:shadow-purple-500/20 px-8 py-7 text-lg font-bold transition-all gap-2"
                    >
                      {slides[currentSlide].buttonText}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-8 bg-purple-500" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Feature Promotion Section (Wedding Checklist & Budget Calculator Mockups) */}
      <section id="features" className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-purple-600">Advanced Planner Features</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Everything You Need To Plan Seamlessly</h3>
            <p className="text-slate-500 text-lg">
              Beyond elegant digital invites, access state-of-the-art tools directly in your wedding dashboard.
            </p>
          </div>

          <div className="space-y-24">
            
            {/* Feature 1: Digital Wedding Invites (Main) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl inline-block shadow-sm">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Luxury Digital Wedding Invitations
                </h3>
                <p className="text-slate-500 leading-relaxed text-base md:text-lg">
                  Empower your special day with our premium mobile invitation cards. Designed to be mobile-first, elegant, and interactive, guests can view details and RSVP instantly.
                </p>
                <ul className="space-y-3.5">
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Custom music themes & background designs
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Interactive map, RSVP coordination & agenda lists
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Password protected invites & VIP Guest lists
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href="/auth">
                    <Button className="bg-slate-900 hover:bg-purple-600 text-white rounded-xl font-bold gap-2 py-6 px-6">
                      Design Custom Invite
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-7 relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/40 to-indigo-100/40 rounded-3xl blur-3xl -z-10 transform scale-90" />
                <div className="relative border-4 border-slate-900/10 rounded-2xl overflow-hidden shadow-2xl bg-white max-w-md">
                  <Image
                    src="/assets/invite_mockup.png"
                    alt="Digital Invite Mockup"
                    width={500}
                    height={750}
                    className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Feature 2: Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1 relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-3xl blur-3xl -z-10 transform scale-90" />
                <div className="relative border-4 border-slate-900/10 rounded-2xl overflow-hidden shadow-2xl bg-white">
                  <Image
                    src="/assets/checklist_mockup.png"
                    alt="Wedding Checklist Mockup"
                    width={650}
                    height={400}
                    className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl inline-block shadow-sm">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Intelligent Accordion Checklist
                </h3>
                <p className="text-slate-500 leading-relaxed text-base md:text-lg">
                  Organize your wedding targets and tasks in style. Divided into periods (6-12 Months, 3-6 Months, 1 Week before), task descriptions collapse inside elegant accordion tabs to maximize visual clarity.
                </p>
                <ul className="space-y-3.5">
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Visual progress tracking for overall completion
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Independent accordion views & color cards per stage
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Saves automatically to cloud with confetti celebrate
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href="/auth">
                    <Button className="bg-slate-900 hover:bg-purple-600 text-white rounded-xl font-bold gap-2 py-6 px-6">
                      Explore Checklist Dashboard
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature 3: Budget Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl inline-block shadow-sm">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Professional Budget Tracker
                </h3>
                <p className="text-slate-500 leading-relaxed text-base md:text-lg">
                  Keep your finances aligned. Log custom expenses and payments securely, visualised by full-width progress bars. Tracks dues and outstanding vendor commitments automatically in local Rupees.
                </p>
                <ul className="space-y-3.5">
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Payments and Expenses calculated separately
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Mark as Paid instantly updates ledger
                  </li>
                  <li className="flex items-center gap-3 font-semibold text-slate-700">
                    <span className="p-1 bg-purple-100 text-purple-700 rounded-full"><Check className="h-4 w-4" /></span>
                    Due soon dashboard cards flag unpaid payments
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href="/auth">
                    <Button className="bg-slate-900 hover:bg-purple-600 text-white rounded-xl font-bold gap-2 py-6 px-6">
                      Open Budget Tracker
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-7 relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/40 to-indigo-100/40 rounded-3xl blur-3xl -z-10 transform scale-90" />
                <div className="relative border-4 border-slate-900/10 rounded-2xl overflow-hidden shadow-2xl bg-white">
                  <Image
                    src="/assets/budget_mockup.png"
                    alt="Budget Calculator Mockup"
                    width={650}
                    height={400}
                    className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
 {/* Activated Events Section (DYNAMIC) */}
      <section id="active-events" className="py-24 bg-slate-50 border-b border-slate-200/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-purple-600">Active E-Invites</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Activated Wedding Pages</h3>
            <p className="text-slate-500 text-lg">
              Explore dynamic digital invitations hosted live on our platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
              >
                <div className="relative h-60 overflow-hidden shrink-0">
                  <img
                    src={event.imageUrl}
                    alt={"Wedding Page"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Live
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-600 font-extrabold text-xs tracking-wider uppercase">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      Wedding Invite
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-purple-600 transition-colors">
                      {event.bride_name && event.groom_name ? `${event.bride_name} & ${event.groom_name}` : event.title}
                    </h4>
                    {event.date && (
                      <p className="text-slate-400 text-sm flex items-center gap-1.5 font-medium">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <Link href={event.url} target="blank">
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all font-bold">
                      View Sample
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Interactive Products Section */}
      <section id="products" className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-purple-600">Exclusive Add-ons</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Event Printing & Booths</h3>
            <p className="text-slate-500 text-lg">
              Complement your virtual invitations with tactile physical invites and entertainment add-ons.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-6">
                    <div className="flex items-center gap-2.5 text-white">
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                        {product.icon}
                      </div>
                      <h4 className="text-2xl font-extrabold tracking-tight">{product.title}</h4>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 mb-6">
                    <p className="text-slate-500 text-sm leading-relaxed">{product.description}</p>
                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-slate-700 text-sm font-semibold">
                          <Check className="h-4 w-4 text-purple-600 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Button
                      onClick={() => (window.location.href = `tel:${product.contactNumber}`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shrink-0 py-5"
                    >
                      <Phone className="w-4 h-4" />
                      Order Now
                    </Button>
                    <p className="text-slate-400 text-xs font-mono">
                      Call: {product.contactNumber}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-24 bg-slate-50 border-b border-slate-200/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-purple-600">Hosting Packages</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Flexible Pricing Plans</h3>
            <p className="text-slate-500 text-lg">
              Find the perfect combination of planning features and printed card sets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`
                  relative rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300
                  ${plan.highlighted
                    ? "ring-2 ring-purple-600 shadow-xl bg-white scale-102 z-10"
                    : "bg-white border border-slate-200/60 shadow-sm hover:shadow-md"
                  }
                `}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 inset-x-0 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={`p-8 flex-1 flex flex-col justify-between ${plan.highlighted ? "pt-10" : ""}`}>
                  <div>
                    <div className="text-center pb-6 border-b border-slate-100">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h4>
                      <div className="mt-3 flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-extrabold text-slate-800">{plan.price}</span>
                      </div>
                      <p className="text-slate-400 text-sm mt-2 font-medium">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-4 py-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                          <Check className="h-4.5 w-4.5 text-purple-600 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3.5">
                    {plan.name === "Gold Pack" && (
                      <p className="text-slate-400 text-[10px] text-center italic">*Gold Terms Apply</p>
                    )}
                    <Link href="/auth">
                      <Button
                        className={`w-full rounded-xl py-6 font-bold transition-all ${
                          plan.highlighted
                            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/10"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demonstration Section */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-purple-600">Video Walkthrough</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">See How It Works</h3>
            <p className="text-slate-500 text-lg">
              Watch a quick overview of how easily you can customize templates and manage guests.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-slate-950/5 rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50">
              {!isVideoPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40" />
                  <Button
                    size="lg"
                    onClick={() => setIsVideoPlaying(true)}
                    className="relative z-10 rounded-full h-20 w-20 bg-white/95 text-purple-600 hover:bg-white shadow-xl hover:scale-105 transition-transform"
                  >
                    <PlayCircle className="h-12 w-12" />
                  </Button>
                </div>
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/39JNHkLCAek?si=FJQwglYg-xrcyCun"
                  title="eVite lk Product Demonstration"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-purple-600">Contact Team</h2>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-sans">Get in Touch</h3>
              <p className="text-slate-500 text-lg">Have any inquiries? Send us a message.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-5 space-y-6">
                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Email Address</h5>
                    <p className="text-slate-500 text-sm mt-0.5">
                      <a href="mailto:info@evite.lk" className="hover:underline">info@evite.lk</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Phone Line</h5>
                    <p className="text-slate-500 text-sm mt-0.5">
                      <a href="tel:0716561975" className="hover:underline">071 656 1975</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Headquarters</h5>
                    <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">
                      13/3, Pilanduwa, temple road, warakapola.
                    </p>
                  </div>
                </div>
              </div>

              <form className="md:col-span-7 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all"
                />
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6 font-bold shadow-md hover:shadow-lg transition-all">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            <div className="md:col-span-5 space-y-4">
              <Link href="/">
                <Image
                  src="/assets/logo.png"
                  alt="eVite Logo"
                  width={100}
                  height={100}
                  className="h-12 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                eVite.lk is the leading digital wedding invite and smart coordination provider in Sri Lanka. Craft elegant invites, manage guest lists, and track your checklist and budget.
              </p>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h6 className="text-white font-extrabold text-sm uppercase tracking-wider">Quick Navigation</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Planner Tools</a></li>
                <li><a href="#active-events" className="hover:text-white transition-colors">Active Invites</a></li>
                <li><a href="#products" className="hover:text-white transition-colors">Tactile Products</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Hosting Pricing</a></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h6 className="text-white font-extrabold text-sm uppercase tracking-wider">Legal Agreements</h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Scale className="h-4 w-4" />
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} eVite.lk. All rights reserved.</p>
            <div className="flex items-center gap-1.5 font-semibold text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Secure RLS Database Access
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  CalendarIcon,
  UsersIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CheckIcon,
  PlayCircle,
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
  const slides = [
    {
      title: "Create Memorable Events",
      description: "Plan your special moments with style and ease",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
      buttonText: "Start Planning",
      buttonLink: "/auth",
    },
    {
      title: "Wedding Planning Made Simple",
      description: "Organize your dream wedding with our intuitive tools",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      buttonText: "Plan Your Wedding",
      buttonLink: "/auth",
    },
    {
      title: "Celebrate Together",
      description: "Keep your guests informed and engaged",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      buttonText: "Get Started",
      buttonLink: "/auth",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <HeartIcon className="w-6 h-6" />,
      title: "Beautiful Design",
      description: "Create stunning event pages that reflect your style",
    },
    {
      icon: <CalendarIcon className="w-6 h-6" />,
      title: "Easy Planning",
      description: "Manage your events with our intuitive tools",
    },
    {
      icon: <UsersIcon className="w-6 h-6" />,
      title: "Guest Management",
      description: "Track RSVPs and communicate with your guests",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for small events",
      features: [
        "Up to 50 guests",
        "Basic customization",
        "Email invitations",
        "RSVP management",
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "$29",
      description: "Ideal for medium-sized events",
      features: [
        "Up to 200 guests",
        "Advanced customization",
        "Email & WhatsApp invitations",
        "RSVP management",
        "Custom domain",
        "Priority support",
      ],
      buttonText: "Upgrade Now",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "For large-scale events",
      features: [
        "Unlimited guests",
        "Full customization",
        "All communication channels",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
      ],
      buttonText: "Contact Sales",
      highlighted: false,
    },
  ];

  const products = [
    {
      title: "Video Booth Rental",
      description:
        "Make your event memorable with our premium video booth service. Perfect for weddings, parties, and corporate events.",
      features: [
        "High-quality video recording",
        "Professional lighting setup",
        "Instant social media sharing",
        "Dedicated booth attendant",
        "Custom props and backdrops",
      ],
      icon: <PlayCircle className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
      contactNumber: "+94 77 123 4567",
    },
    {
      title: "Wedding Card Printing",
      description:
        "Custom-designed wedding invitations that reflect your style. Choose from our elegant templates or create your own design.",
      features: [
        "Premium paper quality",
        "Custom design service",
        "Wide range of styles",
        "Fast turnaround time",
        "Bulk order discounts",
      ],
      icon: <MailIcon className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
      contactNumber: "+94 77 123 4567",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fcca8d" }}>
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff604b]/50 to-[#fba538]/25 z-10" />
        <Link
          href="/"
          className="absolute top-4 left-4 md:top-8 md:left-8 z-20"
        >
          <Image
            src="/assets/logo.png"
            alt="Logo"
            width={120}
            height={120}
            className="h-16 md:h-20 w-auto"
            priority
          />
        </Link>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundImage: `url(${slides[currentSlide].image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-20 flex items-center justify-center h-full text-white text-center px-4">
              <div className="max-w-3xl">
                <motion.h1
                  key={`title-${currentSlide}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p
                  key={`desc-${currentSlide}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8"
                >
                  {slides[currentSlide].description}
                </motion.p>
                <motion.div
                  key={`button-${currentSlide}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link href={slides[currentSlide].buttonLink}>
                    <Button
                      size="lg"
                      className="bg-white hover:bg-[#ff604b]/90 text-black hover:text-white"
                    >
                      {slides[currentSlide].buttonText}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? "bg-[#fba538]" : "bg-[#fba538]/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create beautiful events and manage your guests with our
              comprehensive suite of tools
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-[#ff604b] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch our quick demo video to see how easy it is to create and
              manage your events
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-black/5 rounded-xl overflow-hidden shadow-xl">
              {!isVideoPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <Button
                    size="lg"
                    onClick={() => setIsVideoPlaying(true)}
                    className="relative z-10 rounded-full h-16 w-16 bg-white/90 text-[#ff604b] hover:bg-white"
                  >
                    <PlayCircle className="h-10 w-10" />
                  </Button>
                </div>
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Product Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
            <div className="mt-8 text-center">
              <Button
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                variant="outline"
                className="bg-white"
              >
                {isVideoPlaying ? "Close Video" : "Watch Demo"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your event needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative rounded-xl overflow-hidden
                  ${
                    plan.highlighted
                      ? "ring-2 ring-[#ff604b] shadow-xl bg-white"
                      : "bg-white shadow-lg"
                  }
                `}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 inset-x-0 bg-[#ff604b] text-white text-xs font-semibold py-1 text-center">
                    MOST POPULAR
                  </div>
                )}
                <Card
                  className={`border-0 h-full flex flex-col ${plan.highlighted ? "pt-6" : ""}`}
                >
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-2 mb-0">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "$0" && (
                        <span className="text-gray-500">/month</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4 text-[#ff604b]" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-[#ff604b] hover:bg-[#ff604b]/90"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enhance your event experience with our premium products and
              services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <div className="flex items-center gap-2 mb-2">
                        {product.icon}
                        <h3 className="text-2xl font-bold">{product.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <CheckIcon className="h-4 w-4 text-[#ff604b]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Button
                      className="w-full sm:w-auto bg-[#ff604b] hover:bg-[#ff604b]/90"
                      onClick={() =>
                        (window.location.href = `tel:${product.contactNumber}`)
                      }
                    >
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      Call to Order
                    </Button>
                    <p className="text-gray-600 text-sm">
                      Contact us at: {product.contactNumber}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-600">
                Have questions? We'd love to hear from you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <MailIcon className="w-6 h-6 text-[#ff604b]" />
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-gray-600">
                      <a href="mailto:info@evite.lk">info@evite.lk</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <PhoneIcon className="w-6 h-6 text-[#ff604b]" />
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-gray-600">
                      <a href="tel:+94771234567">+94 77 123 4567</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPinIcon className="w-6 h-6 text-[#ff604b]" />
                  <div>
                    <h4 className="font-semibold">Location</h4>
                    <p className="text-gray-600">
                      13/3, Pilanduwa, temple road, warakapola.
                    </p>
                  </div>
                </div>
              </div>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff604b]"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff604b]"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff604b]"
                />
                <Button className="w-full bg-[#ff604b] hover:bg-[#ff604b]/90">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

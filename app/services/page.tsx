"use client";

import { motion } from "framer-motion";
import { Server, Cloud, Shield, Video, Paintbrush, VideoIcon } from "lucide-react";
import CallToAction from "@/components/CallToAction";

const servicesList = [
  {
    icon: Server,
    title: "Enterprise Networking",
    description: "Robust, high-speed physical network infrastructure designed for massive data loads with 99.99% uptime guarantees.",
    delay: 0.1
  },
  {
    icon: Cloud,
    title: "Cloud Architecture",
    description: "Seamless on-premise to cloud migrations, containerization with Docker/Kubernetes, and scalable AWS/Azure solutions.",
    delay: 0.2
  },
  {
    icon: Shield,
    title: "Cybersecurity & Data Protection",
    description: "End-to-end encryption, regular penetration testing, and secure access protocols to safeguard your enterprise data.",
    delay: 0.3
  },
  {
    icon: Video,
    title: "High-End Media Production",
    description: "Cinematic commercial shoots, brand films, and promotional content using state-of-the-art camera equipment.",
    delay: 0.4
  },
  {
    icon: Paintbrush,
    title: "Brand Identity & UX UI",
    description: "Cutting-edge interface designs, logo creation, and comprehensive brand guidelines that resonate with a digital-first audience.",
    delay: 0.5
  },
  {
    icon: VideoIcon,
    title: "3D & Motion Graphics",
    description: "Immersive 3D environments, animated marketing assets, and interactive web experiences built with WebGL and Framer Motion.",
    delay: 0.6
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black pt-12">
      {/* Header */}
      <section className="py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black opacity-60" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tighter mb-6 text-white"
          >
            Our <span className="text-cyan-400">Services</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Bridging the gap between heavy-duty ICT infrastructure and stunning creative media.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div 
          className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 group/grid"
          onMouseMove={(e) => {
            const cards = document.getElementsByClassName("hover-spotlight");
            for (let i = 0; i < cards.length; i++) {
              const card = cards[i] as HTMLElement;
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              card.style.setProperty("--mouse-x", `${x}px`);
              card.style.setProperty("--mouse-y", `${y}px`);
            }
          }}
        >
          {servicesList.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: service.delay }}
                className="hover-spotlight relative glass p-8 rounded-2xl border border-white/5 transition-colors group cursor-pointer overflow-hidden z-10"
              >
                {/* Spotlight Gradient */}
                <div 
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover/grid:opacity-100"
                  style={{
                    background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(0, 255, 255, 0.15), transparent 40%)",
                    zIndex: -1
                  }}
                />
                <div 
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                  style={{
                    border: "1px solid transparent",
                    background: "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(176, 38, 255, 0.5), transparent 40%) border-box",
                    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    zIndex: -1
                  }}
                />
                
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform relative z-10">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white mb-4 relative z-10">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed relative z-10">{service.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <CallToAction />
    </div>
  );
}

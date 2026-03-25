"use client";

import { motion } from "framer-motion";
import { Building2, Briefcase, Frame, Hexagon, Component, AudioWaveform } from "lucide-react";

// Using Lucide icons as placeholder logos for "people we worked with"
const clients = [
  { name: "TechCorp", icon: Building2 },
  { name: "GlobalMedia", icon: Briefcase },
  { name: "StudioX", icon: Frame },
  { name: "Nexus", icon: Hexagon },
  { name: "Apex Solutions", icon: Component },
  { name: "Wave Form", icon: AudioWaveform },
];

export default function ClientLogos() {
  return (
    <section className="py-24 bg-black border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm uppercase tracking-widest text-gray-500 mb-12"
        >
          People We Have Worked With
        </motion.p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {clients.map((client, index) => {
            const Icon = client.icon;
            return (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <Icon className="w-8 h-8 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                <span className="text-xl font-display font-bold text-gray-400 group-hover:text-white transition-colors">
                  {client.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

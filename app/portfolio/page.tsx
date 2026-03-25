"use client";

import { motion } from "framer-motion";
import PortfolioPreview from "@/components/PortfolioPreview";
import CallToAction from "@/components/CallToAction";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black pt-12">
      {/* Header */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black opacity-60" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tighter mb-6 text-white"
          >
            Digital <span className="text-purple-400">Portfolio</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            A curated selection of our finest ICT installations and creative media campaigns.
          </motion.p>
        </div>
      </section>

      {/* Portfolio Grid relies on the PortfolioPreview component we already built */}
      <div className="-mt-16">
        <PortfolioPreview />
      </div>

      <CallToAction />
    </div>
  );
}

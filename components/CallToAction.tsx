"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-1/2 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass border border-cyan-500/20 rounded-3xl p-10 md:p-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6">
            Ready to upgrade your infrastructure?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Whether you need enterprise-grade networking or cutting-edge digital media, we're ready to build the future of your business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contact"
              className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Let's Talk <Send className="w-4 h-4" />
            </Link>
            <Link 
              href="/services"
              className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto group"
            >
              View Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

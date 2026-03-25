"use client";

import { motion } from "framer-motion";

const stats = [
  { id: 1, name: "Uptime Guarantee", value: "99.9%" },
  { id: 2, name: "Enterprise Clients", value: "50+" },
  { id: 3, name: "Projects Delivered", value: "200+" },
  { id: 4, name: "Support Available", value: "24/7" },
];

export default function Stats() {
  return (
    <section className="py-20 bg-black border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black opacity-50" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-gray-400 font-medium tracking-wide">
                {stat.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

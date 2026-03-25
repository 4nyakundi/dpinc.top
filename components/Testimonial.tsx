"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "DATA PORT completely transformed our IT infrastructure. Their team's expertise in handling our cloud migration was flawless, resulting in zero downtime.",
    author: "Sarah Jenkins",
    role: "CTO, TechCorp",
  },
  {
    id: 2,
    content: "The level of creativity they bring to digital media is unmatched. They built a 3D web experience that skyrocketed our user engagement by 300%.",
    author: "David Chen",
    role: "Marketing Director, StudioX",
  },
  {
    id: 3,
    content: "Reliable, secure, and blazing fast. The enterprise network they deployed for our headquarters exceeded all our expectations.",
    author: "Elena Rodriguez",
    role: "Operations Manager, Nexus",
  },
];

export default function Testimonial() {
  return (
    <section className="py-24 bg-black relative border-y border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-white mb-4">
            Hear from our <span className="text-cyan-400">Partners</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what industry leaders have to say about our ICT and creative services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-8 rounded-2xl relative"
            >
              <Quote className="w-10 h-10 text-purple-500/30 absolute top-6 right-6" />
              <p className="text-gray-300 mb-8 relative z-10 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <h4 className="text-white font-bold tracking-wide">{testimonial.author}</h4>
                <p className="text-cyan-400 text-sm mt-1">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

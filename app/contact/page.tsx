"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await addDoc(collection(db, "contactSubmissions"), {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        source: "website",
        createdAt: serverTimestamp(),
      });
      form.reset();
      setStatus("success");
    } catch (error) {
      console.error("Unable to submit contact form", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter mb-6 text-white">
            Get in <span className="text-cyan-400">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ready to start your next project? Fill out the form below or reach us directly at our global headquarters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            <div>
              <h3 className="text-3xl font-bold font-display text-white mb-8">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full glass flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Our Headquarters</h4>
                    <p className="text-gray-400">Mombasa Mall<br/>Along Jomo Kenyatta Road, Mombasa</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full glass flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Phone</h4>
                    <p className="text-gray-400">0790964002 / 0724659389<br/>Mon-Sat, 8am - 6pm EAT</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full glass flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Email</h4>
                    <p className="text-gray-400">dpinc.top@gmail.com<br/>support@dpinc.top</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <form className="relative z-10 flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Name</label>
                <input 
                  name="name"
                  type="text" 
                  required
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Email</label>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="john@company.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Message</label>
                <textarea 
                  name="message"
                  rows={5}
                  required
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>

              <button disabled={isSubmitting} className="mt-4 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full group disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Sending..." : "Send Message"} <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {status === "success" && (
                <p role="status" className="text-sm text-cyan-400">Thanks for reaching out. We&apos;ll be in touch soon.</p>
              )}
              {status === "error" && (
                <p role="alert" className="text-sm text-red-400">We couldn&apos;t send your message. Please try again.</p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Globe, ArrowRight, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-zinc-50 dark:bg-black min-h-screen text-zinc-900 dark:text-white pt-32 pb-24 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="max-w-5xl mx-auto px-6 text-center mb-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                        <span className="text-sm font-mono text-pink-700 dark:text-pink-300 font-medium tracking-wide">SYSTEM OPEN FOR COMMS</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Touch</span>
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Ready to integrate Data Port into your operations? Reach out below for tailored infrastructure and software solutions.
                    </p>
                </motion.div>
                
                {/* Background Tech Element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] -z-10"></div>
            </header>

            <section className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Contact Information Cards */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-pink-500/30 transition-all shadow-lg dark:shadow-none relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
                        <h3 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                            Communications
                        </h3>

                        <div className="space-y-8">
                            {/* Phone */}
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl border border-pink-100 dark:border-pink-500/20 text-pink-500 flex-shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Direct Line</p>
                                    <a href="tel:0790964002" className="text-lg md:text-xl font-medium text-zinc-800 dark:text-white hover:text-pink-500 transition-colors">
                                        0790 964 002
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl border border-cyan-100 dark:border-cyan-500/20 text-cyan-500 flex-shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Email Links</p>
                                    <div className="flex flex-col gap-2 shadow-sm dark:shadow-none">
                                        <a href="mailto:support@dpinc.top" className="text-lg font-medium text-zinc-800 dark:text-white hover:text-cyan-500 transition-colors">
                                            support@dpinc.top
                                        </a>
                                        <a href="mailto:dpinc.top@gmail.com" className="text-md text-zinc-600 dark:text-gray-300 hover:text-cyan-500 transition-colors">
                                            dpinc.top@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-100 dark:border-purple-500/20 text-purple-500 flex-shrink-0">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Domain</p>
                                    <a href="https://dpinc.top" target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-zinc-800 dark:text-white hover:text-purple-500 transition-colors">
                                        www.dpinc.top
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-cyan-500/30 transition-all shadow-lg dark:shadow-none relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
                        <h3 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                            Headquarters
                        </h3>

                        <div className="space-y-8">
                            {/* Location */}
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl border border-cyan-100 dark:border-cyan-500/20 text-cyan-500 flex-shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Physical Address</p>
                                    <p className="text-lg font-medium text-zinc-800 dark:text-white leading-relaxed">
                                        Mombasa Mall<br/>
                                        <span className="text-zinc-600 dark:text-gray-400 font-light">Along Jomo Kenyatta Avenue</span>
                                    </p>
                                </div>
                            </div>
                            
                            {/* Hours */}
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-500 flex-shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Operating Hours</p>
                                    <div className="space-y-1">
                                        <p className="text-lg font-medium text-zinc-800 dark:text-white flex items-center justify-between">
                                            <span>8:30 AM - 4:30 PM</span>
                                            <span className="ml-2 text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md uppercase font-bold">Open</span>
                                        </p>
                                        <p className="text-sm text-zinc-600 dark:text-gray-400 font-light border-l-2 border-emerald-500/50 pl-3">
                                            Remote Support available until 9:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Secure Messaging Form */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full lg:w-1/2 p-8 md:p-12 rounded-3xl bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 shadow-2xl dark:shadow-none relative overflow-hidden"
                >
                    {/* Tech Background Lines */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                    
                    <div className="mb-10">
                        <h3 className="text-3xl font-bold mb-3 text-zinc-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
                            <span className="text-purple-500">&gt;</span> Secure Dispatch
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-light">Enter your query below to route a direct message to our support systems.</p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe" 
                                    className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-light"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Email</label>
                                <input 
                                    type="email" 
                                    placeholder="john@company.com" 
                                    className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-light"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Subject</label>
                            <input 
                                type="text" 
                                placeholder="Infrastructure Inquiry" 
                                className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-light"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Data Packet (Message)</label>
                            <textarea 
                                rows={5}
                                placeholder="Describe your operational needs..." 
                                className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-light resize-none"
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            className="w-full group relative px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl transition-all flex justify-center items-center gap-2 overflow-hidden hover:scale-[1.02] active:scale-95 border-none mt-4"
                        >
                            <span className="relative z-10 flex items-center gap-2 uppercase tracking-wide">
                                Transmit Request
                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {/* Hover Gradient */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white z-10 gap-2 uppercase tracking-wide">
                                Transmit Request
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </span>
                        </button>
                    </form>
                </motion.div>
            </section>
        </div>
    );
}

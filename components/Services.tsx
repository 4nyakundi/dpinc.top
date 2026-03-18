"use client";

import { motion } from "framer-motion";
import { Network, ShieldCheck, Database, Code, RefreshCw, Globe, PlaySquare, PenTool } from "lucide-react";

export default function Services() {
    return (
        <section className="py-32 px-6 relative bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300" id="services">
            {/* Tech grid bottom */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-[1px] w-8 bg-purple-500"></div>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-medium uppercase tracking-widest text-sm">Capabilities</span>
                        <div className="h-[1px] w-8 bg-purple-500"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Solutions</span>
                    </h2>
                    <p className="text-xl text-zinc-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
                        We streamline our services into three core pillars to cover all your operational needs across the technological spectrum.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                    {/* Infrastructure & Security */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="bg-white dark:bg-black border border-zinc-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/50 p-8 rounded-3xl transition-all hover:shadow-[0_10px_40px_rgba(6,182,212,0.1)] group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                        
                        <div className="w-16 h-16 bg-cyan-50 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-transparent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm dark:shadow-none border border-cyan-100 dark:border-transparent">
                            <Network className="text-cyan-600 dark:text-cyan-400 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                            Infrastructure
                        </h3>
                        <ul className="space-y-6 text-zinc-600 dark:text-gray-400 font-light">
                            <li className="flex gap-4 group/item">
                                <Network className="w-6 h-6 flex-shrink-0 text-cyan-600 dark:text-cyan-500 group-hover/item:text-cyan-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">Network Design:</strong> Secure WiFi, firewall implementation, and structured cabling for reliable connectivity.</span>
                            </li>
                            <li className="flex gap-4 group/item">
                                <ShieldCheck className="w-6 h-6 flex-shrink-0 text-cyan-600 dark:text-cyan-500 group-hover/item:text-cyan-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">CCTV Systems:</strong> Installation of high-definition remote-view cameras to secure your premises.</span>
                            </li>
                            <li className="flex gap-4 group/item">
                                <Database className="w-6 h-6 flex-shrink-0 text-cyan-600 dark:text-cyan-500 group-hover/item:text-cyan-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">Disaster Recovery:</strong> Automated backup solutions to mitigate data loss and ensure continuity.</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Software & Development */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white dark:bg-black border border-zinc-200 dark:border-white/5 hover:border-purple-500/30 dark:hover:border-purple-500/50 p-8 rounded-3xl transition-all hover:shadow-[0_10px_40px_rgba(168,85,247,0.1)] group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="w-16 h-16 bg-purple-50 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-transparent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm dark:shadow-none border border-purple-100 dark:border-transparent">
                            <Code className="text-purple-600 dark:text-purple-400 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                            Software & DevOps
                        </h3>
                        <ul className="space-y-6 text-zinc-600 dark:text-gray-400 font-light">
                            <li className="flex gap-4 group/item">
                                <Code className="w-6 h-6 flex-shrink-0 text-purple-600 dark:text-purple-500 group-hover/item:text-purple-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">Custom Apps:</strong> Tailored software solutions to automate your specific business processes.</span>
                            </li>
                            <li className="flex gap-4 group/item">
                                <RefreshCw className="w-6 h-6 flex-shrink-0 text-purple-600 dark:text-purple-500 group-hover/item:text-purple-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">DevOps:</strong> Continuous integration and delivery (CI/CD) to keep infrastructure scalable.</span>
                            </li>
                            <li className="flex gap-4 group/item">
                                <Globe className="w-6 h-6 flex-shrink-0 text-purple-600 dark:text-purple-500 group-hover/item:text-purple-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">Web Development:</strong> Dynamic, mobile-responsive websites with high-performance security.</span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Creative & Marketing */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="bg-white dark:bg-black border border-zinc-200 dark:border-white/5 hover:border-pink-500/30 dark:hover:border-pink-500/50 p-8 rounded-3xl transition-all hover:shadow-[0_10px_40px_rgba(236,72,153,0.1)] group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 dark:bg-pink-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="w-16 h-16 bg-pink-50 dark:bg-gradient-to-br dark:from-pink-500/20 dark:to-transparent rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm dark:shadow-none border border-pink-100 dark:border-transparent">
                            <PlaySquare className="text-pink-600 dark:text-pink-400 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                            Creative & Media
                        </h3>
                        <ul className="space-y-6 text-zinc-600 dark:text-gray-400 font-light">
                            <li className="flex gap-4 group/item">
                                <PlaySquare className="w-6 h-6 flex-shrink-0 text-pink-600 dark:text-pink-500 group-hover/item:text-pink-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">Motion Graphics:</strong> High-retention advertisement videos for social media and digital displays.</span>
                            </li>
                            <li className="flex gap-4 group/item">
                                <PenTool className="w-6 h-6 flex-shrink-0 text-pink-600 dark:text-pink-500 group-hover/item:text-pink-400 transition-colors" />
                                <span><strong className="text-zinc-900 dark:text-white font-medium">Digital Branding:</strong> Visual identity and engaging content creation to capture your audience.</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

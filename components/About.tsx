"use client";

import { motion } from "framer-motion";

export default function About() {
    return (
        <section className="py-32 px-6 relative bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300 overflow-hidden" id="about">
            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] w-12 bg-cyan-500"></div>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-medium uppercase tracking-widest text-sm">About Data Port</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight">
                        Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">We Are</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-600 dark:text-gray-300 leading-relaxed mb-6 font-light">
                        Data Port Limited offers innovative technical solutions and services for the advancement of the human race. We pride ourselves in giving exceptional solutions and services in software integration. Established in 2022, Data Port has built a reputation for delivering exceptional high-quality and cost-effective ICT solutions to different clients in all sectors.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-20 relative p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 overflow-hidden group hover:border-purple-500/50 transition-colors"
                >
                    {/* Inner glowing effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400 font-mono tracking-tight flex items-center gap-2">
                            <span className="text-purple-400">#</span> Executive Summary
                        </h3>
                        <p className="text-lg text-zinc-600 dark:text-gray-300 leading-relaxed mb-10 font-light border-l-2 border-purple-500 pl-6">
                            Data Port Limited is a full-service technology partner dedicated to modernizing businesses through integrated ICT solutions and creative digital media. Unlike traditional IT firms, we blend hard infrastructure (Networks, CCTV) with creative development (Apps, Video Graphics), ensuring your business is not just running, but growing.
                        </p>
                        
                        <h4 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-3 font-mono tracking-tight flex items-center gap-2">
                            <span className="text-cyan-400">#</span> Our Mission
                        </h4>
                        <p className="text-lg text-zinc-600 dark:text-gray-300 leading-relaxed font-light border-l-2 border-cyan-500 pl-6 bg-zinc-100 dark:bg-black/30 p-4 rounded-r-xl">
                            To provide direct, high-impact technical and creative services that drive efficiency and visibility for our clients.
                        </p>
                    </div>
                </motion.div>
            </div>
            
            {/* Background embellishments */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-100/50 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-100/50 dark:bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2 transition-colors duration-500" />
        </section>
    );
}

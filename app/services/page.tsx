"use client";

import { motion } from "framer-motion";
import { Network, ShieldCheck, Database, Code, RefreshCw, Globe, PlaySquare, PenTool, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
    return (
        <div className="bg-zinc-50 dark:bg-black min-h-screen text-zinc-900 dark:text-white pt-32 pb-24 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="max-w-5xl mx-auto px-6 text-center mb-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        <span className="text-sm font-mono text-purple-700 dark:text-purple-300 font-medium">Core Capabilities</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">Tech Solutions</span>
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Data Port Limited streamlines its diverse technical offerings into three highly specialized core pillars, ensuring your business is fully supported from physical infrastructure to digital dominance.
                    </p>
                </motion.div>
                
                {/* Background glowing orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10"></div>
            </header>

            {/* Pillar 1: Infrastructure */}
            <section className="max-w-7xl mx-auto px-6 mb-32 relative">
                <div className="absolute -left-[300px] top-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-200 dark:border-cyan-500/20">
                            <Network className="text-cyan-600 dark:text-cyan-400 w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Infrastructure & <span className="text-cyan-600 dark:text-cyan-400">Security</span></h2>
                        <p className="text-lg text-zinc-600 dark:text-gray-300 mb-8 font-light leading-relaxed">
                            The foundation of any modern enterprise is its hardware and connectivity. We design fault-tolerant, high-speed networks and pair them with uncompromising physical security systems to ensure your operations never skip a beat.
                        </p>
                        
                        <div className="space-y-6">
                            <ServiceDetail 
                                icon={<Network className="w-6 h-6 text-cyan-500" />}
                                title="Network Design & Maintenance"
                                desc="We implement structured cabling, high-capacity secure WiFi networks, and robust firewall configurations tailored for seamless, reliable connectivity across your entire workspace."
                            />
                            <ServiceDetail 
                                icon={<ShieldCheck className="w-6 h-6 text-cyan-500" />}
                                title="Surveillance Systems (CCTV)"
                                desc="State-of-the-art high-definition camera installations featuring real-time remote-viewing capabilities, motion analytics, and encrypted local/cloud storage for total premises security."
                            />
                            <ServiceDetail 
                                icon={<Database className="w-6 h-6 text-cyan-500" />}
                                title="Disaster Recovery"
                                desc="Automated, redundant data backup solutions spanning local drives to encrypted cloud vaults, designed specifically to mitigate critical data loss and guarantee instant business continuity."
                            />
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[600px] rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl dark:shadow-none"
                    >
                        {/* Abstract Tech Graphic for Infrastructure */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 relative z-10">
                            <div className="w-32 h-32 border-2 border-cyan-500/30 rounded-full flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-2 border-2 border-dashed border-cyan-500/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                <ShieldCheck className="w-12 h-12 text-cyan-500" />
                            </div>
                            <h3 className="text-2xl font-bold font-mono tracking-widest text-zinc-900 dark:text-white uppercase">Secure. Formidable.</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-4">99.99% Uptime SLA on Managed Networks</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pillar 2: Software & DevOps */}
            <section className="max-w-7xl mx-auto px-6 mb-32 relative">
                <div className="absolute -right-[300px] top-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[600px] rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl dark:shadow-none order-2 lg:order-1"
                    >
                        {/* Abstract Tech Graphic for Software */}
                        <div className="absolute inset-0 flex flex-col justify-around opacity-20">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex">
                                    <motion.div 
                                        animate={{ x: ["-100%", "2000%"] }} 
                                        transition={{ duration: 3 + i, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                                        className="w-16 h-full bg-purple-400"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 relative z-10">
                            <div className="w-32 h-32 border-2 border-purple-500/30 rounded-2xl flex items-center justify-center mb-8 rotate-45 hover:rotate-0 transition-transform duration-500 bg-white dark:bg-black">
                                <Code className="w-12 h-12 text-purple-600 dark:text-purple-400 -rotate-45" />
                            </div>
                            <h3 className="text-2xl font-bold font-mono tracking-widest text-zinc-900 dark:text-white uppercase">Scalable. Agile.</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-4">Accelerated Build-to-Deploy Pipelines</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-200 dark:border-purple-500/20">
                            <Code className="text-purple-600 dark:text-purple-400 w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Software & <span className="text-purple-600 dark:text-purple-400">DevOps</span></h2>
                        <p className="text-lg text-zinc-600 dark:text-gray-300 mb-8 font-light leading-relaxed">
                            Automation and scalable architecture are the engines of modern growth. We build bespoke applications specifically designed around your unique business processes, deployed securely via bleeding-edge CI/CD pipelines.
                        </p>
                        
                        <div className="space-y-6">
                            <ServiceDetail 
                                icon={<Code className="w-6 h-6 text-purple-500" />}
                                title="Custom Application Development"
                                desc="From internal enterprise tools to client-facing portals, our tailored software solutions automate redundant tasks, integrate isolated systems, and unlock profound operational efficiency."
                            />
                            <ServiceDetail 
                                icon={<RefreshCw className="w-6 h-6 text-purple-500" />}
                                title="DevOps & Integration"
                                desc="We establish robust continuous integration and continuous delivery (CI/CD) pipelines inside advanced cloud architectures, guaranteeing your software remains healthy, updateable, and endlessly scalable."
                            />
                            <ServiceDetail 
                                icon={<Globe className="w-6 h-6 text-purple-500" />}
                                title="Advanced Web Development"
                                desc="Creation of lightning-fast, reactive, and entirely mobile-responsive web platforms leveraging modern frameworks, bundled with strict SSL and data security compliance measures."
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pillar 3: Creative & Marketing */}
            <section className="max-w-7xl mx-auto px-6 mb-24 relative">
                <div className="absolute -left-[300px] top-0 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 border border-pink-200 dark:border-pink-500/20">
                            <PlaySquare className="text-pink-600 dark:text-pink-400 w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Creative & <span className="text-pink-600 dark:text-pink-400">Marketing</span></h2>
                        <p className="text-lg text-zinc-600 dark:text-gray-300 mb-8 font-light leading-relaxed">
                            Having robust infrastructure and flawless software is only half the battle; people need to know you exist. Our creative media division produces striking visuals that engage targets and define brands uniquely in the digital space.
                        </p>
                        
                        <div className="space-y-6">
                            <ServiceDetail 
                                icon={<PlaySquare className="w-6 h-6 text-pink-500" />}
                                title="Video Motion Graphics"
                                desc="Data Port designs high-retention, hyper-engaging advertisement videos optimized for social media feeds and large digital display systems to capture and hold audience attention."
                            />
                            <ServiceDetail 
                                icon={<PenTool className="w-6 h-6 text-pink-500" />}
                                title="Digital Branding & Strategy"
                                desc="We breathe life into raw data by forging compelling visual identities, modern UI/UX digital branding components, and content that resonates perfectly with your target demographics."
                            />
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative h-[600px] rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl dark:shadow-none"
                    >
                        {/* Abstract Tech Graphic for Creative */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent"></div>
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[1px] border-pink-500/30 rounded-3xl"
                        ></motion.div>
                        <motion.div 
                            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-[1px] border-pink-400/20 rounded-full"
                        ></motion.div>

                        <div className="flex flex-col items-center justify-center h-full text-center p-8 relative z-10">
                            <div className="w-32 h-32 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center mb-8 backdrop-blur-md">
                                <PlaySquare className="w-12 h-12 text-pink-500 fill-pink-500/20" />
                            </div>
                            <h3 className="text-2xl font-bold font-mono tracking-widest text-zinc-900 dark:text-white uppercase">Vibrant. Engaging.</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-4">Data-Driven Attention Capture</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl mx-auto px-6 text-center">
                <div className="p-12 rounded-3xl bg-gradient-to-r from-zinc-900 to-black dark:from-zinc-900 dark:to-zinc-900 border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-none">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to Modernize Your Operations?</h2>
                    <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                        Whether you need a massive infrastructure overhaul, a custom application, or an engaging motion graphics ad, Data Port has the expertise.
                    </p>
                    <Link
                        href="/quote"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full transition-all hover:scale-105"
                    >
                        Generate a Quote
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function ServiceDetail({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-4 group bg-white dark:bg-transparent p-4 md:p-6 rounded-2xl border border-transparent dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
            <div className="flex-shrink-0 mt-1 p-2 bg-zinc-50 dark:bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{title}</h4>
                <p className="text-zinc-600 dark:text-gray-400 font-light leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FolderGit2, Video, Database, Network } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const projects = [
    {
        id: "corporate-infra",
        title: "Enterprise Headquarters Build-Out",
        category: "Infrastructure & Security",
        icon: <Network className="w-6 h-6 text-cyan-500" />,
        color: "cyan",
        tags: ["Structured Cabling", "Secure WiFi", "HD CCTV", "Disaster Recovery"],
        description: "A complete technological fit-out for a newly constructed 3-story corporate office. Data Port engineered a fault-tolerant secure WiFi system covering 50,000 sq ft, installed 40 HD remote-view CCTV cameras, and integrated automated local-to-cloud backup servers to guarantee zero downtime.",
    },
    {
        id: "logistics-app",
        title: "Global Supply Chain Management Portal",
        category: "Software & DevOps",
        icon: <Database className="w-6 h-6 text-purple-500" />,
        color: "purple",
        tags: ["Custom Web App", "Next.js", "CI/CD Pipeline", "Data Automation"],
        description: "Developed a bespoke logistics web application allowing a global freight carrier to automate dispatch, track international shipments in real-time, and generate automated invoicing. The system is hosted securely with a continuous integration DevOps pipeline ensuring seamless updates.",
    },
    {
        id: "retail-motion",
        title: "Neo-Retail Brand Launch",
        category: "Creative & Marketing",
        icon: <Video className="w-6 h-6 text-pink-500" />,
        color: "pink",
        tags: ["Motion Graphics", "Digital Branding", "Social Media"],
        description: "Conceptualized and executed a high-energy motion graphics advertising campaign for an e-commerce startup. Deliverables included 15-second hyper-engaging video segments for Instagram/TikTok and a comprehensive digital visual identity that drove a 300% increase in initial user acquisition.",
    },
    {
        id: "education-portal",
        title: "University Learning & Analytics System",
        category: "Integrated Solutions (Software + Infra)",
        icon: <FolderGit2 className="w-6 h-6 text-emerald-500" />,
        color: "emerald",
        tags: ["Web Development", "Server Configuration", "SSL Security"],
        description: "A hybrid project encompassing both on-prem server installation and custom web application development. Data Port delivered a dynamic, mobile-responsive student portal secured with strict SSL standards, backed by a powerful local server array we configured on campus.",
    }
];

export default function PortfolioPage() {
    return (
        <div className="bg-zinc-50 dark:bg-black min-h-screen text-zinc-900 dark:text-white pt-32 pb-24 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="max-w-7xl mx-auto px-6 text-center mb-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                     <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        <span className="text-sm font-mono text-cyan-700 dark:text-cyan-300 font-medium">Proven Track Record</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Portfolio</span>
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Explore our successful case studies demonstrating how Data Port blends hard infrastructure with creative software development to drive massive business growth.
                    </p>
                </motion.div>
                
                {/* Background Tech Elements */}
                <div className="absolute top-0 right-10 w-px h-32 bg-gradient-to-b from-transparent to-purple-500/50"></div>
                <div className="absolute top-10 left-10 w-32 h-px bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            </header>

            {/* Portfolio Grid */}
            <section className="max-w-7xl mx-auto px-6 mb-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 hover:border-zinc-300 dark:hover:border-white/20 transition-colors group shadow-lg dark:shadow-none"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${project.color}-50 dark:bg-${project.color}-500/10 border border-${project.color}-200 dark:border-${project.color}-500/20`}>
                                    {project.icon}
                                </div>
                                <div className="text-sm font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest pt-2">
                                    {project.category}
                                </div>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {project.title}
                            </h3>
                            
                            <p className="text-zinc-600 dark:text-gray-400 font-light leading-relaxed mb-8">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {project.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-md text-xs font-mono font-medium bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                Discuss Similar Project
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Glowing Backdrop */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] pointer-events-none -z-20 overflow-hidden">
                 <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]"></div>
                 <div className="absolute bottom-0 left-[20%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]"></div>
            </div>
        </div>
    );
}

"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Server, Cpu, Code2, Database } from "lucide-react";

export default function Hero() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 200;
            const y = (e.clientY / innerHeight - 0.5) * 200;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-black transition-colors duration-300">
            {/* Techie Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Glowing Orb */}
            <motion.div
                style={{ x: smoothX, y: smoothY, translateX: "-50%", translateY: "-50%" }}
                className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"
            />

            {/* Animated Data Lines (Vertical) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ y: ["-100%", "100%"] }} 
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-[15%] w-[1px] h-[300px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" 
                />
                <motion.div 
                    animate={{ y: ["-100%", "100%"] }} 
                    transition={{ duration: 7, delay: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute right-[20%] w-[1px] h-[400px] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" 
                />
                <motion.div 
                    animate={{ y: ["-100%", "100%"] }} 
                    transition={{ duration: 6, delay: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute left-[70%] w-[1px] h-[250px] bg-gradient-to-b from-transparent via-pink-500/50 to-transparent" 
                />
            </div>

            {/* Floating Tech Icons */}
            <FloatingElement delay={0} x={-250} y={-100} rotate={10}>
                <div className="p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-none hidden lg:block">
                    <Server className="text-cyan-600 dark:text-cyan-400 w-12 h-12" />
                </div>
            </FloatingElement>
            <FloatingElement delay={1} x={300} y={-50} rotate={-15}>
                <div className="p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-none hidden lg:block">
                    <Globe className="text-purple-600 dark:text-purple-400 w-16 h-16" />
                </div>
            </FloatingElement>
            <FloatingElement delay={2} x={-200} y={200} rotate={20}>
                <div className="p-3 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-none hidden lg:block">
                    <Cpu className="text-pink-600 dark:text-pink-400 w-10 h-10" />
                </div>
            </FloatingElement>
            <FloatingElement delay={3} x={250} y={250} rotate={-10}>
                <div className="p-3 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-xl border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-none hidden lg:block">
                    <Code2 className="text-emerald-600 dark:text-emerald-400 w-8 h-8" />
                </div>
            </FloatingElement>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 text-zinc-900 dark:text-white uppercase">
                        DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">PORT</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex justify-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">System Online • v2.0.4</span>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-xl md:text-3xl text-zinc-600 dark:text-gray-300 mb-12 font-light max-w-3xl mx-auto"
                >
                    High-End <strong className="font-semibold text-purple-600 dark:text-purple-400">ICT Infrastructure</strong> &{" "}
                    <strong className="font-semibold text-cyan-600 dark:text-cyan-400">Creative Media</strong> Services.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link
                        href="/quote"
                        className="group relative px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-full transition-all flex items-center gap-2 overflow-hidden hover:scale-105 active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get a Quote
                            <ArrowRight className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform duration-300" />
                        </span>
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white z-10 gap-2">
                            Get a Quote
                            <ArrowRight className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform duration-300" />
                        </span>
                    </Link>
                    <Link
                        href="#services"
                        className="group px-8 py-4 border border-zinc-300 dark:border-white/20 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-all backdrop-blur-sm flex items-center gap-2"
                    >
                        Explore Services
                        <Database className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-purple-500 transition-colors" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function FloatingElement({
    children,
    delay = 0,
    x = 0,
    y = 0,
    rotate = 0,
}: {
    children: React.ReactNode;
    delay?: number;
    x?: number;
    y?: number;
    rotate?: number;
}) {
    return (
        <motion.div
            initial={{ x, y, rotate, opacity: 0 }}
            animate={{
                y: [y, y - 30, y],
                opacity: 1,
            }}
            transition={{
                y: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay,
                },
                opacity: { duration: 1 },
            }}
            className="absolute hidden md:block"
        >
            {children}
        </motion.div>
    );
}

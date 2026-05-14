"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Logo from "@/components/Logo";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Quote Generator", href: "/quote" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300">
            <div className="max-w-7xl mx-auto bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-between px-6 py-3 transition-colors duration-300 shadow-sm dark:shadow-none">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Logo />
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`relative text-sm font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${pathname === link.href ? "text-cyan-600 dark:text-cyan-400" : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            {link.name}
                            {pathname === link.href && (
                                <motion.span
                                    layoutId="underline"
                                    className="absolute left-0 top-full block h-[2px] w-full bg-cyan-600 dark:bg-cyan-400"
                                />
                            )}
                        </Link>
                    ))}
                    
                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white hover:scale-110 transition-all"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white transition-all"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    )}
                    <button
                        className="text-black dark:text-white focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-6 right-6 md:hidden bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col space-y-4 shadow-lg shadow-black/5 dark:shadow-none"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-lg font-medium transition-colors hover:text-cyan-600 dark:hover:text-cyan-400 ${pathname === link.href ? "text-cyan-600 dark:text-cyan-400" : "text-gray-800 dark:text-gray-300"
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

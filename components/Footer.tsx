"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 inline-flex">
              <Logo />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              High-End ICT Infrastructure and Creative Media Services. Building the technological backbone for modern enterprises.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com/in/emmanuel-nyakundi" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://github.com/4nyakundi" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display tracking-wide uppercase text-sm">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/services" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Services</Link></li>
              <li><Link href="/portfolio" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Portfolio</Link></li>
              <li><Link href="/quote" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Get a Quote</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services Setup */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display tracking-wide uppercase text-sm">Expertise</h4>
            <ul className="space-y-4">
              <li className="text-gray-400 text-sm">Cloud Computing</li>
              <li className="text-gray-400 text-sm">Enterprise Networks</li>
              <li className="text-gray-400 text-sm">Media Production</li>
              <li className="text-gray-400 text-sm">Cybersecurity</li>
              <li className="text-gray-400 text-sm">Data Architecture</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold mb-6 font-display tracking-wide uppercase text-sm">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-gray-400 text-sm">123 Innovation Drive, Tech District, City 10010</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-gray-400 text-sm">0790964002</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-gray-400 text-sm">dpinc.top@gmail.com<br/>support@dpinc.top</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DATA PORT. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

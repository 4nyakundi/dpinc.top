"use client";

import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
// Update 'image' below to an actual path string in 'public' once you upload the files (e.g., "/projects/project-1.jpg")

const projects = [
  {
    id: 1,
    title: "Project Alpha",
    category: "Cloud Infrastructure",
    description: "Full-scale server migration and cloud architecture.",
    image: null, 
  },
  {
    id: 2,
    title: "Neon Wave",
    category: "Creative Media",
    description: "Immersive 3D web experience and branding for a digital agency.",
    image: null,
  },
  {
    id: 3,
    title: "Data Core",
    category: "Enterprise Network",
    description: "Secure, high-bandwidth data center setup with 99.99% uptime guarantee.",
    image: null,
  },
];

export default function PortfolioPreview() {
  return (
    <section className="py-32 bg-[#050505] relative" id="portfolio">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">
              Featured <span className="text-purple-400">Work</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Explore our latest successful projects. Add your pictures below in the codebase to show your evidence and success.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mt-6 md:mt-0"
          >
            <Link href="/portfolio" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-medium">
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group glass rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500/30 transition-colors"
            >
              <div className="h-64 bg-gray-900 relative flex items-center justify-center overflow-hidden">
                {/* Image Placeholder or Actual Image */}
                {project.image ? (
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-700" />
                    <span className="absolute bottom-4 right-4 text-xs text-gray-600 font-medium">Image Upload Pending</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              <div className="p-8">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
                  {project.category}
                </span>
                <h3 className="text-2xl font-bold font-display text-white mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-400 line-clamp-2">
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

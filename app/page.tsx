import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Services from "@/components/Services";
import PortfolioPreview from "@/components/PortfolioPreview";
import Testimonial from "@/components/Testimonial";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white w-full">
      <Hero />
      <ClientLogos />
      <Stats />
      {/* If About and Services exist, they'll render appropriately. Otherwise fallback to these new sections first */}
      <About />
      <Services />
      <PortfolioPreview />
      <Testimonial />
      <CallToAction />
    </div>
  );
}

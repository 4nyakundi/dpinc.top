import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white w-full">
      <Hero />
      <About />
      <Services />
    </div>
  );
}

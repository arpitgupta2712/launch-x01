import AdminStats from "../components/sections/AdminStats";
import CTA from "../components/sections/CTA";
import DatabaseHealth from "../components/sections/DatabaseHealth";
import FAQ from "../components/sections/FAQ";
import Footer from "../components/sections/Footer";
import Hero from "../components/sections/Hero";
import Navbar from "../components/sections/Navbar";
import Pricing from "../components/sections/Pricing";
import SystemHealth from "../components/sections/SystemHealth";
import { Divider } from "../components/ui/divider";
import { PriorityLoader } from "../components/ui/priority-loader";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <PriorityLoader />
      <Navbar />
      <Hero />
      <AdminStats />
      <Divider variant="arrow" size="sm" />

      <Pricing />
      <Divider variant="glow" size="sm" />

      <SystemHealth />

      <FAQ />
      <Divider variant="arrow" size="sm" />

      <DatabaseHealth />
      <CTA />
      <Footer />
    </main>
  );
}

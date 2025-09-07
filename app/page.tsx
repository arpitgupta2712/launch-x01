import AdminStats from "../components/pages/home-page/AdminStats";
import CTA from "../components/pages/home-page/CTA";
import DatabaseHealth from "../components/pages/home-page/DatabaseHealth";
import FAQ from "../components/pages/home-page/FAQ";
import Footer from "../components/pages/home-page/Footer";
import Hero from "../components/pages/home-page/Hero";
import Navbar from "../components/pages/home-page/Navbar";
import Pricing from "../components/pages/home-page/Pricing";
import SystemHealth from "../components/pages/home-page/SystemHealth";
import { Divider } from "../components/ui/divider";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground">
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

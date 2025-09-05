import CTA from "../components/sections/cta/default";
import DatabaseHealth from "../components/sections/database-health/default";
import FAQ from "../components/sections/faq/default";
import Footer from "../components/sections/footer/default";
import Hero from "../components/sections/hero/default";
import Navbar from "../components/sections/navbar/default";
import Pricing from "../components/sections/pricing/default";
import Stats from "../components/sections/stats/default";
import SystemHealth from "../components/sections/system-health/default";
import { Divider } from "../components/ui/divider";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
      <Stats />
      <Divider variant="arrow" size="sm" />
      <Pricing />
      <Divider variant="glow" size="sm" />
      <DatabaseHealth />
      <FAQ />
      <Divider variant="arrow" size="sm" />
      <SystemHealth />
      <CTA />
      <Footer />
    </main>
  );
}

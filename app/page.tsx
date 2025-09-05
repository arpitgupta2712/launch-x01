import AdminStats from "../components/sections/admin-stats/default";
import CTA from "../components/sections/cta/default";
import DatabaseHealth from "../components/sections/database-health/default";
import FAQ from "../components/sections/faq/default";
import Footer from "../components/sections/footer/default";
import Hero from "../components/sections/hero/default";
import Navbar from "../components/sections/navbar/default";
import Pricing from "../components/sections/pricing/default";
import SystemHealth from "../components/sections/system-health/default";
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

import { Hero } from "@/components/pages";

import Navbar from "../components/pages/home-page/Navbar";

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen w-full">
      <Navbar />
      <Hero />
    </main>
  );
}

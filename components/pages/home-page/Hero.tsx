"use client";

import { cn } from "@/lib/utils";
import { ReportGenerationModal } from "../../modals/report-generation-modal";
import { Section } from "../../ui/section";

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className
      )}
    >
      <div className="max-w-container mx-auto flex flex-col items-center justify-center py-24">
        {/* ReportGenerationModal is now the main component */}
        <ReportGenerationModal open={true} onOpenChange={() => {}} />
      </div>
    </Section>
  );
}

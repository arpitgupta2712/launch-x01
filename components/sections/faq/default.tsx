"use client";

import { ReactNode } from "react";

import { useCompanyData } from "@/lib/hooks/use-company-data";
import { generateCompanyFAQs } from "@/lib/utils/company-faq-generator";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Section } from "../../ui/section";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

export default function FAQ({
  title = "Company FAQ",
  items = false, // Default to false to use dynamic data
  className,
}: FAQProps) {
  const { companies, loading, error } = useCompanyData();

  // Generate FAQ items from company data if no custom items provided
  const faqItems = items !== false ? items : generateCompanyFAQs(companies);

  // Show loading state
  if (loading) {
    return (
      <Section className={className}>
        <div className="max-w-container mx-auto flex flex-col items-center gap-8">
          <h2 className="text-center text-3xl font-semibold sm:text-5xl">
            {title}
          </h2>
          <div className="w-full max-w-[800px] space-y-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border-b border-border/15 py-4">
                <div className="h-6 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-4 bg-muted/50 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  // Show error state
  if (error) {
    return (
      <Section className={className}>
        <div className="max-w-container mx-auto flex flex-col items-center gap-8">
          <h2 className="text-center text-3xl font-semibold sm:text-5xl">
            {title}
          </h2>
          <div className="w-full max-w-[800px] text-center">
            <p className="text-muted-foreground">
              Unable to load company information at the moment. Please try again later.
            </p>
          </div>
        </div>
      </Section>
    );
  }
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center text-3xl font-semibold sm:text-5xl">
          {title}
        </h2>
        {faqItems && faqItems.length > 0 && (
          <Accordion type="single" collapsible className="w-full max-w-[800px]">
            {faqItems.map((item: FAQItemProps, index: number) => (
              <AccordionItem
                key={index}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}

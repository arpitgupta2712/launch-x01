import { ReactNode } from "react";

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
  title = "Questions and Answers",
  items = [
    {
      question: "How do I book a sports facility?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Booking a sports facility is simple and straightforward. Browse our
            comprehensive database of venues, select your preferred location and
            time slot, and complete your booking in just a few clicks.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Our platform covers courts, fields, and arenas across multiple cities
            and regions, making it easy to find the perfect venue for your needs.
          </p>
        </>
      ),
    },
    {
      question: "What types of sports facilities are available?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            We offer a wide range of sports facilities including football fields,
            basketball courts, tennis courts, badminton courts, cricket grounds,
            swimming pools, and multi-purpose sports complexes.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Each facility is carefully verified and maintained to ensure quality
            and safety standards for all users.
          </p>
        </>
      ),
    },
    {
      question: "Can I cancel or reschedule my booking?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Yes, you can cancel or reschedule your booking through our platform.
            Cancellation policies may vary depending on the facility and timing
            of your request.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            We recommend checking the specific cancellation terms for each venue
            before confirming your booking.
          </p>
        </>
      ),
    },
    {
      question: "How do I pay for my booking?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            We accept multiple payment methods including credit cards, debit cards,
            UPI, and digital wallets for your convenience.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            All transactions are secure and processed through our trusted payment
            partners to ensure your financial information is protected.
          </p>
        </>
      ),
    },
    {
      question: "Are the facilities well-maintained?",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          Absolutely! All facilities in our network undergo regular maintenance
          and quality checks. We work closely with venue partners to ensure
          equipment is in excellent condition and facilities meet safety standards.
        </p>
      ),
    },
    {
      question: "What if I have issues with my booking?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Our customer support team is available to help resolve any issues
            with your booking. You can reach out to us through our contact
            channels for immediate assistance.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            We&apos;re committed to ensuring your sports facility experience is
            smooth and enjoyable.
          </p>
        </>
      ),
    },
  ],
  className,
}: FAQProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center text-3xl font-semibold sm:text-5xl">
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <Accordion type="single" collapsible className="w-full max-w-[800px]">
            {items.map((item, index) => (
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

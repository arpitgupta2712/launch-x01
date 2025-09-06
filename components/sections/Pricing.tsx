import { Trophy, Users, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";

import { PricingColumn, PricingColumnProps } from "../ui/pricing-column";
import { Section } from "../ui/section";

interface PricingProps {
  title?: string | false;
  description?: string | false;
  plans?: PricingColumnProps[] | false;
  className?: string;
}

export default function Pricing({
  title = "All Systems Engineered for Excellence",
  description = "Advanced Adminstrative Systems. Unified and centralized.",
  plans = [
    {
      name: "CashBook",
      icon: <Wallet className="size-4" />,
      description: "Managing cash collections and payments",
      price: 6000,
      priceNote: "INR 300/- per wallet per month plus Onboarding fee",
      cta: {
        variant: "default",
        label: "Access CashBook System",
        href: "https://web.cashbook.in/businesses/pBig9dNOwjFciaXMCmU7/cashbooks",
      },
      features: [
        "Compile and Analyze Statements",
        "Generate Monthly / Daily Reports",
        "Hudle Variance Flagger",
      ],
      variant: "glow",
      className: "lg:flex",
    },
    {
      name: "Hudle",
      icon: <Trophy className="size-4" />,
      description: "Managing Slot inventory and sales",
      price: 10000,
      priceNote: "upto 2% commission on sales including on Pay-Later",
      cta: {
        variant: "default",
        label: "Access Hudle System",
        href: "https://partner.hudle.in/",
      },
      features: [
        "Slot inventory management",
        "Generate Sales Reports",
        "Venue Search and Market Analysis",
      ],
      variant: "glow-brand",
    },
    {
      name: "SalaryBox",
      icon: <Users className="size-4" />,
      description: "Managing Employee payrolls and leaves",
      price: 4000,
      priceNote: "INR 200/- per employee per month",
      cta: {
        variant: "default",
        label: "Access SalaryBox System",
        href: "https://web.salarybox.in/my-team",
      },
      features: [
        "Employee Management",
        "Payroll Reports",
        "Live Attendance Tracking",
      ],
      variant: "glow",
    },
  ],
  className = "",
}: PricingProps) {
  return (
    <Section id="pricing" className={cn(className)}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        {(title || description) && (
          <div className="flex flex-col items-center gap-4 px-4 text-center sm:gap-8">
            {title && (
              <h2 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-md text-muted-foreground max-w-[600px] font-medium sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}
        {plans !== false && plans.length > 0 && (
          <div className="max-w-container mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan) => (
              <PricingColumn
                key={plan.name}
                name={plan.name}
                icon={plan.icon}
                description={plan.description}
                price={plan.price}
                priceNote={plan.priceNote}
                cta={plan.cta}
                features={plan.features}
                variant={plan.variant}
                className={plan.className}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

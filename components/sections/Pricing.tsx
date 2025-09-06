import { User, Users, Wallet } from "lucide-react";

import { siteConfig } from "@/config/site";
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
  title = "Build your dream landing page, today.",
  description = "Get lifetime access to all the components. No recurring fees. Just simple, transparent pricing.",
  plans = [
    {
      name: "CashBook",
      icon: <Wallet className="size-4" />,
      description: "Managing cash collections and payments",
      price: 0,
      priceNote: "Free and open-source forever.",
      cta: {
        variant: "default",
        label: "Access CashBook System",
        href: "/docs/getting-started/introduction",
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
      icon: <User className="size-4" />,
      description: "Managing Slot inventory and sales",
      price: 99,
      priceNote: "Lifetime access. Free updates. No recurring fees.",
      cta: {
        variant: "default",
        label: "Access Hudle System",
        href: siteConfig.pricing.pro,
      },
      features: [
        "Slot inventory management",
        "Sales Reports",
        "Outstanding Payments",
        "Competition Analysis",
        "Venue Lookups",
      ],
      variant: "glow-brand",
    },
    {
      name: "SalaryBox",
      icon: <Users className="size-4" />,
      description: "Managing Employee payrolls and leaves",
      price: 499,
      priceNote: "Lifetime access. Free updates. No recurring fees.",
      cta: {
        variant: "default",
        label: "Access SalaryBox System",
        href: siteConfig.pricing.team,
      },
      features: [
        "All the templates, components and sections available for your entire team",
      ],
      variant: "glow",
    },
  ],
  className = "",
}: PricingProps) {
  return (
    <Section className={cn(className)}>
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
          <div className="max-w-container mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

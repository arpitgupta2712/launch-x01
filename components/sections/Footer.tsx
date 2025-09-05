"use client";

import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { useOptimizedCompanyData } from "@/lib/hooks/use-optimized-data";
import { cn } from "@/lib/utils";

import { ClayGroundsComposite } from "../logos/claygrounds";
import {
  Footer,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "../ui/footer";
import { ModeToggle } from "../ui/mode-toggle";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: ReactNode;
  name?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  policies?: FooterLink[];
  showModeToggle?: boolean;
  className?: string;
}

export default function FooterSection({
  logo = <ClayGroundsComposite logomarkVariant="white" logotypeVariant="white" logomarkWidth={24} logomarkHeight={24} logotypeWidth={100} logotypeHeight={24} gap="gap-2" />,
  name = "",
  columns,
  copyright = "© 2019 ClayGrounds. All rights reserved",
  policies = [
    { text: "Privacy Policy", href: siteConfig.url },
    { text: "Terms of Service", href: siteConfig.url },
  ],
  showModeToggle = false,
  className,
}: FooterProps) {
  const { companies, loading } = useOptimizedCompanyData();

  // Function to shorten company names for better display
  const shortenCompanyName = (name: string): string => {
    return name
      .replace(/\s+(Pvt\s+Ltd|Private\s+Limited|Ltd|Limited|Inc|Incorporated|Corp|Corporation|LLC|LLP)\s*$/i, '')
      .replace(/\s+(India|USA|US|United\s+States|UK|United\s+Kingdom|Canada|Australia|Germany|France|Japan|China)\s*$/i, '')
      .replace(/\s+(Solutions|Technologies|Technology|Innovation|Innovations|Systems|Services|Group|Holdings|Enterprises|Ventures)\s*$/i, '')
      .trim();
  };

  // Create dynamic company links based on API data
  const getCompanyLinks = (): FooterLink[] => {
    if (loading || !companies || companies.length === 0) {
      // Fallback links while loading or if no data
      return [
        { text: "About", href: "https://www.claygrounds.com" },
        { text: "ClayGrounds", href: "https://www.claygrounds.com" },
      ];
    }

    const links: FooterLink[] = [
      { text: "About", href: "https://www.claygrounds.com" },
    ];

    // Add company names as links (limit to 2 companies to keep it clean)
    companies.slice(0, 2).forEach((company) => {
      if (company?.name) {
        const shortName = shortenCompanyName(company.name);
        links.push({
          text: shortName,
          href: company.email ? `mailto:${company.email}` : "https://www.goaltech.in"
        });
      }
    });

    return links;
  };

  // Default columns with dynamic company links
  const defaultColumns: FooterColumnProps[] = [
    {
      title: "Product",
      links: [
        { text: "Sports", href: "https://www.claygrounds.com" },
        { text: "Community", href: "https://www.claygrounds.com" },
      ],
    },
    {
      title: "Company",
      links: getCompanyLinks(),
    },
    {
      title: "Contact",
      links: [
        { text: "Instagram", href: "https://www.instagram.com/claygroundsbyplaza" },
        { text: "Youtube", href: "https://www.youtube.com/@claygroundsbyplaza" },
        { text: "Github", href: "https://github.com/arpitgupta2712" },
      ],
    },
  ];

  const finalColumns = columns || defaultColumns;
  return (
    <footer className={cn("bg-background w-full px-4", className)}>
      <div className="max-w-container mx-auto">
        <Footer>
          <FooterContent>
            <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2">
                {logo}
                <h3 className="text-xl font-bold">{name}</h3>
              </div>
            </FooterColumn>
            {finalColumns.map((column, index) => (
              <FooterColumn key={index}>
                <h3 className="text-md pt-1 font-semibold">{column.title}</h3>
                {column.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="text-muted-foreground text-sm"
                  >
                    {link.text}
                  </a>
                ))}
              </FooterColumn>
            ))}
          </FooterContent>
          <FooterBottom>
            <div>{copyright}</div>
            <div className="flex items-center gap-4">
              {policies.map((policy, index) => (
                <a key={index} href={policy.href}>
                  {policy.text}
                </a>
              ))}
              {showModeToggle && <ModeToggle />}
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}

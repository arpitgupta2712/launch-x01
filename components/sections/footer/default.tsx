import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { ClayGroundsComposite } from "../../logos/claygrounds";
import {
  Footer,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "../../ui/footer";
import { ModeToggle } from "../../ui/mode-toggle";

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
  columns = [
    {
      title: "Product",
      links: [
        { text: "Sports", href: "https://www.claygrounds.com" },
        { text: "Community", href: "https://www.claygrounds.com" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", href: "https://www.goaltech.in" },
        { text: "Careers", href: "https://www.goaltech.in" },
        { text: "Blog", href: "https://www.goaltech.in" },
      ],
    },
    {
      title: "Contact",
      links: [
        { text: "Instagram", href: "https://www.instagram.com/claygroundsbyplaza" },
        { text: "Youtube", href: "https://www.youtube.com/@claygroundsbyplaza" },
        { text: "Github", href: "https://github.com/arpitgupta2712" },
      ],
    },
  ],
  copyright = "© 2019 ClayGrounds. All rights reserved",
  policies = [
    { text: "Privacy Policy", href: siteConfig.url },
    { text: "Terms of Service", href: siteConfig.url },
  ],
  showModeToggle = false,
  className,
}: FooterProps) {
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
            {columns.map((column, index) => (
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

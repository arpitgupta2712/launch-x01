"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

interface ComponentItem {
  title: string;
  href: string;
  description: string;
}

interface MenuItem {
  title: string;
  href?: string;
  isLink?: boolean;
  content?: ReactNode;
}

interface NavigationProps {
  menuItems?: MenuItem[];
  components?: ComponentItem[];
  logo?: ReactNode;
  logoTitle?: string;
  logoDescription?: string;
  logoHref?: string;
  introItems?: {
    title: string;
    href: string;
    description: string;
  }[];
}

export default function Navigation({
  menuItems = [
    {
      title: "Server",
      content: "default",
    },
    {
      title: "Vault",
      content: "components",
    },
    {
      title: "Systems",
      isLink: true,
      href: "#pricing",
    },
  ],
  components = [
    {
      title: "Locations",
      href: "/docs/primitives/alert-dialog",
      description:
        "Manage your sports facilities.",
    },
    {
      title: "Employees",
      href: "/docs/primitives/hover-card",
      description:
        "Manage your employees and payroll.",
    },
    {
      title: "Bookings",
      href: "/docs/primitives/progress",
      description:
        "Manage your slot bookings.",
    },
    {
      title: "Licenses",
      href: "/docs/primitives/scroll-area",
      description: "Manage your licenses.",
    },
    {
      title: "Agreements",
      href: "/docs/primitives/tabs",
      description:
        "Manage your agreements.",
    },
    {
      title: "Tasks",
      href: "/docs/primitives/tooltip",
      description:
        "Manage your tasks and projects.",
    },
  ],
  logo = <Image src="/logos/claygrounds/legacy/CG_legacy_dark.png" alt="ClayGrounds" width={96} height={96} className="mx-auto brightness-0 invert" />,
  logoTitle = "ClayServer",
  logoDescription = "AI powered advanced administrative system for controlling your sports empire.",
  logoHref = "https://www.partner.claygrounds.com",
  introItems = [
    {
      title: "GoalTech",
      href: "https://www.goaltech.in",
      description:
        "A sports infrastructure and technology company.",
    },
    {
      title: "ClayGrounds",
      href: "https://www.claygrounds.com",
      description: "A sports facility management system.",
    },
    {
      title: "Legends Cup",
      href: "https://www.legendscup.in",
      description: "An Ai powered sports event management system.",
    },
  ],
}: NavigationProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {menuItems.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.isLink ? (
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link href={item.href || ""}>{item.title}</Link>
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  {item.content === "default" ? (
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="from-muted/30 to-muted/10 flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                            href={logoHref}
                          >
                            {logo}
                            <div className="mt-4 mb-2 text-lg font-medium text-center">
                              {logoTitle}
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight text-center">
                              {logoDescription}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      {introItems.map((intro, i) => (
                        <ListItem key={i} href={intro.href} title={intro.title}>
                          {intro.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : item.content === "components" ? (
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {components.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : (
                    item.content
                  )}
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"a"> & { title: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          data-slot="list-item"
          className={cn(
            "hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none",
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

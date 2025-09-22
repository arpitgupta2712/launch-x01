"use client";

import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { ClayGroundsComposite } from "../../logos/claygrounds";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
} from "../../layout/navbar";

interface NavbarProps {
  logo?: ReactNode;
  homeUrl?: string;
  className?: string;
}

export default function Navbar({
  logo = (
    <ClayGroundsComposite
      logomarkVariant="chartreuse"
      logotypeVariant="chartreuse"
      logomarkWidth={28}
      logomarkHeight={28}
      logotypeWidth={96}
      logotypeHeight={28}
      gap="gap-2"
    />
  ),
  homeUrl = siteConfig.url,
  className,
}: NavbarProps) {
  return (
    <header
      className={cn("sticky top-0 z-50 w-full px-4 pb-4", className)}
      style={{ position: "sticky", top: 0 }}
    >
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
            </a>
          </NavbarLeft>
        </NavbarComponent>
      </div>
    </header>
  );
}

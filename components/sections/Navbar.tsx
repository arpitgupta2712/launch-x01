import { Menu } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { ClayGroundsComposite } from "../logos/claygrounds";
import { Button, type ButtonProps } from "../ui/button";
// import { ModeToggle } from "../ui/mode-toggle"; // Disabled - keeping dark theme default
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../ui/navbar";
import Navigation from "../ui/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

/**
 * Configuration for individual navigation links in the mobile menu
 * @interface NavbarLink
 * @property {string} text - Display text for the navigation link
 * @property {string} href - URL destination for the link
 */
interface NavbarLink {
  text: string;
  href: string;
}

/**
 * Configuration for action buttons/links in the navbar
 * @interface NavbarActionProps
 * @property {string} text - Display text for the action
 * @property {string} href - URL destination for the action
 * @property {ButtonProps["variant"]} [variant] - Button style variant (default, outline, etc.)
 * @property {ReactNode} [icon] - Icon component to display before the text
 * @property {ReactNode} [iconRight] - Icon component to display after the text
 * @property {boolean} [isButton] - Whether to render as a button or plain link
 */
interface NavbarActionProps {
  text: string;
  href: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

/**
 * Main configuration interface for the Navbar component
 * @interface NavbarProps
 * @property {ReactNode} [logo] - Logo component to display (defaults to LaunchUI)
 * @property {string} [name] - Brand name to display next to logo (defaults to "Launch UI")
 * @property {string} [homeUrl] - URL for the home/logo link (defaults to siteConfig.url)
 * @property {NavbarLink[]} [mobileLinks] - Array of links for mobile menu
 * @property {NavbarActionProps[]} [actions] - Array of action buttons/links for desktop
 * @property {boolean} [showNavigation] - Whether to show the main navigation menu
 * @property {ReactNode} [customNavigation] - Custom navigation component to replace default
 * @property {string} [className] - Additional CSS classes for the header container
 */
interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <ClayGroundsComposite logomarkVariant="chartreuse" logotypeVariant="chartreuse" logomarkWidth={32} logomarkHeight={32} logotypeWidth={120} logotypeHeight={32} gap="gap-2" />, // 🎨 BRAND CUSTOMIZATION: ClayGrounds composite with mixed colors
  homeUrl = siteConfig.url, // 🎨 BRAND CUSTOMIZATION: Set your home page URL
  mobileLinks = [
    { text: "Getting Started", href: siteConfig.url }, // 🎨 BRAND CUSTOMIZATION: Update mobile menu links
    { text: "Components", href: siteConfig.url },
    { text: "Documentation", href: siteConfig.url },
  ],
  actions = [
    { text: "Sign in", href: siteConfig.url, isButton: false }, // 🎨 BRAND CUSTOMIZATION: Update action buttons
    {
      text: "Get Started",
      href: "https://www.claygrounds.com",
      isButton: true,
      variant: "default",
    },
  ],
  showNavigation = true, // 🎨 BRAND CUSTOMIZATION: Set to false to hide main navigation
  customNavigation, // 🎨 BRAND CUSTOMIZATION: Provide custom navigation component
  className, // 🎨 BRAND CUSTOMIZATION: Add custom styling classes
}: NavbarProps) {
  return (
    // 🎨 MAIN HEADER CONTAINER: Sticky header with backdrop blur effect
    <header className={cn("sticky top-0 z-50 w-full -mb-4 px-4 pb-4", className)} style={{ position: 'sticky', top: 0 }}>
      {/* 🎨 BACKDROP BLUR: Creates the glassmorphism effect behind the navbar */}
      <div className="fade-bottom bg-background/15 absolute inset-0 h-28 w-full backdrop-blur-lg"></div>
      
      {/* 🎨 CONTENT CONTAINER: Max-width container for responsive layout */}
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          {/* 🎨 LEFT SECTION: Brand logo, name, and main navigation */}
          <NavbarLeft>
            {/* 🎨 BRAND LOGO & NAME: Clickable logo that links to home page */}
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
            </a>
            {/* 🎨 MAIN NAVIGATION: Desktop navigation menu (can be customized or hidden) */}
            {showNavigation && (customNavigation || <Navigation />)}
          </NavbarLeft>
          
          {/* 🎨 RIGHT SECTION: Action buttons and mobile menu */}
          <NavbarRight>
            {/* 🎨 ACTION BUTTONS: Desktop action buttons/links (Sign in, Get Started, etc.) */}
            {actions.map((action, index) =>
              action.isButton ? (
                // 🎨 BUTTON STYLE ACTION: Rendered as a styled button component
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  asChild
                  className="hidden md:flex"
                >
                  <a href={action.href}>
                    {action.icon}
                    {action.text}
                    {action.iconRight}
                  </a>
                </Button>
              ) : (
                // 🎨 LINK STYLE ACTION: Rendered as a plain text link
                <a
                  key={index}
                  href={action.href}
                  className="hidden text-sm md:block"
                >
                  {action.text}
                </a>
              ),
            )}
            
            {/* 🎨 THEME TOGGLE: Disabled - keeping dark theme default */}
            {/* <ModeToggle /> */}
            
            {/* 🎨 MOBILE MENU: Hamburger menu for mobile devices */}
            <Sheet>
              {/* 🎨 MOBILE MENU TRIGGER: Hamburger button (hidden on desktop) */}
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              
              {/* 🎨 MOBILE MENU CONTENT: Slide-out panel with mobile navigation */}
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  {/* 🎨 MOBILE BRAND: Brand name in mobile menu */}
                  <a
                    href={homeUrl}
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    {logo}
                  </a>
                  {/* 🎨 MOBILE NAVIGATION LINKS: List of navigation links for mobile */}
                  {mobileLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}

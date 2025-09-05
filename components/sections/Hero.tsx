import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import Github from "../logos/github";
import React from "../logos/react";
import { ApiStatusBadge } from "../ui/api-status-badge";
import { Button, type ButtonProps } from "../ui/button";
import Glow from "../ui/glow";
import { Mockup, MockupFrame } from "../ui/mockup";
import Screenshot from "../ui/screenshot";
import { Section } from "../ui/section";

/**
 * 🎨 HERO BUTTON CONFIGURATION
 * 
 * Configuration object for individual buttons in the hero section.
 * Each button can have custom styling, icons, and behavior.
 * 
 * @interface HeroButtonProps
 * @property {string} href - The URL/link destination for the button
 * @property {string} text - The display text for the button
 * @property {ButtonProps["variant"]} [variant] - Button style variant (default, glow, outline, etc.)
 * @property {ReactNode} [icon] - Icon component to display before the text
 * @property {ReactNode} [iconRight] - Icon component to display after the text
 * 
 * @example
 * ```tsx
 * {
 *   href: "/get-started",
 *   text: "Get Started",
 *   variant: "default",
 *   icon: <ArrowRightIcon className="mr-2 size-4" />
 * }
 * ```
 */
interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

/**
 * 🎨 HERO SECTION CONFIGURATION
 * 
 * Main configuration object for the hero section component.
 * Controls all visual elements, content, and layout of the hero area.
 * 
 * @interface HeroProps
 * @property {string} [title] - Main headline text (default: "Give your big idea the design it deserves")
 * @property {string} [description] - Subtitle/description text below the title
 * @property {ReactNode | false} [mockup] - Screenshot/mockup component to display (default: dashboard screenshots)
 * @property {ReactNode | false} [badge] - Badge/announcement component above the title (default: "New version" badge)
 * @property {HeroButtonProps[] | false} [buttons] - Array of action buttons (default: "Get Started" and "Github" buttons)
 * @property {string} [className] - Additional CSS classes for custom styling
 * 
 * @example
 * ```tsx
 * <Hero
 *   title="Your Custom Title"
 *   description="Your custom description"
 *   buttons={[
 *     { href: "/signup", text: "Sign Up", variant: "default" },
 *     { href: "/learn", text: "Learn More", variant: "outline" }
 *   ]}
 * />
 * ```
 */
interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

/**
 * 🎨 HERO SECTION COMPONENT
 * 
 * The main hero section component that displays the primary content area of the landing page.
 * This component renders a title, description, action buttons, and an optional mockup/screenshot.
 * 
 * @component
 * @param {HeroProps} props - Configuration object for the hero section
 * @returns {JSX.Element} The rendered hero section
 * 
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <Hero />
 * 
 * // Custom content
 * <Hero
 *   title="Welcome to Our Platform"
 *   description="Build amazing things with our tools"
 *   buttons={[
 *     { href: "/signup", text: "Sign Up", variant: "default" }
 *   ]}
 * />
 * ```
 * 
 * 🎨 BRAND CUSTOMIZATION POINTS:
 * - Line 95: Main title text and styling
 * - Line 96: Description text and styling  
 * - Line 88-89: Badge content and styling
 * - Line 90-91: Button configuration (text, links, variants)
 * - Line 87: Mockup/screenshot images
 * - Line 92: Overall section styling
 */
export default function Hero({
  // 🎨 BRAND CUSTOMIZATION: Main headline - change to your brand message
  title = "Discovering every court, field, and arena",
  // 🎨 BRAND CUSTOMIZATION: Subtitle - change to your brand description
  description = "From Mumbai's bustling courts to Delhi's premier venues - we're mapping India's sports landscape, one facility at a time.",
  // 🎨 BRAND CUSTOMIZATION: Screenshot/mockup - replace with your product images
  mockup = (
    <Screenshot
      srcLight="/dashboard-light.png"
      srcDark="/dashboard-dark.png"
      alt="Launch UI app screenshot"
      width={1248}
      height={765}
      className="w-full"
    />
  ),
  // 🎨 BRAND CUSTOMIZATION: Badge content - shows API loading status
  badge = <ApiStatusBadge className="animate-appear" />,
  // 🎨 BRAND CUSTOMIZATION: Action buttons - change text, links, and variants
  buttons = [
          {
        href: "https://goaltech.in",
        text: "GoalTech",
        variant: "default",
        icon: <React className="mr-2 size-4" />,
      },
    {
      href: "https://github.com/arpitgupta2712",
      text: "Github",
      variant: "glow",
      icon: <Github className="mr-2 size-4" />,
    },
  ],
  // 🎨 BRAND CUSTOMIZATION: Additional styling classes
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className, // 🎨 BRAND CUSTOMIZATION: Additional section styling
      )}
    >
      <div className="max-w-container mx-auto flex flex-col gap-12 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* 🎨 BRAND CUSTOMIZATION: Badge/announcement - content and styling */}
          {badge !== false && badge}
          
          {/* 🎨 BRAND CUSTOMIZATION: Main headline - text, size, styling */}
          <h1 className="animate-appear from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-4xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>
          
          {/* 🎨 BRAND CUSTOMIZATION: Description text - content and styling */}
          <p className="text-md animate-appear text-muted-foreground relative z-10 max-w-[740px] font-medium text-balance opacity-0 delay-100 sm:text-xl">
            {description}
          </p>
          
          {/* 🎨 BRAND CUSTOMIZATION: Action buttons - layout, spacing, variants */}
          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || "default"}
                  size="lg"
                  asChild
                >
                  <a href={button.href}>
                    {button.icon}
                    {button.text}
                    {button.iconRight}
                  </a>
                </Button>
              ))}
            </div>
          )}
          
          {/* 🎨 BRAND CUSTOMIZATION: Product mockup/screenshot - images, frame styling */}
          {mockup !== false && (
            <div className="relative w-full pt-12">
              <MockupFrame
                className="animate-appear opacity-0 delay-700"
                size="small"
              >
                <Mockup
                  type="responsive"
                  className="bg-background/90 w-full rounded-xl border-0"
                >
                  {mockup}
                </Mockup>
              </MockupFrame>
              {/* 🎨 BRAND CUSTOMIZATION: Glow effect - color, position, timing */}
              <Glow
                variant="top"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

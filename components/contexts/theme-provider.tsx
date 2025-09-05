"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Theme Provider Component - Manages dark/light theme switching for the application
 * 
 * This component wraps the application with theme context using next-themes library.
 * It handles theme persistence, prevents hydration mismatches, and provides theme
 * switching capabilities throughout the app.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with theme context
 * @returns {JSX.Element} The theme provider wrapper
 * 
 * @example
 * // Wrap your app with the theme provider
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * @description
 * **Theme Configuration:**
 * - Default theme: "dark" (🎨 BRAND CUSTOMIZATION: Change default theme)
 * - Theme attribute: "class" (applies theme via CSS classes)
 * - System theme: disabled (🎨 BRAND CUSTOMIZATION: Enable to respect OS preference)
 * - Hydration safe: Prevents flash of wrong theme on page load
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 🎨 HYDRATION SAFETY: Prevents theme flash on initial load
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🎨 LOADING STATE: Return children without theme until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemeProvider
      attribute="class" // 🎨 THEME METHOD: Uses CSS classes for theme switching
      defaultTheme="dark" // 🎨 BRAND CUSTOMIZATION: Change default theme (dark/light)
      enableSystem={false} // 🎨 BRAND CUSTOMIZATION: Set to true to respect OS theme preference
    >
      {children}
    </NextThemeProvider>
  );
}

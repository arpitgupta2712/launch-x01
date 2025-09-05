import Image from "next/image";

type LogoType = "logomark" | "logotype";
type LogoVariant = "black" | "white" | "green" | "chartreuse" | "green-in-chartreuse" | "chartreuse-in-green";

interface ClayGroundsLogoProps {
  className?: string;
  width?: number;
  height?: number;
  type?: LogoType;
  variant?: LogoVariant;
}

const logoPaths: Record<LogoType, Record<LogoVariant, string>> = {
  logomark: {
    black: "/logos/claygrounds/logomark/CG Black.png",
    white: "/logos/claygrounds/logomark/CG White.png",
    green: "/logos/claygrounds/logomark/CG Green.png",
    chartreuse: "/logos/claygrounds/logomark/CG Neon.png",
    "green-in-chartreuse": "/logos/claygrounds/logomark/CG Green in Neon.png",
    "chartreuse-in-green": "/logos/claygrounds/logomark/CG Neon in Green.png",
  },
  logotype: {
    black: "/logos/claygrounds/logotype/CG Black.png",
    white: "/logos/claygrounds/logotype/CG White.png",
    green: "/logos/claygrounds/logotype/CG Green.png",
    chartreuse: "/logos/claygrounds/logotype/CG Neon.png",
    "green-in-chartreuse": "/logos/claygrounds/logotype/CG Green in Neon.png",
    "chartreuse-in-green": "/logos/claygrounds/logotype/CG Neon in Green.png",
  },
};

export function ClayGroundsLogo({ 
  className = "mr-2 size-4", 
  width = 16, 
  height = 16,
  type = "logomark",
  variant = "black"
}: ClayGroundsLogoProps) {
  const logoSrc = logoPaths[type][variant];
  
  return (
    <Image
      src={logoSrc}
      alt="ClayGrounds Logo"
      width={width}
      height={height}
      className={className}
    />
  );
}

// Convenience exports for common variants
export function ClayGroundsLogomark(props: Omit<ClayGroundsLogoProps, 'type'>) {
  return <ClayGroundsLogo {...props} type="logomark" />;
}

export function ClayGroundsLogotype(props: Omit<ClayGroundsLogoProps, 'type'>) {
  return <ClayGroundsLogo {...props} type="logotype" />;
}

// Composite logo component - logomark + logotype side by side
interface ClayGroundsCompositeProps {
  className?: string;
  logomarkWidth?: number;
  logomarkHeight?: number;
  logotypeWidth?: number;
  logotypeHeight?: number;
  variant?: LogoVariant;
  logomarkVariant?: LogoVariant;
  logotypeVariant?: LogoVariant;
  gap?: string;
}

export function ClayGroundsComposite({ 
  className = "flex items-center",
  logomarkWidth = 24,
  logomarkHeight = 24,
  logotypeWidth = 120,
  logotypeHeight = 24,
  variant = "black",
  logomarkVariant,
  logotypeVariant,
  gap = "gap-2"
}: ClayGroundsCompositeProps) {
  // Use individual variants if provided, otherwise fall back to the general variant
  const markVariant = logomarkVariant || variant;
  const typeVariant = logotypeVariant || variant;

  return (
    <div className={`${className} ${gap}`}>
      <ClayGroundsLogo 
        type="logomark" 
        variant={markVariant}
        width={logomarkWidth}
        height={logomarkHeight}
        className=""
      />
      <ClayGroundsLogo 
        type="logotype" 
        variant={typeVariant}
        width={logotypeWidth}
        height={logotypeHeight}
        className=""
      />
    </div>
  );
}

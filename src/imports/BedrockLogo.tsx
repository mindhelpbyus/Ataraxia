interface BedrockLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
  size?: number;
}

/**
 * Bedrock Health Solutions wordmark.
 *
 * NOTE: the graphic logo mark is temporarily removed (pending a proper asset).
 * All variants render a clean text wordmark so nothing looks broken in the UI.
 */
export function BedrockLogo({ className = '', variant = 'full', size = 40 }: BedrockLogoProps) {
  // icon variant: compact "BH" monogram so square slots (sidebar) still look intentional.
  if (variant === 'icon') {
    const hasSizingClass = /\b(w-|h-|size-)/.test(className);
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl font-bold text-white shrink-0 ${className}`}
        style={{
          background: '#DC2626',
          ...(hasSizingClass ? {} : { width: size, height: size }),
          fontSize: size * 0.4,
        }}
      >
        BH
      </span>
    );
  }

  // text + full: same wordmark for now (no graphic mark).
  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight ${className}`} style={{ fontSize: size * 0.5 }}>
      <span style={{ color: '#1a1a1a' }}>BEDROCK</span>
      <span style={{ color: '#DC2626' }} className="ml-1.5">HEALTH</span>
    </span>
  );
}

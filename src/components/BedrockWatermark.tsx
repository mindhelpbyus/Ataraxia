import React from 'react';
import { BedrockLogo } from '../imports/BedrockLogo';

interface BedrockWatermarkProps {
  /**
   * Opacity level (0-100). Default: 5
   */
  opacity?: number;
  
  /**
   * Position of the watermark. Default: 'center'
   */
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  
  /**
   * Size of the watermark in pixels. Default: 400
   */
  size?: number;
  
  /**
   * Rotation angle in degrees. Default: -45 for diagonal
   */
  rotation?: number;
  
  /**
   * Logo variant to use. Default: 'full'
   */
  variant?: 'full' | 'icon' | 'text';
  
  /**
   * Whether to repeat the watermark in a pattern. Default: false
   */
  repeat?: boolean;
  
  /**
   * Custom className for additional styling
   */
  className?: string;
}

export function BedrockWatermark({
  opacity = 5,
  position = 'center',
  size = 400,
  rotation = -45,
  variant = 'full',
  repeat = false,
  className = '',
}: BedrockWatermarkProps) {
  // Position styles based on position prop
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 0,
      opacity: opacity / 100,
    };

    switch (position) {
      case 'center':
        return {
          ...baseStyles,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        };
      case 'top-left':
        return {
          ...baseStyles,
          top: '10%',
          left: '10%',
          transform: `rotate(${rotation}deg)`,
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: '10%',
          right: '10%',
          transform: `rotate(${rotation}deg)`,
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: '10%',
          left: '10%',
          transform: `rotate(${rotation}deg)`,
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: '10%',
          right: '10%',
          transform: `rotate(${rotation}deg)`,
        };
      case 'top-center':
        return {
          ...baseStyles,
          top: '10%',
          left: '50%',
          transform: `translateX(-50%) rotate(${rotation}deg)`,
        };
      case 'bottom-center':
        return {
          ...baseStyles,
          bottom: '10%',
          left: '50%',
          transform: `translateX(-50%) rotate(${rotation}deg)`,
        };
      default:
        return baseStyles;
    }
  };

  // If repeat is enabled, create a repeating pattern
  if (repeat) {
    return (
      <div
        className={`watermark-container ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, ${size}px)`,
            gridTemplateRows: `repeat(auto-fill, ${size}px)`,
            gap: '60px',
            padding: '60px',
            opacity: opacity / 100,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            width: '200%',
            height: '200%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-100%',
            marginTop: '-100%',
          }}
        >
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} style={{ width: size, height: size }}>
              <BedrockLogo
                variant={variant}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single watermark
  return (
    <div
      className={`watermark-single ${className}`}
      style={getPositionStyles()}
    >
      <BedrockLogo
        variant={variant}
        size={size}
      />
    </div>
  );
}

// Convenience components for common use cases
export function CenteredWatermark({ opacity = 5, size = 400 }: Partial<BedrockWatermarkProps>) {
  return <BedrockWatermark position="center" opacity={opacity} size={size} rotation={-45} />;
}

export function RepeatingWatermark({ opacity = 3, size = 300 }: Partial<BedrockWatermarkProps>) {
  return <BedrockWatermark repeat opacity={opacity} size={size} rotation={-45} />;
}

export function DocumentWatermark({ opacity = 8, size = 500 }: Partial<BedrockWatermarkProps>) {
  return <BedrockWatermark position="center" variant="icon" opacity={opacity} size={size} rotation={0} />;
}

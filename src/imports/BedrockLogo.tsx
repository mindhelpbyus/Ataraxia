import React from 'react';

interface BedrockLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
  size?: number;
}

export function BedrockLogo({ className = '', variant = 'full', size = 40 }: BedrockLogoProps) {
  if (variant === 'icon') {
    // Icon-only version - Hexagonal pinwheel design
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          {/* Gradients for each section */}
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FCD34D" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
        
        <g transform="translate(50, 50)">
          {/* Top triangle - Yellow */}
          <path 
            d="M 0,-35 L 30.31,-17.5 L 0,0 Z" 
            fill="url(#grad1)"
          />
          
          {/* Top-right triangle - Red */}
          <path 
            d="M 30.31,-17.5 L 30.31,17.5 L 0,0 Z" 
            fill="url(#grad2)"
          />
          
          {/* Bottom-right triangle - Orange */}
          <path 
            d="M 30.31,17.5 L 0,35 L 0,0 Z" 
            fill="url(#grad3)"
          />
          
          {/* Bottom triangle - Yellow */}
          <path 
            d="M 0,35 L -30.31,17.5 L 0,0 Z" 
            fill="url(#grad4)"
          />
          
          {/* Bottom-left triangle - Red */}
          <path 
            d="M -30.31,17.5 L -30.31,-17.5 L 0,0 Z" 
            fill="url(#grad5)"
          />
          
          {/* Top-left triangle - Orange */}
          <path 
            d="M -30.31,-17.5 L 0,-35 L 0,0 Z" 
            fill="url(#grad6)"
          />
          
          {/* Center white hexagon */}
          <path 
            d="M 0,-12 L 10.39,-6 L 10.39,6 L 0,12 L -10.39,6 L -10.39,-6 Z" 
            fill="white"
          />
        </g>
      </svg>
    );
  }

  if (variant === 'text') {
    // Text-only version
    return (
      <svg 
        viewBox="0 0 190 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Company Name - BEDROCK */}
        <text
          x="0"
          y="30"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="20"
          fontWeight="700"
          fill="#1a1a1a"
          letterSpacing="-0.3"
        >
          BEDROCK
        </text>
        
        {/* Company Name - HEALTH */}
        <text
          x="101"
          y="30"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="20"
          fontWeight="500"
          fill="#DC2626"
          letterSpacing="0"
        >
          HEALTH
        </text>
        
        {/* Tagline - Solutions (smaller) */}
        <text
          x="0"
          y="40"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="9"
          fontWeight="400"
          fill="#6b7280"
          letterSpacing="1.2"
        >
          SOLUTIONS
        </text>
      </svg>
    );
  }

  // Full logo with icon and text - Professional horizontal layout
  return (
    <svg 
      viewBox="0 0 240 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients for each section */}
        <linearGradient id="gradFull1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
        <linearGradient id="gradFull2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        <linearGradient id="gradFull3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
        <linearGradient id="gradFull4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="gradFull5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="gradFull6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      
      {/* Icon Part - Hexagonal pinwheel */}
      <g transform="translate(24, 24) scale(0.48)">
        {/* Top triangle - Yellow */}
        <path 
          d="M 0,-35 L 30.31,-17.5 L 0,0 Z" 
          fill="url(#gradFull1)"
        />
        
        {/* Top-right triangle - Red */}
        <path 
          d="M 30.31,-17.5 L 30.31,17.5 L 0,0 Z" 
          fill="url(#gradFull2)"
        />
        
        {/* Bottom-right triangle - Orange */}
        <path 
          d="M 30.31,17.5 L 0,35 L 0,0 Z" 
          fill="url(#gradFull3)"
        />
        
        {/* Bottom triangle - Yellow */}
        <path 
          d="M 0,35 L -30.31,17.5 L 0,0 Z" 
          fill="url(#gradFull4)"
        />
        
        {/* Bottom-left triangle - Red */}
        <path 
          d="M -30.31,17.5 L -30.31,-17.5 L 0,0 Z" 
          fill="url(#gradFull5)"
        />
        
        {/* Top-left triangle - Orange */}
        <path 
          d="M -30.31,-17.5 L 0,-35 L 0,0 Z" 
          fill="url(#gradFull6)"
        />
        
        {/* Center white hexagon */}
        <path 
          d="M 0,-12 L 10.39,-6 L 10.39,6 L 0,12 L -10.39,6 L -10.39,-6 Z" 
          fill="white"
        />
      </g>
      
      {/* Company Name - BEDROCK */}
      <text
        x="56"
        y="30"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="#1a1a1a"
        letterSpacing="-0.3"
      >
        BEDROCK
      </text>
      
      {/* Company Name - HEALTH */}
      <text
        x="157"
        y="30"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="20"
        fontWeight="500"
        fill="#DC2626"
        letterSpacing="0"
      >
        HEALTH
      </text>
      
      {/* Tagline - Solutions (smaller) */}
      <text
        x="56"
        y="40"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="9"
        fontWeight="400"
        fill="#6b7280"
        letterSpacing="1.2"
      >
        SOLUTIONS
      </text>
    </svg>
  );
}

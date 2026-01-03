// Utility to set the Bedrock Health logo as favicon and update meta tags
export function setYodhaFavicon() {
  // SVG for the Bedrock Health logo favicon - optimized for small sizes
  const faviconSVG = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0176d3;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#014486;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <!-- Background Circle -->
      <circle cx="50" cy="50" r="45" fill="url(#bg-gradient)"/>
      
      <!-- Mountain/Bedrock Foundation - Primary -->
      <path d="M50 25 L25 50 L32 57 L50 42 L68 57 L75 50 Z" 
            fill="#0176d3" 
            stroke="none"/>
      
      <!-- Mountain/Bedrock Foundation - Secondary (Depth) -->
      <path d="M50 40 L32 57 L32 72 L50 62 L68 72 L68 57 Z" 
            fill="#014486" 
            stroke="none"/>
      
      <!-- Medical Cross - Vertical -->
      <rect x="47" y="44" width="6" height="20" rx="1.5" fill="white"/>
      
      <!-- Medical Cross - Horizontal -->
      <rect x="41" y="50" width="18" height="6" rx="1.5" fill="white"/>
    </svg>
  `;

  // Convert SVG to data URL
  const faviconDataUrl = `data:image/svg+xml,${encodeURIComponent(faviconSVG)}`;

  // Remove existing favicons
  const existingFavicons = document.querySelectorAll("link[rel*='icon']");
  existingFavicons.forEach(favicon => favicon.remove());

  // Create and append new favicon (SVG)
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = faviconDataUrl;
  document.head.appendChild(favicon);

  // Fallback PNG favicon for browsers that don't support SVG favicons
  const faviconPng = document.createElement('link');
  faviconPng.rel = 'alternate icon';
  faviconPng.type = 'image/png';
  faviconPng.href = faviconDataUrl;
  document.head.appendChild(faviconPng);

  // Apple touch icon for iOS devices
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = faviconDataUrl;
  document.head.appendChild(appleTouchIcon);

  // Set the page title (will be overridden by App.tsx based on current page)
  document.title = 'Bedrock Health Solutions - Wellness Management';

  // Update meta tags for better branding
  updateMetaTag('description', 'A powerful calendar and wellness management system designed for therapists, clients, and wellness administrators.');
  updateMetaTag('theme-color', '#0176d3');
  updateMetaTag('application-name', 'Bedrock Health Solutions');
  
  // Open Graph meta tags for social sharing
  updateMetaTag('og:title', 'Bedrock Health Solutions - Wellness Management', 'property');
  updateMetaTag('og:description', 'Streamline your wellness practice with intelligent scheduling and client management', 'property');
  updateMetaTag('og:type', 'website', 'property');
  updateMetaTag('og:image', faviconDataUrl, 'property');
}

// Helper function to update or create meta tags
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

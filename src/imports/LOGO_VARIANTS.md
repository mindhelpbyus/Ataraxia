# Bedrock Health Solutions - Logo Variants

This document shows all available logo variants and their use cases.

## Available Variants

### 1. Full Logo (Horizontal)
```tsx
<BedrockLogo variant="full" className="h-20 w-auto" />
```

**Features:**
- Icon + "BEDROCK HEALTH" text + "SOLUTIONS" tagline
- Horizontal layout
- Best for headers and wide spaces

**Recommended Sizes:**
- Login pages: `h-16` to `h-24` (64px - 96px height)
- Email headers: `h-12` to `h-16` (48px - 64px height)
- Print materials: Scalable SVG

**Use Cases:**
- ✅ Login/signup pages
- ✅ Email templates
- ✅ Marketing materials
- ✅ Website headers
- ✅ Documents and presentations
- ❌ Small mobile headers (use icon instead)
- ❌ Favicon (use icon instead)

---

### 2. Icon Logo
```tsx
<BedrockLogo variant="icon" className="w-8 h-8" />
```

**Features:**
- Icon only (foundation + medical cross)
- Square format
- Perfect for small spaces

**Recommended Sizes:**
- Sidebar: `w-8 h-8` (32px × 32px)
- Mobile header: `w-10 h-10` (40px × 40px)
- Favicon: `w-12 h-12` (48px × 48px)

**Use Cases:**
- ✅ Sidebar navigation
- ✅ Mobile app headers
- ✅ Favicon/app icons
- ✅ Button icons
- ✅ Loading spinners
- ❌ Large hero sections (use full logo)
- ❌ Marketing materials (use full logo)

---

## Size Guide

### Desktop Application

| Location | Variant | Size | Example |
|----------|---------|------|---------|
| Login Page | Full | `h-20` | `<BedrockLogo variant="full" className="h-20 w-auto" />` |
| Sidebar | Icon | `w-8 h-8` | `<BedrockLogo variant="icon" className="w-8 h-8" />` |
| Mobile Header | Icon | `w-10 h-10` | `<BedrockLogo variant="icon" className="w-10 h-10" />` |
| Email | Full | `h-16` | `<BedrockLogo variant="full" className="h-16 w-auto" />` |

### Responsive Breakpoints

```tsx
// Example: Responsive logo that switches between variants
<div className="flex items-center">
  {/* Desktop - Show full logo */}
  <div className="hidden md:block">
    <BedrockLogo variant="full" className="h-16 w-auto" />
  </div>
  
  {/* Mobile - Show icon only */}
  <div className="md:hidden">
    <BedrockLogo variant="icon" className="w-10 h-10" />
  </div>
</div>
```

---

## Color Specifications

### Standard Colors (Default)

**Icon:**
- Primary Blue: `#0176d3` (Mountain top layer)
- Deep Blue: `#014486` (Mountain bottom layer)
- White: `#ffffff` (Medical cross)
- Light Blue BG: `rgba(1, 118, 211, 0.1)` (Background circle)

**Text (Full Logo):**
- "BEDROCK": `#1a1a1a` (Dark gray/black)
- "HEALTH": `#0176d3` (Primary blue)
- "SOLUTIONS": `#6b7280` (Medium gray)

### Monochrome Variants

If you need monochrome versions, you can override colors:

```tsx
// All white (for dark backgrounds)
<BedrockLogo 
  variant="icon" 
  className="w-8 h-8 text-white"
  style={{ filter: 'brightness(0) invert(1)' }}
/>

// All black (for light backgrounds, minimal style)
<BedrockLogo 
  variant="icon" 
  className="w-8 h-8 text-black"
  style={{ filter: 'brightness(0)' }}
/>
```

---

## Clear Space Requirements

Maintain clear space around the logo equal to the height of the icon:

```
┌─────────────────────────────────┐
│         [Clear Space]           │
│                                 │
│   [Clear]  [LOGO]  [Clear]     │
│                                 │
│         [Clear Space]           │
└─────────────────────────────────┘
```

**Minimum Clear Space:**
- Top/Bottom: 0.5x logo height
- Left/Right: 0.5x logo width

**Example:**
```tsx
<div className="p-4">  {/* Padding creates clear space */}
  <BedrockLogo variant="full" className="h-16 w-auto" />
</div>
```

---

## Background Requirements

### Acceptable Backgrounds

✅ **White or Light Backgrounds**
- Optimal for standard logo
- Best readability
- Recommended for most use cases

✅ **Solid Color Backgrounds**
- Ensure sufficient contrast
- Test with WCAG AA standards
- Consider monochrome variant for dark backgrounds

✅ **Subtle Gradients**
- Light gradients work well
- Avoid busy patterns behind logo

❌ **Avoid These Backgrounds**
- Busy photographs
- Complex patterns
- Low-contrast colors
- Competing graphics

---

## Export Specifications

### For Web Use
- **Format:** SVG (vector)
- **Optimization:** Already optimized in component
- **Loading:** Inline SVG (fast, scalable)

### For Print Use
- **Format:** PDF or SVG export
- **Resolution:** Vector (infinite)
- **Color Mode:** RGB for screen, CMYK for print

### For Favicon
- **Size:** 48×48px, 32×32px, 16×16px
- **Format:** SVG (with PNG fallback)
- **Implementation:** See `/utils/favicon.ts`

---

## Implementation Examples

### Basic Usage
```tsx
import { BedrockLogo } from '../imports/BedrockLogo';

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <BedrockLogo variant="full" className="h-12 w-auto" />
      <nav>{/* Navigation items */}</nav>
    </header>
  );
}
```

### With Link
```tsx
import { BedrockLogo } from '../imports/BedrockLogo';

function Header() {
  return (
    <a href="/" className="inline-block hover:opacity-80 transition-opacity">
      <BedrockLogo variant="full" className="h-16 w-auto" />
    </a>
  );
}
```

### Sidebar Icon
```tsx
import { BedrockLogo } from '../imports/BedrockLogo';

function Sidebar() {
  return (
    <aside className="w-60 bg-sidebar">
      <div className="flex items-center gap-3 p-6">
        <BedrockLogo variant="icon" className="w-8 h-8" />
        <div>
          <div className="font-semibold">Bedrock Health</div>
          <div className="text-xs text-muted-foreground">Admin</div>
        </div>
      </div>
    </aside>
  );
}
```

### Loading State
```tsx
import { BedrockLogo } from '../imports/BedrockLogo';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse">
        <BedrockLogo variant="icon" className="w-16 h-16" />
      </div>
    </div>
  );
}
```

---

## Testing Checklist

When implementing the logo, verify:

- [ ] Logo displays correctly at all sizes
- [ ] Logo is readable on all backgrounds
- [ ] Logo maintains aspect ratio
- [ ] Logo has adequate clear space
- [ ] Logo loads quickly (SVG is inline)
- [ ] Logo is accessible (alt text where needed)
- [ ] Logo works on all target browsers
- [ ] Logo prints correctly
- [ ] Logo works in dark mode (if applicable)

---

## Questions?

Refer to:
1. `/imports/LOGO_README.md` - Technical documentation
2. `/BRANDING_GUIDE.md` - Complete branding guidelines
3. `/components/DashboardLayout.tsx` - Implementation example
4. `/components/LoginPage-fixed.tsx` - Implementation example

---

**Component Location:** `/imports/BedrockLogo.tsx`  
**Last Updated:** November 7, 2025  
**Version:** 1.0

# Bedrock Health Solutions Logo

This directory contains the official Bedrock Health Solutions logo component.

## Logo Component

**File:** `BedrockLogo.tsx`

### Features

- **SVG-based** - Crisp and scalable at any resolution
- **Two variants** - Full logo with text and icon-only version
- **Professional design** - Mountain/bedrock foundation with medical cross
- **Brand colors** - Uses official Bedrock Health brand colors (#0176d3)
- **Accessible** - Semantic SVG with proper labels

### Usage

```tsx
import { BedrockLogo } from '../imports/BedrockLogo';

// Full logo with text (for login pages, headers)
<BedrockLogo variant="full" className="h-20 w-auto" />

// Icon only (for sidebar, mobile, favicon)
<BedrockLogo variant="icon" className="w-8 h-8" />
```

### Variants

#### Full Logo (`variant="full"`)
- Includes icon + "BEDROCK HEALTH" text + "SOLUTIONS" tagline
- Best for: Login pages, headers, marketing materials
- Recommended height: 16px - 24px (h-16 to h-24)

#### Icon Logo (`variant="icon"`)
- Icon only with medical cross on foundation
- Best for: Sidebar, mobile navigation, favicon
- Recommended size: 32px - 48px (w-8 h-8 to w-12 h-12)

### Design Elements

1. **Foundation** - Layered mountain/bedrock triangles representing stability and solid foundation
2. **Medical Cross** - Healthcare symbol in white, representing wellness and care
3. **Color Palette**:
   - Primary Blue: `#0176d3` (brand primary)
   - Dark Blue: `#014486` (depth/shadow)
   - White: `#ffffff` (medical cross)
   - Text Dark: `#1a1a1a` (BEDROCK text)
   - Text Gray: `#6b7280` (SOLUTIONS tagline)

### Brand Guidelines

- **Always use** the official BedrockLogo component
- **Never** modify the logo proportions or colors
- **Maintain** adequate white space around the logo
- **Use** high-resolution displays - SVG scales perfectly
- **Accessibility** - Logo includes semantic meaning for screen readers

### Where It's Used

- `/components/LoginPage-fixed.tsx` - Login page header
- `/components/DashboardLayout.tsx` - Sidebar header
- Future: Email templates, marketing pages, mobile apps

### Migration Notes

**Previous:** Logo was imported from Figma assets (`figma:asset/...`)  
**Current:** Native SVG component for better control and consistency

This ensures the logo:
- Loads faster (no external asset download)
- Scales perfectly at any size
- Matches brand guidelines exactly
- Can be themed/customized if needed
- Works offline

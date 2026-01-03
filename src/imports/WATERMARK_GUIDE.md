# Bedrock Health Logo Watermark Guide

This guide explains the available watermark files and how to use them.

## Available Watermark Files

### 1. `bedrock-watermark.svg`
**Full logo with diagonal rotation**
- Size: 400x400px
- Orientation: -45° diagonal (classic watermark style)
- Contains: Logo icon + "BEDROCK HEALTH SOLUTIONS" text
- Opacity: ~8%
- Best for: Documents, PDFs, presentations

### 2. `bedrock-watermark-icon-only.svg`
**Icon only (hexagonal pinwheel)**
- Size: 300x300px
- Orientation: Centered, no rotation
- Contains: Logo icon only
- Opacity: ~8%
- Best for: Backgrounds, subtle branding, small spaces

### 3. `bedrock-watermark-horizontal.svg`
**Horizontal layout without rotation**
- Size: 600x200px
- Orientation: Horizontal (no rotation)
- Contains: Logo icon + text in horizontal layout
- Opacity: ~8%
- Best for: Headers, footers, letterheads

## Usage Examples

### In HTML
```html
<!-- As background image -->
<div style="background-image: url('/imports/bedrock-watermark.svg'); 
            background-repeat: no-repeat; 
            background-position: center; 
            background-size: 500px;">
  Your content here
</div>

<!-- As img tag -->
<img src="/imports/bedrock-watermark-icon-only.svg" 
     style="position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            width: 400px; 
            opacity: 0.5; 
            pointer-events: none; 
            z-index: -1;" 
     alt="Watermark" />
```

### In CSS
```css
/* Full page watermark */
.watermark-page {
  position: relative;
}

.watermark-page::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  background-image: url('/imports/bedrock-watermark.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.5;
  pointer-events: none;
  z-index: -1;
}

/* Repeating pattern */
.watermark-repeat {
  background-image: url('/imports/bedrock-watermark-icon-only.svg');
  background-repeat: repeat;
  background-size: 200px;
  opacity: 0.03;
}
```

### In React Component
```tsx
// Using the BedrockWatermark component (recommended)
import { BedrockWatermark } from './components/BedrockWatermark';

function MyPage() {
  return (
    <div>
      <BedrockWatermark opacity={8} size={400} />
      {/* Your content */}
    </div>
  );
}

// Using SVG directly
function MyPage() {
  return (
    <div style={{ position: 'relative' }}>
      <img 
        src="/imports/bedrock-watermark.svg"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          opacity: 0.08,
          pointerEvents: 'none',
          zIndex: -1
        }}
        alt="Watermark"
      />
      {/* Your content */}
    </div>
  );
}
```

### For Print/PDF
```css
@media print {
  .print-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    width: 600px;
    opacity: 0.1;
    z-index: -1;
  }
}
```

```html
<img src="/imports/bedrock-watermark.svg" class="print-watermark" alt="Watermark" />
```

## Customization

### Adjusting Opacity
The SVG files have built-in opacity (~8%). You can further adjust using CSS:

```css
.watermark {
  opacity: 0.5; /* 50% visible */
}
```

Or multiply the opacity values:
- SVG opacity: 0.08 (8%)
- CSS opacity: 0.5 (50%)
- Final opacity: 0.08 × 0.5 = 0.04 (4%)

### Adjusting Size
```css
/* Larger watermark */
.watermark-large {
  width: 800px;
  height: 800px;
}

/* Smaller watermark */
.watermark-small {
  width: 200px;
  height: 200px;
}
```

### Adjusting Position
```css
/* Top right corner */
.watermark-top-right {
  position: fixed;
  top: 20px;
  right: 20px;
  transform: none;
}

/* Bottom center */
.watermark-bottom {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}
```

### Custom Rotation
```css
/* Steeper diagonal */
.watermark-steep {
  transform: translate(-50%, -50%) rotate(-60deg);
}

/* No rotation */
.watermark-straight {
  transform: translate(-50%, -50%) rotate(0deg);
}
```

## Best Practices

1. **Opacity**: Keep between 3-10% for documents, 1-5% for backgrounds
2. **Size**: Scale based on page/container size (typically 30-50% of container)
3. **Position**: Center for documents, corners for headers/footers
4. **Z-index**: Use negative z-index or low value to stay behind content
5. **Pointer Events**: Always set `pointer-events: none` to prevent interaction
6. **Print**: Increase opacity slightly for print (10-15%) as printers often make things lighter

## Integration with Existing Component

The React component `/components/BedrockWatermark.tsx` automatically uses the BedrockLogo component. For standalone SVG usage, use the files in `/imports/`.

## Color Customization

To create a custom colored watermark, open the SVG file and modify the `stop-opacity` values in the gradients:

```xml
<!-- More visible (15%) -->
<stop offset="0%" stop-color="#F97316" stop-opacity="0.15" />

<!-- Less visible (3%) -->
<stop offset="0%" stop-color="#F97316" stop-opacity="0.03" />
```

## File Locations

- `/imports/bedrock-watermark.svg` - Diagonal full logo
- `/imports/bedrock-watermark-icon-only.svg` - Icon only
- `/imports/bedrock-watermark-horizontal.svg` - Horizontal layout
- `/components/BedrockWatermark.tsx` - React component (uses BedrockLogo)

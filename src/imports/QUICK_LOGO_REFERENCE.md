# 🚀 Quick Logo Reference Card

## Import
```tsx
import { BedrockLogo } from '../imports/BedrockLogo';
```

---

## Full Logo (with text)
```tsx
<BedrockLogo variant="full" className="h-20 w-auto" />
```
**Use for:** Login pages, headers, marketing

---

## Icon Only
```tsx
<BedrockLogo variant="icon" className="w-8 h-8" />
```
**Use for:** Sidebar, mobile, favicon

---

## Common Sizes

### Full Logo
```tsx
h-12  // Small (48px)
h-16  // Medium (64px)
h-20  // Large (80px)
h-24  // XLarge (96px)
```

### Icon Logo
```tsx
w-6 h-6   // Small (24px)
w-8 h-8   // Medium (32px)
w-10 h-10 // Large (40px)
w-12 h-12 // XLarge (48px)
```

---

## Brand Colors
```
#0176d3  Primary Blue
#014486  Deep Blue
#ffffff  White (cross)
```

---

## Examples

### Header
```tsx
<header className="flex items-center justify-between p-4">
  <BedrockLogo variant="full" className="h-12 w-auto" />
</header>
```

### Sidebar
```tsx
<div className="flex items-center gap-3 p-6">
  <BedrockLogo variant="icon" className="w-8 h-8" />
  <span>Bedrock Health</span>
</div>
```

### Responsive
```tsx
<div className="hidden md:block">
  <BedrockLogo variant="full" className="h-16 w-auto" />
</div>
<div className="md:hidden">
  <BedrockLogo variant="icon" className="w-10 h-10" />
</div>
```

---

## Documentation
- Full Guide: `/LOGO_INTEGRATION_SUMMARY.md`
- Technical: `/imports/LOGO_README.md`
- Variants: `/imports/LOGO_VARIANTS.md`
- Branding: `/BRANDING_GUIDE.md`

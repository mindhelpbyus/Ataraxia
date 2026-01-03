import React from 'react';
import { Button } from './ui/button';
import { Plus, Download } from 'lucide-react';

/**
 * Button Design System Showcase
 * Matches the exact design specification with CSS variables
 */
export function ButtonShowcase() {
  return (
    <div className="w-full min-h-screen bg-background p-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold text-gray-900">Button Design System</h1>
          <p className="text-lg text-gray-600">
            Using CSS variables from design tokens • Orange (#F97316) primary color
          </p>
        </div>

        {/* PRIMARY BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Primary Buttons</h2>
          <p className="text-sm text-gray-600">Orange background with white text</p>

          {/* Size: Large */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Large (18px)</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="default" size="lg">
                <Plus />
                Placeholder
                <Plus />
              </Button>
              <Button variant="default" size="lg" disabled>
                <Plus />
                Disabled
                <Plus />
              </Button>
              <Button variant="default" size="icon-lg">
                <Plus />
              </Button>
            </div>
          </div>

          {/* Size: Medium */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Medium / Default (16px)</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="default">
                <Plus />
                Placeholder
                <Plus />
              </Button>
              <Button variant="default" disabled>
                <Plus />
                Disabled
                <Plus />
              </Button>
              <Button variant="default" size="icon">
                <Plus />
              </Button>
            </div>
          </div>

          {/* Size: Small */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Small (14px)</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="default" size="sm">
                <Plus />
                Placeholder
                <Plus />
              </Button>
              <Button variant="default" size="sm" disabled>
                <Plus />
                Disabled
                <Plus />
              </Button>
              <Button variant="default" size="icon-sm">
                <Plus />
              </Button>
            </div>
          </div>

          {/* Size: Extra Small */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Extra Small (12px)</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="default" size="xs">
                <Download className="size-3.5" />
                Placeholder
                <Download className="size-3.5" />
              </Button>
              <Button variant="default" size="xs" disabled>
                <Download className="size-3.5" />
                Disabled
                <Download className="size-3.5" />
              </Button>
              <Button variant="default" size="icon-xs">
                <Download className="size-3.5" />
              </Button>
            </div>
          </div>
        </section>

        {/* SECONDARY BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Secondary Buttons</h2>
          <p className="text-sm text-gray-600">Gray background with dark text</p>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">All Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="secondary" size="lg">
                <Plus />
                Large
                <Plus />
              </Button>
              <Button variant="secondary">
                <Plus />
                Medium
                <Plus />
              </Button>
              <Button variant="secondary" size="sm">
                <Plus />
                Small
                <Plus />
              </Button>
              <Button variant="secondary" size="xs">
                <Download className="size-3.5" />
                XSmall
                <Download className="size-3.5" />
              </Button>
              <Button variant="secondary" size="icon">
                <Plus />
              </Button>
              <Button variant="secondary" disabled>
                <Plus />
                Disabled
                <Plus />
              </Button>
            </div>
          </div>
        </section>

        {/* OUTLINE BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Outline Buttons</h2>
          <p className="text-sm text-gray-600">White background with border</p>

          {/* Standard Rounded */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Standard Rounded</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="outline" size="lg">
                <Plus />
                Large
                <Plus />
              </Button>
              <Button variant="outline">
                <Plus />
                Medium
                <Plus />
              </Button>
              <Button variant="outline" size="sm">
                <Plus />
                Small
                <Plus />
              </Button>
              <Button variant="outline" size="xs">
                <Download className="size-3.5" />
                XSmall
                <Download className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon">
                <Plus />
              </Button>
              <Button variant="outline" disabled>
                <Plus />
                Disabled
                <Plus />
              </Button>
            </div>
          </div>

          {/* Pill-shaped */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Pill-shaped (rounded-[100px])</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="outline" shape="pill" size="icon">
                <Plus />
              </Button>
              <Button variant="outline" shape="pill" size="icon-sm">
                <Plus />
              </Button>
              <Button variant="outline" shape="pill" size="icon-xs">
                <Download className="size-3.5" />
              </Button>
              <Button variant="outline" shape="pill" size="icon" disabled>
                <Plus />
              </Button>
            </div>
          </div>
        </section>

        {/* DESTRUCTIVE BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Destructive Buttons</h2>
          <p className="text-sm text-gray-600">Red outline with red text</p>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">All Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="destructive" size="lg">
                <Plus />
                Large
                <Plus />
              </Button>
              <Button variant="destructive">
                <Plus />
                Medium
                <Plus />
              </Button>
              <Button variant="destructive" size="sm">
                <Plus />
                Small
                <Plus />
              </Button>
              <Button variant="destructive" size="xs">
                <Download className="size-3.5" />
                XSmall
                <Download className="size-3.5" />
              </Button>
              <Button variant="destructive" disabled>
                <Plus />
                Disabled
                <Plus />
              </Button>
            </div>
          </div>
        </section>

        {/* GHOST BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Ghost Buttons</h2>
          <p className="text-sm text-gray-600">Transparent background</p>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">All Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="ghost" size="lg">
                <Plus />
                Large
                <Plus />
              </Button>
              <Button variant="ghost">
                <Plus />
                Medium
                <Plus />
              </Button>
              <Button variant="ghost" size="sm">
                <Plus />
                Small
                <Plus />
              </Button>
              <Button variant="ghost" size="xs">
                <Download className="size-3.5" />
                XSmall
                <Download className="size-3.5" />
              </Button>
              <Button variant="ghost" disabled>
                <Plus />
                Disabled
                <Plus />
              </Button>
            </div>
          </div>
        </section>

        {/* LINK BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Link Buttons</h2>
          <p className="text-sm text-gray-600">Underlined text</p>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">All Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="link" size="lg">
                Placeholder
              </Button>
              <Button variant="link">
                Placeholder
              </Button>
              <Button variant="link" size="sm">
                Placeholder
              </Button>
              <Button variant="link" size="xs">
                Placeholder
              </Button>
              <Button variant="link" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </section>

        {/* COMPARISON WITH OLD DESIGN */}
        <section className="space-y-6 border-t pt-8">
          <h2 className="text-2xl font-semibold text-gray-900">Design System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">✅ Using CSS Variables</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">--action-primary-base</code></li>
                <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">--action-primary-hover</code></li>
                <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">--action-secondary-base-2</code></li>
                <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">--content-dark-primary</code></li>
                <li>• <code className="bg-gray-100 px-2 py-0.5 rounded">--content-light-primary</code></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">✅ Design Spec Compliance</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Orange (#F97316) primary color</li>
                <li>• 5 variants: default, secondary, outline, destructive, ghost, link</li>
                <li>• 4 sizes: lg (18px), default (16px), sm (14px), xs (12px)</li>
                <li>• Icon button support (icon-lg, icon, icon-sm, icon-xs)</li>
                <li>• Pill-shaped support for circular icon buttons</li>
                <li>• Proper hover, active, and disabled states</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

/**
 * Avatar Design System Showcase
 * Displays all avatar sizes and status badge variants matching the design specification
 */
export function AvatarShowcase() {
  return (
    <div className="w-full min-h-screen bg-background p-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-medium text-[var(--content-dark-primary)]">Avatar</h1>
          <p className="text-lg text-[var(--content-dark-secondary)]">
            Avatars are used to show a thumbnail representation of an individual or business in the interface.
          </p>
        </div>

        {/* Size Variants with Images */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Size Variants</h2>
          <div className="flex items-end gap-6">
            <div className="space-y-2 flex flex-col items-center">
              <Avatar className="size-32">
                <AvatarImage src="https://placehold.co/128x128" />
                <AvatarFallback>128</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">128px</span>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <Avatar className="size-16">
                <AvatarImage src="https://placehold.co/64x64" />
                <AvatarFallback>64</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">64px</span>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <Avatar className="size-10">
                <AvatarImage src="https://placehold.co/40x40" />
                <AvatarFallback>40</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">40px (default)</span>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <Avatar className="size-8">
                <AvatarImage src="https://placehold.co/32x32" />
                <AvatarFallback>32</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">32px</span>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <Avatar className="size-6">
                <AvatarImage src="https://placehold.co/24x24" />
                <AvatarFallback>24</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">24px</span>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <Avatar className="size-4">
                <AvatarImage src="https://placehold.co/16x16" />
                <AvatarFallback>16</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">16px</span>
            </div>
          </div>
        </section>

        {/* Work Status Badges (Top-Right) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Work Status Badges (Top-Right)</h2>
          <p className="text-sm text-muted-foreground">
            Active, Busy, and Away status indicators appear in the top-right corner
          </p>

          <div className="space-y-8">
            {/* Active Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Active (Green with Checkmark)</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-24" status="active">
                    <AvatarFallback className="bg-blue-100 text-blue-600">AB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">96px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-10" status="active">
                    <AvatarFallback className="bg-blue-100 text-blue-600">AB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-8" status="active">
                    <AvatarFallback className="bg-blue-100 text-blue-600">AB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-6" status="active">
                    <AvatarFallback className="bg-blue-100 text-blue-600">AB</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
              </div>
            </div>

            {/* Busy Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Busy (Orange with Minus)</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-24" status="busy">
                    <AvatarFallback className="bg-purple-100 text-purple-600">CD</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">96px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-10" status="busy">
                    <AvatarFallback className="bg-purple-100 text-purple-600">CD</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-8" status="busy">
                    <AvatarFallback className="bg-purple-100 text-purple-600">CD</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-6" status="busy">
                    <AvatarFallback className="bg-purple-100 text-purple-600">CD</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
              </div>
            </div>

            {/* Away Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Away (Gray with Pause)</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-24" status="away">
                    <AvatarFallback className="bg-green-100 text-green-600">EF</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">96px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-10" status="away">
                    <AvatarFallback className="bg-green-100 text-green-600">EF</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-8" status="away">
                    <AvatarFallback className="bg-green-100 text-green-600">EF</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-6" status="away">
                    <AvatarFallback className="bg-green-100 text-green-600">EF</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Presence Status Badges (Bottom-Right) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Presence Status Badges (Bottom-Right)</h2>
          <p className="text-sm text-muted-foreground">
            Online, DND, Focus, and Offline status indicators appear in the bottom-right corner
          </p>

          <div className="space-y-8">
            {/* Online Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Online (Green Dot)</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-24" status="online">
                    <AvatarFallback className="bg-blue-100 text-blue-600">GH</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">96px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-10" status="online">
                    <AvatarFallback className="bg-blue-100 text-blue-600">GH</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-8" status="online">
                    <AvatarFallback className="bg-blue-100 text-blue-600">GH</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-6" status="online">
                    <AvatarFallback className="bg-blue-100 text-blue-600">GH</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
              </div>
            </div>

            {/* DND Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Do Not Disturb (Red with Dot)</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-24" status="dnd">
                    <AvatarFallback className="bg-action-light text-action">IJ</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">96px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-10" status="dnd">
                    <AvatarFallback className="bg-action-light text-action">IJ</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-8" status="dnd">
                    <AvatarFallback className="bg-action-light text-action">IJ</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-6" status="dnd">
                    <AvatarFallback className="bg-action-light text-action">IJ</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
              </div>
            </div>

            {/* Focus Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Focus (Purple/Indigo)</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-24" status="focus">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">KL</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">96px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-10" status="focus">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">KL</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-8" status="focus">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">KL</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-6" status="focus">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">KL</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
              </div>
            </div>

            {/* Offline Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Offline (Gray with Dot)</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-24" status="offline">
                    <AvatarFallback className="bg-muted text-muted-foreground">MN</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">96px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-10" status="offline">
                    <AvatarFallback className="bg-muted text-muted-foreground">MN</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">40px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-8" status="offline">
                    <AvatarFallback className="bg-muted text-muted-foreground">MN</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="size-6" status="offline">
                    <AvatarFallback className="bg-muted text-muted-foreground">MN</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">24px</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bordered Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Bordered Variants</h2>
          <p className="text-sm text-muted-foreground">
            Avatars with border-zinc-100 outline
          </p>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-32" bordered>
                <AvatarImage src="https://placehold.co/128x128" />
                <AvatarFallback>128</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">128px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-16" bordered>
                <AvatarImage src="https://placehold.co/64x64" />
                <AvatarFallback>64</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">64px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-10" bordered>
                <AvatarImage src="https://placehold.co/40x40" />
                <AvatarFallback>40</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">40px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-8" bordered>
                <AvatarImage src="https://placehold.co/32x32" />
                <AvatarFallback>32</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">32px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-6" bordered>
                <AvatarImage src="https://placehold.co/24x24" />
                <AvatarFallback>24</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">24px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="size-4" bordered>
                <AvatarImage src="https://placehold.co/16x16" />
                <AvatarFallback>16</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">16px</span>
            </div>
          </div>
        </section>

        {/* Real Use Cases */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Real Use Cases</h2>

          <div className="space-y-8">
            {/* User Profile */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">User Profile</h3>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="size-16" status="online">
                  <AvatarFallback className="bg-[#1E7048] text-white text-xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">Dr. Jane Doe</h4>
                  <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </div>

            {/* Therapist List */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">Therapist List</h3>
              <div className="space-y-2">
                {[
                  { name: 'Dr. Sarah Wilson', status: 'active', initials: 'SW' },
                  { name: 'Dr. Michael Chen', status: 'busy', initials: 'MC' },
                  { name: 'Dr. Emily Rodriguez', status: 'away', initials: 'ER' },
                  { name: 'Dr. James Anderson', status: 'offline', initials: 'JA' },
                ].map((therapist) => (
                  <div key={therapist.initials} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-[var(--surface-warm)]">
                    <Avatar className="size-10" status={therapist.status as any}>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {therapist.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{therapist.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{therapist.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Design System Features */}
        <section className="space-y-6 border-t pt-8">
          <h2 className="text-2xl font-semibold text-foreground">Design System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">✅ Status Types</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Active:</strong> Green with checkmark (top-right)</li>
                <li>• <strong>Busy:</strong> Orange with minus (top-right)</li>
                <li>• <strong>Away:</strong> Gray with pause (top-right)</li>
                <li>• <strong>Online:</strong> Green dot (bottom-right)</li>
                <li>• <strong>DND:</strong> Red with dot (bottom-right)</li>
                <li>• <strong>Focus:</strong> Purple/Indigo (bottom-right)</li>
                <li>• <strong>Offline:</strong> Gray with dot (bottom-right)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">✅ Sizes & Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Six sizes: 128px, 64px, 40px, 32px, 24px, 16px</li>
                <li>• Status badge positioning (top-right/bottom-right)</li>
                <li>• Bordered variant with zinc-100</li>
                <li>• Rounded-full by default</li>
                <li>• Supports images and fallback text</li>
                <li>• Auto-placement based on status type</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

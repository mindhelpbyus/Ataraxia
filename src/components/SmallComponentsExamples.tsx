import React from "react";
import { Tag } from "./ui/tag";
import { StatusDot } from "./ui/status-dot";
import { StatusSquare } from "./ui/status-square";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./ui/pagination";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { List, LayoutGrid, Table as TableIcon, Columns } from "lucide-react";

/**
 * Small Components Examples
 * 
 * Showcases all small UI components from the design system:
 * - Tags (filled & outlined)
 * - Status Dots & Squares
 * - Badges (with dots, various colors)
 * - Toggles/Switches
 * - Pagination
 * - Avatars with status indicators
 * - Tabs (multiple styles)
 * - Checkboxes & Radio Buttons
 */
export function SmallComponentsExamples() {
  const [switchValue, setSwitchValue] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("list");

  return (
    <div className="flex flex-col gap-16 p-8 max-w-7xl mx-auto">
      {/* Tags */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Tags
        </h2>
        <p className="mb-6 text-lg text-[var(--content-dark-secondary)]">
          Tags represent a set of interactive, merchant-supplied keywords that help label, organize, and categorize objects.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <Tag variant="filled">Tag Content</Tag>
          <Tag variant="filled" removable onRemove={() => console.log("removed")}>
            Removable Tag
          </Tag>
          <Tag variant="outlined">Outlined Tag</Tag>
          <Tag variant="outlined" removable onRemove={() => console.log("removed")}>
            Removable Outlined
          </Tag>
        </div>
      </section>

      {/* Status Indicators */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Status Indicators
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-xl font-medium">Status Dots</h3>
            <div className="space-y-4">
              {/* Medium size dots */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Medium (default)</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <StatusDot variant="blue" size="md" />
                    <span className="text-sm">Blue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="green" size="md" />
                    <span className="text-sm">Green</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="orange" size="md" />
                    <span className="text-sm">Orange</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="yellow" size="md" />
                    <span className="text-sm">Yellow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="red" size="md" />
                    <span className="text-sm">Red</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="purple" size="md" />
                    <span className="text-sm">Purple</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="neutral" size="md" />
                    <span className="text-sm">Neutral</span>
                  </div>
                </div>
              </div>
              
              {/* Small size dots */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Small</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <StatusDot variant="blue" size="sm" />
                    <span className="text-sm">Blue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="green" size="sm" />
                    <span className="text-sm">Green</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="orange" size="sm" />
                    <span className="text-sm">Orange</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="yellow" size="sm" />
                    <span className="text-sm">Yellow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="red" size="sm" />
                    <span className="text-sm">Red</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="purple" size="sm" />
                    <span className="text-sm">Purple</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="neutral" size="sm" />
                    <span className="text-sm">Neutral</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-3 text-xl font-medium">Status Squares</h3>
            <div className="flex items-center gap-4">
              <StatusSquare variant="blue" />
              <StatusSquare variant="green" />
              <StatusSquare variant="orange" />
              <StatusSquare variant="yellow" />
              <StatusSquare variant="red" />
              <StatusSquare variant="purple" />
              <StatusSquare variant="neutral" />
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Badges
        </h2>
        <p className="mb-6 text-lg text-[var(--content-dark-secondary)]">
          Badges are used to inform merchants of the status of an object or of an action that's been taken.
        </p>
        
        <div className="space-y-6">
          {/* With dots - Small */}
          <div>
            <h3 className="mb-3 text-base font-medium">Small Size with Dots</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="green" dot size="sm">Badge</Badge>
              <Badge variant="blue" dot size="sm">Badge</Badge>
              <Badge variant="yellow" dot size="sm">Badge</Badge>
              <Badge variant="purple" dot size="sm">Badge</Badge>
              <Badge variant="red" dot size="sm">Badge</Badge>
              <Badge variant="orange" dot size="sm">Badge</Badge>
              <Badge variant="neutral" dot size="sm">Badge</Badge>
            </div>
          </div>

          {/* Pill badges with dots - Medium */}
          <div>
            <h3 className="mb-3 text-base font-medium">Medium Size with Dots</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="green" dot size="md">Badge</Badge>
              <Badge variant="blue" dot size="md">Badge</Badge>
              <Badge variant="yellow" dot size="md">Badge</Badge>
              <Badge variant="purple" dot size="md">Badge</Badge>
              <Badge variant="red" dot size="md">Badge</Badge>
              <Badge variant="orange" dot size="md">Badge</Badge>
              <Badge variant="neutral" dot size="md">Badge</Badge>
            </div>
          </div>

          {/* Square variants - Small */}
          <div>
            <h3 className="mb-3 text-base font-medium">Square Badges (Small)</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="green-square" size="sm">Badge</Badge>
              <Badge variant="blue-square" size="sm">Badge</Badge>
              <Badge variant="yellow-square" size="sm">Badge</Badge>
              <Badge variant="purple-square" size="sm">Badge</Badge>
              <Badge variant="red-square" size="sm">Badge</Badge>
              <Badge variant="orange-square" size="sm">Badge</Badge>
              <Badge variant="neutral-square" size="sm">Badge</Badge>
            </div>
          </div>

          {/* Square variants - Medium */}
          <div>
            <h3 className="mb-3 text-base font-medium">Square Badges (Medium)</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="green-square" size="md">Badge</Badge>
              <Badge variant="blue-square" size="md">Badge</Badge>
              <Badge variant="yellow-square" size="md">Badge</Badge>
              <Badge variant="purple-square" size="md">Badge</Badge>
              <Badge variant="red-square" size="md">Badge</Badge>
              <Badge variant="orange-square" size="md">Badge</Badge>
              <Badge variant="neutral-square" size="md">Badge</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Toggle/Switch */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Toggle / Switch
        </h2>
        <p className="mb-6 text-lg text-[var(--content-dark-secondary)]">
          A toggle is used to view or switch between enabled or disabled states.
        </p>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Switch checked={false} />
            <Label>Unchecked</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={switchValue} onCheckedChange={setSwitchValue} />
            <Label>Interactive</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={true} />
            <Label>Checked</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch disabled />
            <Label>Disabled</Label>
          </div>
        </div>
      </section>

      {/* Pagination */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Pagination
        </h2>
        <p className="mb-6 text-lg text-[var(--content-dark-secondary)]">
          Use pagination to let merchants move through an ordered collection of items that has been split into pages.
        </p>
        
        <Pagination>
          <PaginationContent>
            <PaginationPrevious disabled href="#" />
            <PaginationItem>
              <PaginationLink isActive href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">4</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">5</PaginationLink>
            </PaginationItem>
            <PaginationEllipsis />
            <PaginationItem>
              <PaginationLink href="#">10</PaginationLink>
            </PaginationItem>
            <PaginationNext href="#" />
          </PaginationContent>
        </Pagination>
      </section>

      {/* Avatars */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Avatars with Status
        </h2>
        <p className="mb-6 text-lg text-[var(--content-dark-secondary)]">
          Avatars are used to show a thumbnail representation of an individual or business in the interface.
        </p>
        
        <div className="space-y-6">
          {/* Top-right status */}
          <div>
            <h3 className="mb-3 text-base font-medium">Status Top-Right</h3>
            <div className="flex items-center gap-4">
              <Avatar status="online" statusPlacement="top-right" className="size-24">
                <AvatarImage src="https://placehold.co/96x96" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar status="busy" statusPlacement="top-right" className="size-16">
                <AvatarImage src="https://placehold.co/64x64" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <Avatar status="away" statusPlacement="top-right" className="size-10">
                <AvatarImage src="https://placehold.co/40x40" />
                <AvatarFallback>BC</AvatarFallback>
              </Avatar>
              <Avatar status="offline" statusPlacement="top-right" className="size-8">
                <AvatarImage src="https://placehold.co/32x32" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Bottom-right status */}
          <div>
            <h3 className="mb-3 text-base font-medium">Status Bottom-Right</h3>
            <div className="flex items-center gap-4">
              <Avatar status="online" className="size-24">
                <AvatarImage src="https://placehold.co/96x96" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar status="busy" className="size-16">
                <AvatarImage src="https://placehold.co/64x64" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <Avatar status="away" className="size-10">
                <AvatarImage src="https://placehold.co/40x40" />
                <AvatarFallback>BC</AvatarFallback>
              </Avatar>
              <Avatar status="offline" className="size-8">
                <AvatarImage src="https://placehold.co/32x32" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Tabs
        </h2>
        <p className="mb-6 text-lg text-[var(--content-dark-secondary)]">
          Tabs are used to organize content by grouping similar information on the same page.
        </p>
        
        <div className="space-y-8">
          {/* Underline variant */}
          <div>
            <h3 className="mb-3 text-base font-medium">Underline Tabs</h3>
            <Tabs defaultValue="tab1">
              <TabsList variant="underline">
                <TabsTrigger value="tab1" data-variant="underline">
                  <List className="size-5" />
                  Title
                </TabsTrigger>
                <TabsTrigger value="tab2" data-variant="underline">
                  <LayoutGrid className="size-5" />
                  Title
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Solid variant */}
          <div>
            <h3 className="mb-3 text-base font-medium">Solid Tabs</h3>
            <Tabs defaultValue="menu1">
              <TabsList variant="solid">
                <TabsTrigger value="menu1" data-variant="solid">
                  <Columns className="size-4" />
                  Menu
                </TabsTrigger>
                <TabsTrigger value="menu2" data-variant="solid">
                  <Columns className="size-4" />
                  Menu
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Button group variant */}
          <div>
            <h3 className="mb-3 text-base font-medium">Button Group Tabs</h3>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList variant="button-group">
                <TabsTrigger value="list" data-variant="button-group">
                  <List className="size-5" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" data-variant="button-group">
                  <Columns className="size-5" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="table" data-variant="button-group">
                  <TableIcon className="size-5" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="grid" data-variant="button-group">
                  <LayoutGrid className="size-5" />
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Checkboxes & Radio Buttons */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Form Controls
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-base font-medium">Checkboxes</h3>
            <p className="mb-4 text-sm text-[var(--content-dark-secondary)]">
              The Checkbox is an input control to select one or more options. The option can be true, false, or indeterminate.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="check-default" />
                <Label htmlFor="check-default">Default</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check-checked" checked />
                <Label htmlFor="check-checked">Checked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check-disabled" disabled />
                <Label htmlFor="check-disabled">Disabled</Label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-medium">Radio Buttons</h3>
            <p className="mb-4 text-sm text-[var(--content-dark-secondary)]">
              The Radio Button is an input control to select a single option from the list.
            </p>
            <RadioGroup defaultValue="option1">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option1" id="r1" />
                  <Label htmlFor="r1">Option 1</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option2" id="r2" />
                  <Label htmlFor="r2">Option 2</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option3" id="r3" disabled />
                  <Label htmlFor="r3">Disabled</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>
    </div>
  );
}
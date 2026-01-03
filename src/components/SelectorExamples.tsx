import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { FormHelper } from "./ui/form-helper";
import { MenuItem } from "./ui/menu-item";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar, User, Image } from "lucide-react";

/**
 * Comprehensive Selector Component Examples
 * 
 * This component demonstrates all selector patterns from the design system:
 * - Basic Select (default, hover, focus, disabled states)
 * - Date Picker styled selects
 * - Menu/Option variations (basic, with icons, with avatars, with checkboxes, with radio buttons)
 */
export function SelectorExamples() {
  const [selectedValue, setSelectedValue] = React.useState("");
  const [dateRange, setDateRange] = React.useState("");

  return (
    <div className="flex flex-col gap-16 p-8">
      {/* Basic Select Examples */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Select Component
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Default State */}
          <div className="flex flex-col gap-2">
            <Label>Label</Label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger>
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
                <SelectItem value="option4">Option 4</SelectItem>
                <SelectItem value="option5">Option 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* With Selected Value */}
          <div className="flex flex-col gap-2">
            <Label>Label</Label>
            <Select defaultValue="selected">
              <SelectTrigger>
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">Selected Option</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disabled State */}
          <div className="flex flex-col gap-2">
            <Label>Label</Label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Date Picker Style Selects */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Date Picker Style
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Default State */}
          <div className="flex flex-col gap-2">
            <Label>Input Label</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <Calendar className="size-5 text-[var(--content-dark-secondary)]" />
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="thisMonth">This month</SelectItem>
                <SelectItem value="lastMonth">Last month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* With Value */}
          <div className="flex flex-col gap-2">
            <Label>Input Label</Label>
            <Select defaultValue="last7days">
              <SelectTrigger>
                <Calendar className="size-5 text-[var(--content-dark-secondary)]" />
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disabled */}
          <div className="flex flex-col gap-2">
            <Label>Input Label</Label>
            <Select disabled>
              <SelectTrigger>
                <Calendar className="size-5 text-[var(--content-dark-disable)]" />
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Menu Item Variations */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Menu / Option Items
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Options */}
          <div className="w-96 rounded bg-white shadow-[0px_4px_20px_0px_rgba(230,233,239,1.00)] outline outline-1 outline-offset-[-1px] outline-gray-100">
            <div className="pb-1.5">
              <MenuItem>Option</MenuItem>
              <MenuItem>Option</MenuItem>
              <MenuItem>Option (Hover simulation)</MenuItem>
              <MenuItem>Option</MenuItem>
              <MenuItem disabled>Disabled Option</MenuItem>
            </div>
          </div>

          {/* Options with Checkboxes */}
          <div className="w-96 rounded bg-white shadow-[0px_4px_20px_0px_rgba(230,233,239,1.00)] outline outline-1 outline-offset-[-1px] outline-gray-100">
            <div className="pb-1.5">
              <MenuItem variant="with-checkbox">Option</MenuItem>
              <MenuItem variant="with-checkbox" selected>Selected Option</MenuItem>
              <MenuItem variant="with-checkbox">Option</MenuItem>
              <MenuItem variant="with-checkbox" disabled>Disabled Option</MenuItem>
            </div>
          </div>

          {/* Options with Radio Buttons */}
          <div className="w-96 rounded bg-white shadow-[0px_4px_20px_0px_rgba(230,233,239,1.00)] outline outline-1 outline-offset-[-1px] outline-gray-100">
            <div className="pb-1.5">
              <MenuItem variant="with-radio">Option</MenuItem>
              <MenuItem variant="with-radio" selected>Selected Option</MenuItem>
              <MenuItem variant="with-radio">Option</MenuItem>
              <MenuItem variant="with-radio" disabled>Disabled Option</MenuItem>
            </div>
          </div>

          {/* Options with Small Avatars */}
          <div className="w-96 rounded bg-white shadow-[0px_4px_20px_0px_rgba(230,233,239,1.00)] outline outline-1 outline-offset-[-1px] outline-gray-100">
            <div className="pb-1.5">
              <MenuItem
                variant="with-avatar"
                avatarSrc="https://placehold.co/24x24"
                avatarFallback="JD"
              >
                John Doe
              </MenuItem>
              <MenuItem
                variant="with-avatar"
                avatarSrc="https://placehold.co/24x24"
                avatarFallback="JS"
              >
                Jane Smith
              </MenuItem>
              <MenuItem
                variant="with-avatar"
                avatarSrc="https://placehold.co/24x24"
                avatarFallback="BC"
              >
                Bob Chen
              </MenuItem>
              <MenuItem
                variant="with-avatar"
                avatarSrc="https://placehold.co/24x24"
                avatarFallback="AD"
                disabled
              >
                Alice Davis (Disabled)
              </MenuItem>
            </div>
          </div>

          {/* Options with Large Avatars */}
          <div className="w-96 rounded bg-white shadow-[0px_4px_20px_0px_rgba(230,233,239,1.00)] outline outline-1 outline-offset-[-1px] outline-gray-100">
            <div className="pb-1.5">
              <MenuItem
                variant="with-avatar-large"
                avatarSrc="https://placehold.co/40x40"
                avatarFallback="JD"
                secondary="john.doe@example.com"
              >
                John Doe
              </MenuItem>
              <MenuItem
                variant="with-avatar-large"
                avatarSrc="https://placehold.co/40x40"
                avatarFallback="JS"
                secondary="jane.smith@example.com"
              >
                Jane Smith
              </MenuItem>
              <MenuItem
                variant="with-avatar-large"
                avatarSrc="https://placehold.co/40x40"
                avatarFallback="AD"
                secondary="alice@example.com"
                disabled
              >
                Alice Davis (Disabled)
              </MenuItem>
            </div>
          </div>

          {/* Options with Icons */}
          <div className="w-96 rounded bg-white shadow-[0px_4px_20px_0px_rgba(230,233,239,1.00)] outline outline-1 outline-offset-[-1px] outline-gray-100">
            <div className="pb-1.5">
              <MenuItem
                variant="with-icon"
                icon={<User className="size-6 text-slate-400" />}
                secondary="User profile settings"
              >
                Profile
              </MenuItem>
              <MenuItem
                variant="with-icon"
                icon={<Image className="size-6 text-slate-400" />}
                secondary="Manage your photos"
              >
                Gallery
              </MenuItem>
              <MenuItem
                variant="with-icon"
                icon={<Calendar className="size-6 text-slate-400" />}
                secondary="Schedule and events"
                disabled
              >
                Calendar (Disabled)
              </MenuItem>
            </div>
          </div>
        </div>
      </section>

      {/* Standalone Form Controls */}
      <section>
        <h2 className="mb-6 text-3xl font-medium text-[var(--content-dark-primary)]">
          Form Controls
        </h2>
        
        <div className="flex flex-col gap-6">
          {/* Checkboxes */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="check1" />
              <Label htmlFor="check1">Default Checkbox</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="check2" checked />
              <Label htmlFor="check2">Checked Checkbox</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="check3" disabled />
              <Label htmlFor="check3">Disabled Checkbox</Label>
            </div>
          </div>

          {/* Radio Buttons */}
          <RadioGroup defaultValue="option1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option1" id="radio1" />
                <Label htmlFor="radio1">Option 1</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option2" id="radio2" />
                <Label htmlFor="radio2">Option 2</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option3" id="radio3" disabled />
                <Label htmlFor="radio3">Disabled Option</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </section>
    </div>
  );
}

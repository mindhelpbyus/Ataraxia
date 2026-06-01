import React, { useState } from 'react';
import { InputField } from './ui/input-field';
import { PhoneInput } from './PhoneInput';
import { SearchBar } from './ui/search-bar';
import { TextareaField } from './ui/textarea-field';
import { SelectField } from './ui/select-field';
import { DatePickerField } from './ui/date-picker-field';
import { Input } from './ui/input';
import { Mail, User, Lock, Search, DollarSign } from 'lucide-react';

/**
 * Input Design System Showcase
 * Displays all input field variants matching the design specification
 */
export function InputShowcase() {
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('+1');
  const [nameValue, setNameValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [notesValue, setNotesValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

  return (
    <div className="w-full min-h-screen bg-background p-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold text-foreground">Input Field Design System</h1>
          <p className="text-lg text-muted-foreground">
            Using CSS variables from design tokens • All states and variants
          </p>
        </div>

        {/* BASE INPUT STATES */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Base Input States</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Base State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                helperText="We will notify the customer and issue a full refund"
              />
            </div>

            {/* Hover State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Hover State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                helperText="Hover over this input to see the state"
                className="hover:outline-[var(--interaction-outline-hover)]"
              />
            </div>

            {/* Focus/Active State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Focus/Active State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                value="Some text content"
                helperText="This input is focused/has content"
              />
            </div>

            {/* With Value */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Value</h3>
              <InputField
                label="Input Label"
                value="Enter your title here"
                helperText="Input field with existing value"
              />
            </div>

            {/* Error State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Error State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                error="This field is required"
              />
            </div>

            {/* Success State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Success State</h3>
              <InputField
                label="Input Label"
                value="valid@email.com"
                success
                helperText="Email address is valid"
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Disabled State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                disabled
                helperText="This field is disabled"
              />
            </div>

            {/* Required Field */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Required Field</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                required
                helperText="This field is required"
              />
            </div>
          </div>
        </section>

        {/* INPUT WITH ICONS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Input with Icons</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Icon */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Left Icon</h3>
              <InputField
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                helperText="Enter your email address"
              />
            </div>

            {/* Right Icon */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Right Icon</h3>
              <InputField
                label="Search"
                placeholder="Search..."
                rightIcon={<Search className="w-5 h-5" />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                helperText="Search for anything"
              />
            </div>

            {/* Both Icons */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Both Icons</h3>
              <InputField
                label="Amount"
                type="number"
                placeholder="0.00"
                leftIcon={<DollarSign className="w-5 h-5" />}
                rightIcon={<span className="text-xs">USD</span>}
                helperText="Enter amount in USD"
              />
            </div>

            {/* Icon with Character Count */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Icon + Character Count</h3>
              <InputField
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<User className="w-5 h-5" />}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                showCharCount
                maxLength={50}
                helperText="Enter your full name"
              />
            </div>
          </div>
        </section>

        {/* CHARACTER COUNTER */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Character Counter</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* With Counter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Character Count</h3>
              <InputField
                label="Bio"
                placeholder="Tell us about yourself"
                showCharCount
                maxLength={100}
                helperText="Maximum 100 characters"
              />
            </div>

            {/* Counter with Icons */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Counter + Icon</h3>
              <InputField
                label="Password"
                type="password"
                placeholder="Enter password"
                leftIcon={<Lock className="w-5 h-5" />}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                showCharCount
                maxLength={32}
                helperText="8-32 characters required"
              />
            </div>
          </div>
        </section>

        {/* SEARCH BAR */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Search Bar</h2>
          <p className="text-sm text-muted-foreground">
            Specialized search input with keyboard shortcuts (⌘+F or Ctrl+F) and clear button
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Search */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Basic Search</h3>
              <SearchBar
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                showKeyboardShortcut
              />
            </div>

            {/* Search with Value */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Search Value</h3>
              <SearchBar
                placeholder="Search appointments..."
                value="john doe"
                showKeyboardShortcut
              />
            </div>

            {/* Focused State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Focused State</h3>
              <SearchBar
                placeholder="Search..."
                showKeyboardShortcut
              />
              <p className="text-xs text-muted-foreground">Try pressing ⌘+F (Mac) or Ctrl+F (Windows) to focus</p>
            </div>

            {/* Without Keyboard Shortcut */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Without Keyboard Shortcuts</h3>
              <SearchBar
                placeholder="Search..."
                showKeyboardShortcut={false}
              />
            </div>

            {/* Custom Styling */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Rounded (Custom Style)</h3>
              <SearchBar
                placeholder="Search people..."
                className="rounded-full"
                showKeyboardShortcut
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Disabled State</h3>
              <SearchBar
                placeholder="Search..."
                disabled
                showKeyboardShortcut
              />
            </div>
          </div>
        </section>

        {/* PHONE INPUT */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Phone Input</h2>
          <p className="text-sm text-muted-foreground">
            Advanced phone input with country code selector, search icon, and character counter
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Phone Input */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Basic Phone Input</h3>
              <PhoneInput
                label="Phone Number"
                value={phoneValue}
                countryCode={phoneCountry}
                onPhoneChange={setPhoneValue}
                onCountryCodeChange={setPhoneCountry}
                helperText="Enter your phone number"
              />
            </div>

            {/* With Character Counter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Character Counter</h3>
              <PhoneInput
                label="Phone Number"
                countryCode="+91"
                showCharacterCount
                helperText="Enter your mobile number"
              />
            </div>

            {/* Error State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Error State</h3>
              <PhoneInput
                label="Phone Number"
                countryCode="+44"
                error="Invalid phone number format"
                required
              />
            </div>

            {/* Success State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Success State</h3>
              <PhoneInput
                label="Phone Number"
                countryCode="+61"
                value="412345678"
                success
                helperText="Phone number verified"
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Disabled State</h3>
              <PhoneInput
                label="Phone Number"
                countryCode="+1"
                value="5551234567"
                disabled
                helperText="Phone number cannot be changed"
              />
            </div>

            {/* Different Countries */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Different Country</h3>
              <PhoneInput
                label="Phone Number"
                countryCode="+49"
                showCharacterCount
                helperText="German mobile number"
              />
            </div>
          </div>
        </section>

        {/* TEXTAREA */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Text Area</h2>
          <p className="text-sm text-muted-foreground">
            Multi-line text input with label, character counter, and helper text
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Base State</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                helperText="We will notify the customer and issue a full refund"
              />
            </div>

            {/* With Character Counter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Character Counter</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                showCharCount
                maxLength={50}
                helperText="We will notify the customer and issue a full refund"
              />
            </div>

            {/* With Value */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Value</h3>
              <TextareaField
                label="Input Label"
                value="This is some sample text that the user has entered into the textarea field."
                showCharCount
                maxLength={200}
                helperText="We will notify the customer and issue a full refund"
              />
            </div>

            {/* Focused/Active State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Focused/Active State</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                showCharCount
                maxLength={50}
                helperText="Click to see the focused state"
              />
            </div>

            {/* Error State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Error State</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                showCharCount
                maxLength={50}
                error="This field is required and must contain at least 10 characters"
              />
            </div>

            {/* Success State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Success State</h3>
              <TextareaField
                label="Input Label"
                value="This feedback looks great!"
                showCharCount
                maxLength={50}
                success
                helperText="Feedback submitted successfully"
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Disabled State</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                showCharCount
                maxLength={50}
                disabled
                helperText="We will notify the customer and issue a full refund"
              />
            </div>

            {/* Required Field */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Required Field</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                showCharCount
                maxLength={50}
                required
                helperText="This field is required"
              />
            </div>

            {/* Long Text Example */}
            <div className="space-y-3 md:col-span-2">
              <h3 className="text-sm font-medium text-foreground">Session Notes (Real Use Case)</h3>
              <TextareaField
                label="Session Notes"
                placeholder="Document what happened during the session, client's presentation, topics discussed..."
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                showCharCount
                maxLength={500}
                helperText="Detailed notes help maintain continuity of care"
              />
            </div>
          </div>
        </section>

        {/* SELECT */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Select</h2>
          <p className="text-sm text-muted-foreground">
            Select allows users to make a single selection from a list of options
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Base State</h3>
              <SelectField
                label="Label"
                placeholder="Select an option"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                helperText="Select one option from the list"
              />
            </div>

            {/* With Value */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Selected Value</h3>
              <SelectField
                label="Label"
                value="option2"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                helperText="This select has a value selected"
              />
            </div>

            {/* Error State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Error State</h3>
              <SelectField
                label="Label"
                placeholder="Select an option"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                error="This field is required"
                required
              />
            </div>

            {/* Success State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Success State</h3>
              <SelectField
                label="Label"
                value="option1"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                success
                helperText="Selection confirmed"
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Disabled State</h3>
              <SelectField
                label="Label"
                value="option2"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                disabled
                helperText="This select is disabled"
              />
            </div>

            {/* Required Field */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Required Field</h3>
              <SelectField
                label="Label"
                placeholder="Select an option"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                required
                helperText="This field is required"
              />
            </div>

            {/* With Many Options */}
            <div className="space-y-3 md:col-span-2">
              <h3 className="text-sm font-medium text-foreground">Real Use Case: Status Selection</h3>
              <SelectField
                label="Appointment Status"
                value={selectValue}
                onValueChange={setSelectValue}
                options={[
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'no-show', label: 'No Show' },
                  { value: 'rescheduled', label: 'Rescheduled' },
                ]}
                required
                helperText="Select the current status of the appointment"
              />
            </div>
          </div>
        </section>

        {/* DATE PICKER */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Date Picker</h2>
          <p className="text-sm text-muted-foreground">
            Date picker allows users to select a date from a calendar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Base State</h3>
              <DatePickerField
                label="Label"
                placeholder="Select a date"
                helperText="Select a date from the calendar"
              />
            </div>

            {/* With Value */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">With Selected Value</h3>
              <DatePickerField
                label="Label"
                value={dateValue}
                onValueChange={setDateValue}
                helperText="This date picker has a value selected"
              />
            </div>

            {/* Error State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Error State</h3>
              <DatePickerField
                label="Label"
                placeholder="Select a date"
                error="This field is required"
                required
              />
            </div>

            {/* Success State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Success State</h3>
              <DatePickerField
                label="Label"
                value={new Date('2023-10-15')}
                success
                helperText="Date selected successfully"
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Disabled State</h3>
              <DatePickerField
                label="Label"
                value={new Date('2023-10-15')}
                disabled
                helperText="This date picker is disabled"
              />
            </div>

            {/* Required Field */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Required Field</h3>
              <DatePickerField
                label="Label"
                placeholder="Select a date"
                required
                helperText="This field is required"
              />
            </div>
          </div>
        </section>

        {/* FORM EXAMPLE */}
        <section className="space-y-6 border-t pt-8">
          <h2 className="text-2xl font-semibold text-foreground">Complete Form Example</h2>

          <div className="max-w-2xl space-y-6 bg-[var(--surface-warm)] p-8 rounded-lg">
            <InputField
              label="Full Name"
              placeholder="John Doe"
              leftIcon={<User className="w-5 h-5" />}
              required
              helperText="As it appears on your ID"
            />

            <InputField
              label="Email Address"
              type="email"
              placeholder="john.doe@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
              helperText="We'll never share your email"
            />

            <PhoneInput
              label="Phone Number"
              countryCode="+1"
              required
              showCharacterCount
              helperText="For account verification"
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              required
              showCharCount
              maxLength={32}
              helperText="Must be at least 8 characters"
            />

            <InputField
              label="Bio"
              placeholder="Tell us about yourself..."
              showCharCount
              maxLength={150}
              helperText="Optional - share a bit about yourself"
            />
          </div>
        </section>

        {/* DESIGN SYSTEM FEATURES */}
        <section className="space-y-6 border-t pt-8">
          <h2 className="text-2xl font-semibold text-foreground">Design System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">✅ Using CSS Variables</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code className="bg-muted px-2 py-0.5 rounded">--interaction-secondary-base</code></li>
                <li>• <code className="bg-muted px-2 py-0.5 rounded">--interaction-outline-base</code></li>
                <li>• <code className="bg-muted px-2 py-0.5 rounded">--interaction-outline-hover</code></li>
                <li>• <code className="bg-muted px-2 py-0.5 rounded">--interaction-primary-active</code></li>
                <li>• <code className="bg-muted px-2 py-0.5 rounded">--interaction-red-base</code> (error)</li>
                <li>• <code className="bg-muted px-2 py-0.5 rounded">--interaction-green-base</code> (success)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">✅ Design Spec Compliance</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All interaction states (base, hover, focus, disabled)</li>
                <li>• Validation states (error, success)</li>
                <li>• Character counter with semantic colors</li>
                <li>• Helper text with validation colors</li>
                <li>• Icon support (left, right, or both)</li>
                <li>• Phone input with image flags (not emojis)</li>
                <li>• Country code selector with search</li>
                <li>• Consistent 40x30px flag images</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
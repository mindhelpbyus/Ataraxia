import React, { useState } from 'react';
import { InputField, SearchBar, TextareaField, PhoneInput } from './ui/form-inputs';
import { Envelope, Lock, User, CurrencyDollar, Eye, EyeSlash } from '@phosphor-icons/react';

/**
 * FormInputsShowcase - Demonstrates all centralized input components
 * 
 * This component showcases the Ataraxia Design System input components
 * in all their states and variations for documentation and testing.
 */
export default function FormInputsShowcase() {
  const [searchValue, setSearchValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [bioValue, setBioValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [countryCode, setCountryCode] = useState('+1');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-gray-900">
            Ataraxia Form Input Components
          </h1>
          <p className="text-lg text-gray-600">
            Centralized, reusable input components following the Ataraxia Design System.
            All components support multiple states, accessibility features, and consistent styling.
          </p>
        </div>

        {/* InputField Component */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-gray-900">InputField</h2>
            <p className="text-gray-600">
              Standard text input with support for icons, character counting, and all states.
            </p>
          </div>

          {/* States Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Base State */}
            <div className="space-y-3 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Base State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                helperText="We will notify the customer and issue a full refund"
                showCharCount
                maxLength={50}
              />
            </div>

            {/* With Value */}
            <div className="space-y-3 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">With Value (Filled)</h3>
              <InputField
                label="Input Label"
                value="Enter your title here"
                helperText="We will notify the customer and issue a full refund"
                showCharCount
                maxLength={50}
              />
            </div>

            {/* Error State */}
            <div className="space-y-3 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Error State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                error="This field is required"
                helperText="This field is required"
                showCharCount
                maxLength={50}
              />
            </div>

            {/* Success State */}
            <div className="space-y-3 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Success State</h3>
              <InputField
                label="Input Label"
                value="valid@email.com"
                success
                helperText="Email is valid and available"
                showCharCount
                maxLength={50}
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-3 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Disabled State</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                disabled
                helperText="We will notify the customer and issue a full refund"
                showCharCount
                maxLength={50}
              />
            </div>

            {/* Required Field */}
            <div className="space-y-3 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Required Field</h3>
              <InputField
                label="Input Label"
                placeholder="Enter your title here"
                required
                helperText="We will notify the customer and issue a full refund"
                showCharCount
                maxLength={50}
              />
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-900">With Icons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Icon */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="john.doe@example.com"
                  leftIcon={<Envelope className="w-5 h-5" />}
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  helperText="Enter your work email"
                />
              </div>

              {/* Right Icon */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <InputField
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  rightIcon={<CurrencyDollar className="w-5 h-5" />}
                  helperText="Enter the amount in USD"
                />
              </div>

              {/* Both Icons */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <InputField
                  label="Full Name"
                  placeholder="John Doe"
                  leftIcon={<User className="w-5 h-5" />}
                  showCharCount
                  maxLength={100}
                  helperText="Enter your first and last name"
                />
              </div>

              {/* Password with Toggle */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={<Eye className="w-5 h-5 cursor-pointer" />}
                  showCharCount
                  maxLength={50}
                  helperText="Must be at least 8 characters"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SearchBar Component */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-gray-900">SearchBar</h2>
            <p className="text-gray-600">
              Search input with magnifying glass icon and keyboard shortcuts (⌘/Ctrl + F).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Base State</h3>
              <SearchBar
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            {/* With Value */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">With Value</h3>
              <SearchBar placeholder="Search" value="Search term" />
            </div>

            {/* Without Shortcuts */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Without Shortcuts</h3>
              <SearchBar
                placeholder="Search clients..."
                showKeyboardShortcut={false}
              />
            </div>

            {/* Disabled */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Disabled</h3>
              <SearchBar placeholder="Search" disabled />
            </div>
          </div>
        </section>

        {/* TextareaField Component */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-gray-900">TextareaField</h2>
            <p className="text-gray-600">
              Multi-line text input for longer content with character counting and all states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Base State</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                helperText="We will notify the customer and issue a full refund"
                showCharCount
                maxLength={500}
                rows={4}
              />
            </div>

            {/* With Value */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">With Value</h3>
              <TextareaField
                label="Input Label"
                value="This is some sample text that the user has entered into the textarea field."
                helperText="We will notify the customer and issue a full refund"
                showCharCount
                maxLength={500}
                rows={4}
              />
            </div>

            {/* Error State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Error State</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                error="This field is required"
                helperText="This field is required"
                showCharCount
                maxLength={500}
                rows={4}
              />
            </div>

            {/* Success State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Success State</h3>
              <TextareaField
                label="Input Label"
                value="This feedback looks great!"
                success
                helperText="Successfully saved"
                showCharCount
                maxLength={500}
                rows={4}
              />
            </div>

            {/* Disabled State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Disabled State</h3>
              <TextareaField
                label="Input Label"
                placeholder="Enter your title here"
                disabled
                helperText="This field is read-only"
                showCharCount
                maxLength={500}
                rows={4}
              />
            </div>

            {/* Real Use Case */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Session Notes (Real Use Case)</h3>
              <TextareaField
                label="Session Notes"
                placeholder="Document what happened during the session, client's presentation, topics discussed..."
                value={bioValue}
                onChange={(e) => setBioValue(e.target.value)}
                required
                showCharCount
                maxLength={2000}
                rows={6}
                helperText="Add detailed notes about this therapy session"
              />
            </div>
          </div>
        </section>

        {/* PhoneInput Component */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-gray-900">PhoneInput</h2>
            <p className="text-gray-600">
              International phone number input with country code selector, auto-formatting, and validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Base State</h3>
              <PhoneInput
                label="Phone Number"
                value={phoneValue}
                countryCode={countryCode}
                onChange={(phone, code) => {
                  setPhoneValue(phone);
                  setCountryCode(code);
                }}
                helperText="We will notify the customer and issue a full refund"
                required
              />
            </div>

            {/* Error State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Error State</h3>
              <PhoneInput
                label="Phone Number"
                value="123"
                error="Invalid phone number"
                helperText="Invalid phone number"
                required
              />
            </div>

            {/* Success State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Success State</h3>
              <PhoneInput
                label="Phone Number"
                value="5551234567"
                success
                helperText="Phone number verified"
              />
            </div>

            {/* Disabled State */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Disabled State</h3>
              <PhoneInput
                label="Phone Number"
                value="5551234567"
                disabled
                helperText="Phone number cannot be changed"
              />
            </div>

            {/* India Number */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">India Number</h3>
              <PhoneInput
                label="Phone Number"
                value="9876543210"
                countryCode="+91"
                helperText="Indian phone number format"
              />
            </div>

            {/* UK Number */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">UK Number</h3>
              <PhoneInput
                label="Phone Number"
                value="7123456789"
                countryCode="+44"
                helperText="UK phone number format"
              />
            </div>
          </div>
        </section>

        {/* Real-World Form Example */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-gray-900">Real-World Example</h2>
            <p className="text-gray-600">
              Complete form using all centralized input components together.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-200 max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Client Intake Form</h3>

            <div className="space-y-6">
              <InputField
                label="Full Name"
                placeholder="John Doe"
                leftIcon={<User className="w-5 h-5" />}
                required
                showCharCount
                maxLength={100}
                helperText="Enter client's legal name"
              />

              <InputField
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                leftIcon={<Envelope className="w-5 h-5" />}
                required
                helperText="Primary contact email"
              />

              <PhoneInput
                label="Phone Number"
                required
                helperText="For appointment reminders and notifications"
              />

              <SearchBar
                placeholder="Search for existing medical conditions..."
                className="w-full"
              />

              <TextareaField
                label="Reason for Visit"
                placeholder="Please describe why you're seeking therapy..."
                required
                showCharCount
                maxLength={1000}
                rows={5}
                helperText="Help us understand your needs"
              />

              <TextareaField
                label="Additional Notes"
                placeholder="Any other information you'd like to share..."
                showCharCount
                maxLength={500}
                rows={4}
                helperText="Optional but helpful for your therapist"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button className="px-6 py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-6 py-2.5 rounded bg-[#F97316] text-white hover:bg-[#ea580c]">
                  Submit Form
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="space-y-6 bg-blue-50 p-8 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-semibold text-gray-900">Usage Guidelines</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Import</h3>
              <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto">
                <code>{`import { InputField, SearchBar, TextareaField, PhoneInput } from './components/ui/form-inputs';`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">When to Use Each Component</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>InputField:</strong> Single-line text, email, password, numbers, dates, etc.</li>
                <li><strong>SearchBar:</strong> Search functionality with keyboard shortcuts</li>
                <li><strong>TextareaField:</strong> Multi-line text like notes, descriptions, comments</li>
                <li><strong>PhoneInput:</strong> Phone numbers with international support</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Best Practices</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Always provide a <code>label</code> for accessibility</li>
                <li>Use <code>helperText</code> to guide users</li>
                <li>Mark required fields with the <code>required</code> prop</li>
                <li>Show character counts for fields with length limits</li>
                <li>Use appropriate <code>type</code> attributes (email, tel, password, etc.)</li>
                <li>Provide clear error messages in the <code>error</code> prop</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

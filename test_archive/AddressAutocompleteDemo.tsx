import React, { useState } from 'react';
import { AddressAutocomplete, AddressComponents } from './AddressAutocomplete';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CheckCircle2, MapPin, Globe, Building2 } from 'lucide-react';
import { isGoogleMapsConfigured } from '../config/googleMaps';

/**
 * AddressAutocompleteDemo Component
 * 
 * Test page for demonstrating address autocomplete functionality
 * Use this to verify Google Places API integration is working
 */
export function AddressAutocompleteDemo() {
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');
  const [components1, setComponents1] = useState<AddressComponents | null>(null);
  const [components2, setComponents2] = useState<AddressComponents | null>(null);
  const [components3, setComponents3] = useState<AddressComponents | null>(null);

  const isConfigured = isGoogleMapsConfigured();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-[#F97316]" />
            <h1 className="text-3xl font-bold text-gray-900">Address Autocomplete Demo</h1>
          </div>
          <p className="text-gray-600">
            Test Google Places API integration for Ataraxia
          </p>
          
          {/* Configuration Status */}
          <div className="flex items-center justify-center gap-2">
            {isConfigured ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <Badge variant="default" className="bg-green-600">
                  API Configured
                </Badge>
              </>
            ) : (
              <>
                <div className="h-5 w-5 rounded-full bg-amber-500 animate-pulse" />
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                  API Key Required
                </Badge>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Demo Forms */}
        <div className="grid gap-6">
          {/* Client Address Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#F97316]" />
                <CardTitle>Client Registration Address</CardTitle>
              </div>
              <CardDescription>
                Simulates client intake form address field
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressAutocomplete
                label="Home Address"
                value={address1}
                onChange={(value, components) => {
                  setAddress1(value);
                  if (components) {
                    setComponents1(components);
                  }
                }}
                placeholder="Start typing a street address..."
                required
              />

              {components1 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">
                    ✅ Auto-Filled Components:
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Street:</span>
                      <p className="text-gray-900">{components1.street || '-'}</p>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">City:</span>
                      <p className="text-gray-900">{components1.city || '-'}</p>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">State:</span>
                      <p className="text-gray-900">{components1.state || '-'}</p>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">ZIP:</span>
                      <p className="text-gray-900">{components1.zip || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-green-700 font-medium">Country:</span>
                      <p className="text-gray-900">{components1.country || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Therapist Address Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#F59E0B]" />
                <CardTitle>Therapist Office Address</CardTitle>
              </div>
              <CardDescription>
                Simulates therapist onboarding address field
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressAutocomplete
                label="Practice Address"
                value={address2}
                onChange={(value, components) => {
                  setAddress2(value);
                  if (components) {
                    setComponents2(components);
                  }
                }}
                placeholder="Enter your office location..."
              />

              {components2 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2">
                    ✅ Auto-Filled Components:
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-amber-700 font-medium">Street:</span>
                      <p className="text-gray-900">{components2.street || '-'}</p>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">City:</span>
                      <p className="text-gray-900">{components2.city || '-'}</p>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">State:</span>
                      <p className="text-gray-900">{components2.state || '-'}</p>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">ZIP:</span>
                      <p className="text-gray-900">{components2.zip || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-amber-700 font-medium">Country:</span>
                      <p className="text-gray-900">{components2.country || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* International Address Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <CardTitle>International Address Test</CardTitle>
              </div>
              <CardDescription>
                Test with international addresses (India, UK, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressAutocomplete
                label="International Address"
                value={address3}
                onChange={(value, components) => {
                  setAddress3(value);
                  if (components) {
                    setComponents3(components);
                  }
                }}
                placeholder="Try an address from any country..."
              />

              {components3 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    ✅ Auto-Filled Components:
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Street:</span>
                      <p className="text-gray-900">{components3.street || '-'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">City:</span>
                      <p className="text-gray-900">{components3.city || '-'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">State:</span>
                      <p className="text-gray-900">{components3.state || '-'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">ZIP:</span>
                      <p className="text-gray-900">{components3.zip || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700 font-medium">Country:</span>
                      <p className="text-gray-900">{components3.country || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border-[#F97316]">
          <CardHeader>
            <CardTitle className="text-[#F97316]">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">How to Test:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Start typing a street address (e.g., "123 Main")</li>
                <li>Wait for dropdown suggestions to appear</li>
                <li>Click on a suggestion from the dropdown</li>
                <li>Watch as the address components auto-fill below</li>
                <li>Try addresses from different countries</li>
              </ol>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Sample Addresses to Try:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li><strong>USA:</strong> 1600 Pennsylvania Avenue NW, Washington</li>
                <li><strong>India:</strong> Taj Mahal, Agra</li>
                <li><strong>UK:</strong> 10 Downing Street, London</li>
                <li><strong>Australia:</strong> Sydney Opera House</li>
              </ul>
            </div>

            {!isConfigured && (
              <>
                <Separator />
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    ⚠️ API Key Not Configured
                  </h4>
                  <p className="text-sm text-amber-800 mb-2">
                    To enable address autocomplete, add your Google Places API key:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700 ml-2">
                    <li>Get API key from Google Cloud Console</li>
                    <li>Add to <code className="px-1 py-0.5 bg-amber-100 rounded">/config/googleMaps.ts</code></li>
                    <li>Or add to <code className="px-1 py-0.5 bg-amber-100 rounded">.env</code> file</li>
                    <li>Restart your dev server</li>
                  </ol>
                  <p className="text-sm text-amber-800 mt-3">
                    📖 See <code className="px-1 py-0.5 bg-amber-100 rounded">/docs/GOOGLE_PLACES_SETUP.md</code> for detailed instructions
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

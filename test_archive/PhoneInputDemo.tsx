import React, { useState } from 'react';
import { PhoneInput, validatePhoneNumber, COUNTRY_CODES } from './PhoneInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { Phone, Check, X, Globe, Zap, Users } from 'lucide-react';

/**
 * PhoneInputDemo Component
 * 
 * Interactive demo page to test the PhoneInput component
 * Shows examples for different countries and use cases
 */
export function PhoneInputDemo() {
  const [basicPhone, setBasicPhone] = useState('');
  const [basicCountry, setBasicCountry] = useState('+1');

  const [clientPhone, setClientPhone] = useState('');
  const [clientCountry, setClientCountry] = useState('+91');

  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyCountry, setEmergencyCountry] = useState('+44');

  const handleValidateBasic = () => {
    if (validatePhoneNumber(basicPhone, basicCountry)) {
      toast.success('Valid Phone Number!', {
        description: `Full number: ${basicCountry}-${basicPhone}`
      });
    } else {
      toast.error('Invalid Phone Number', {
        description: 'Please complete the phone number'
      });
    }
  };

  const handleSubmitAll = () => {
    const phones = [
      { label: 'Basic Phone', phone: basicPhone, code: basicCountry },
      { label: 'Client Phone', phone: clientPhone, code: clientCountry },
      { label: 'Emergency Phone', phone: emergencyPhone, code: emergencyCountry }
    ];

    const invalid = phones.filter(p => p.phone && !validatePhoneNumber(p.phone, p.code));
    
    if (invalid.length > 0) {
      toast.error(`Invalid: ${invalid.map(p => p.label).join(', ')}`);
    } else {
      toast.success('All Phone Numbers Valid! ✅', {
        description: phones.map(p => `${p.label}: ${p.code}-${p.phone}`).join('\n')
      });
      console.log('Submitted phone data:', phones);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-16 w-16 rounded-full bg-[#F97316] flex items-center justify-center">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              International Phone Input Demo
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test the new PhoneInput component with auto-formatting, country selection, 
            and validation for 15+ countries including India 🇮🇳
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Globe className="h-4 w-4 mr-2" />
              15+ Countries
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Auto-Format
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              Free Input
            </Badge>
          </div>
        </div>

        {/* Features */}
        <Card className="border-2 border-[#F97316]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#F97316]" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Auto-Formatting</div>
                  <p className="text-sm text-muted-foreground">
                    Type "5551234567" → "(555) 123-4567"
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Free Format Input</div>
                  <p className="text-sm text-muted-foreground">
                    Users can type any format they want
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Country Selector</div>
                  <p className="text-sm text-muted-foreground">
                    Flag emojis + country codes dropdown
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Validation</div>
                  <p className="text-sm text-muted-foreground">
                    Built-in validation per country format
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example 1: Basic Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Example 1: US Phone Number</CardTitle>
            <CardDescription>
              Default US phone input with validation. Try typing: 5551234567
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhoneInput
              value={basicPhone}
              countryCode={basicCountry}
              onChange={(phone, code) => {
                setBasicPhone(phone);
                setBasicCountry(code);
              }}
              label="Phone Number"
              required
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={handleValidateBasic}
                className="bg-[#F97316] hover:bg-[#ea580c]"
              >
                Validate Phone
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setBasicPhone('');
                }}
              >
                Clear
              </Button>
            </div>

            {basicPhone && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Clean Number:</span> {basicPhone}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Country Code:</span> {basicCountry}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Full International:</span> {basicCountry}-{basicPhone}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Valid:</span>{' '}
                  {validatePhoneNumber(basicPhone, basicCountry) ? (
                    <Badge variant="default" className="bg-green-600">
                      <Check className="h-3 w-3 mr-1" /> Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <X className="h-3 w-3 mr-1" /> No
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example 2: India */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Example 2: India Phone Number 🇮🇳</CardTitle>
            <CardDescription>
              Indian phone number with +91 code. Try typing: 9876543210
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhoneInput
              value={clientPhone}
              countryCode={clientCountry}
              onChange={(phone, code) => {
                setClientPhone(phone);
                setClientCountry(code);
              }}
              label="Client Phone (India)"
              required
            />

            {clientPhone && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Formatted:</span>{' '}
                  {clientPhone.replace(/(\d{5})(\d{5})/, '$1-$2')}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Full Number:</span> {clientCountry}-{clientPhone}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {validatePhoneNumber(clientPhone, clientCountry) ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Complete
                    </span>
                  ) : (
                    <span className="text-orange-600 flex items-center gap-1">
                      <X className="h-4 w-4" /> Incomplete
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example 3: UK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Example 3: UK Emergency Contact 🇬🇧</CardTitle>
            <CardDescription>
              UK phone number with +44 code. Try typing: 71234567890
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhoneInput
              value={emergencyPhone}
              countryCode={emergencyCountry}
              onChange={(phone, code) => {
                setEmergencyPhone(phone);
                setEmergencyCountry(code);
              }}
              label="Emergency Contact Phone (UK)"
              required
            />

            {emergencyPhone && (
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Raw Input:</span> {emergencyPhone}
                </div>
                <div className="text-sm">
                  <span className="font-medium">International Format:</span> {emergencyCountry}-{emergencyPhone}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Submit All */}
        <Card className="border-2 border-[#F97316]">
          <CardHeader>
            <CardTitle>Submit All Phone Numbers</CardTitle>
            <CardDescription>
              Test validation of all phone numbers at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSubmitAll}
              size="lg"
              className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white"
            >
              <Check className="h-5 w-5 mr-2" />
              Validate & Submit All
            </Button>
          </CardContent>
        </Card>

        {/* Supported Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Countries ({COUNTRY_CODES.length})</CardTitle>
            <CardDescription>
              All countries with auto-formatting support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {COUNTRY_CODES.map((country) => (
                <div 
                  key={`${country.code}-${country.country}`}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{country.name}</div>
                    <div className="text-xs text-muted-foreground">{country.code}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {country.format}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Guide */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Quick Usage Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-900">In Your Component:</h4>
              <pre className="bg-white rounded-lg p-4 text-sm overflow-x-auto border border-purple-200">
{`import { PhoneInput } from './components/PhoneInput';

const [phone, setPhone] = useState('');
const [countryCode, setCountryCode] = useState('+1');

<PhoneInput
  value={phone}
  countryCode={countryCode}
  onChange={(phone, code) => {
    setPhone(phone);
    setCountryCode(code);
  }}
  label="Phone Number"
  required
/>`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-purple-900">Storage Recommendation:</h4>
              <pre className="bg-white rounded-lg p-4 text-sm overflow-x-auto border border-purple-200">
{`// Store separately in your database
interface ClientData {
  phone: string;        // "5551234567" (digits only)
  countryCode: string;  // "+1"
}

// Construct full international number
const fullNumber = \`\${countryCode}-\${phone}\`;
// Result: "+1-5551234567"`}
              </pre>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

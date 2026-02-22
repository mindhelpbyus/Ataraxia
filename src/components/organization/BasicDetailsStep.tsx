import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2, User, MapPin, Plus, X, FileText } from 'lucide-react';
import { PhoneInputV2 } from '../PhoneInputV2';
import { AddressAutocomplete } from '../AddressAutocomplete';
import { Country, State, City } from 'country-state-city';
import ReactSelect from 'react-select';
import * as ct from 'countries-and-timezones';
import { StepProps, ServiceLocation } from './types';

export function BasicDetailsStep({
    formData,
    updateFormData,
    addServiceLocation,
    updateServiceLocation,
    removeServiceLocation
}: StepProps) {
    // Custom styles for react-select to match client form
    const customSelectStyles = {
        control: (base: any) => ({
            ...base,
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            minHeight: '42px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#d1d5db',
            },
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    // Get all countries for react-select
    const countries = Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name,
    }));

    // Get states for HQ address
    const hqStates = formData.hqCountry
        ? State.getStatesOfCountry(formData.hqCountry).map(state => ({
            value: state.isoCode,
            label: state.name,
        }))
        : [];

    // Get cities for HQ address (used for both District and City)
    const hqCities = formData.hqCountry && formData.hqState
        ? City.getCitiesOfState(formData.hqCountry, formData.hqState).map(city => ({
            value: city.name,
            label: city.name,
        }))
        : [];

    // Get states for billing address
    const billingStates = formData.billingCountry
        ? State.getStatesOfCountry(formData.billingCountry).map(state => ({
            value: state.isoCode,
            label: state.name,
        }))
        : [];

    // Get cities for billing address
    const billingCities = formData.billingCountry && formData.billingState
        ? City.getCitiesOfState(formData.billingCountry, formData.billingState).map(city => ({
            value: city.name,
            label: city.name,
        }))
        : [];

    // Get timezones
    const allTimezones = ct.getAllTimezones();
    const timezones = Object.keys(allTimezones).map(tz => ({
        value: tz,
        label: `${tz} (UTC${allTimezones[tz].utcOffsetStr})`,
    }));

    // Selected values for HQ
    const selectedHqCountry = countries.find(c => c.value === formData.hqCountry) || null;
    const selectedHqState = hqStates.find(s => s.value === formData.hqState) || null;
    const selectedHqCity = hqCities.find(c => c.value === formData.hqCity) || null;

    // Selected values for billing
    const selectedBillingCountry = countries.find(c => c.value === formData.billingCountry) || null;
    const selectedBillingState = billingStates.find(s => s.value === formData.billingState) || null;
    const selectedBillingCity = billingCities.find(c => c.value === formData.billingCity) || null;

    // Selected timezone
    const selectedTimezone = timezones.find(t => t.value === formData.timezone) || null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2"> Organization Details</h2>
                <p className="text-muted-foreground">Essential information about your organization</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Organization Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Organization Name *</Label>
                            <Input
                                value={formData.organizationName}
                                onChange={(e) => updateFormData('organizationName', e.target.value)}
                                placeholder="Wellness Center"
                            />
                        </div>
                        <div>
                            <Label>Legal Name *</Label>
                            <Input
                                value={formData.legalName}
                                onChange={(e) => updateFormData('legalName', e.target.value)}
                                placeholder="Legal business name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>DBA (Doing Business As)</Label>
                            <Input
                                value={formData.dba || ''}
                                onChange={(e) => updateFormData('dba', e.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <Label>Tax ID / EIN *</Label>
                            <Input
                                value={formData.taxId}
                                onChange={(e) => updateFormData('taxId', e.target.value)}
                                placeholder="XX-XXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>NPI (National Provider Identifier)</Label>
                            <Input
                                value={formData.npi || ''}
                                onChange={(e) => updateFormData('npi', e.target.value)}
                                placeholder="10-digit number"
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <Label>Organization Type *</Label>
                            <Select value={formData.organizationType} onValueChange={(v) => updateFormData('organizationType', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solo">Solo Practice</SelectItem>
                                    <SelectItem value="small-group">Small Group (2-10 clinicians)</SelectItem>
                                    <SelectItem value="mid-size">Mid-size Clinic (11-50 clinicians)</SelectItem>
                                    <SelectItem value="large-enterprise">Large Enterprise (50+ clinicians)</SelectItem>
                                    <SelectItem value="telehealth-only">Telehealth-Only</SelectItem>
                                    <SelectItem value="multi-location">Multi-Location</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Primary Contact Person
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Full Name *</Label>
                        <Input
                            value={formData.primaryContactName}
                            onChange={(e) => updateFormData('primaryContactName', e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={formData.primaryContactEmail}
                                onChange={(e) => updateFormData('primaryContactEmail', e.target.value)}
                                placeholder="contact@organization.com"
                            />
                        </div>
                        <PhoneInputV2
                            value={formData.primaryContactPhone}
                            onChange={(value) => updateFormData('primaryContactPhone', value || '')}
                            label="Phone"
                            required
                            defaultCountry="US"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                            Headquarters Address *
                            <Badge variant="secondary">Primary</Badge>
                        </Label>

                        {/* Street Address Line 1 */}
                        <div>
                            <Label>Street Address Line 1 *</Label>
                            <Input
                                value={formData.hqAddress1}
                                onChange={(e) => updateFormData('hqAddress1', e.target.value)}
                                placeholder="123 Main Street, Building Name"
                            />
                        </div>

                        {/* Street Address Line 2 */}
                        <div>
                            <Label>Street Address Line 2 (Optional)</Label>
                            <Input
                                value={formData.hqAddress2}
                                onChange={(e) => updateFormData('hqAddress2', e.target.value)}
                                placeholder="Apartment, Suite, Floor, Locality (e.g., T. Nagar, Adyar)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Country</Label>
                                <ReactSelect
                                    value={selectedHqCountry}
                                    onChange={(option) => {
                                        updateFormData('hqCountry', option?.value || '');
                                        updateFormData('hqState', '');
                                        updateFormData('hqCity', '');
                                        if (option) {
                                            const countryData = Country.getCountryByCode(option.value);
                                            if (countryData) {
                                                updateFormData('primaryContactCountryCode', `+${countryData.phonecode}`);
                                            }
                                        }
                                    }}
                                    options={countries}
                                    placeholder="Select Country"
                                    styles={customSelectStyles}
                                    isClearable
                                />
                            </div>
                            <div>
                                <Label>State</Label>
                                <ReactSelect
                                    value={selectedHqState}
                                    onChange={(option) => {
                                        updateFormData('hqState', option?.value || '');
                                        updateFormData('hqCity', '');
                                    }}
                                    options={hqStates}
                                    placeholder="Select State"
                                    styles={customSelectStyles}
                                    isClearable
                                    isDisabled={!formData.hqCountry}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>District</Label>
                                <ReactSelect
                                    value={selectedHqCity}
                                    onChange={(option) => {
                                        updateFormData('hqCity', option?.value || '');
                                    }}
                                    options={hqCities}
                                    placeholder="Select District"
                                    styles={customSelectStyles}
                                    isClearable
                                    isDisabled={!formData.hqState}
                                />
                            </div>
                            <div>
                                <Label>City</Label>
                                <ReactSelect
                                    value={selectedHqCity}
                                    onChange={(option) => {
                                        updateFormData('hqCity', option?.value || '');
                                    }}
                                    options={hqCities}
                                    placeholder="Select City"
                                    styles={customSelectStyles}
                                    isClearable
                                    isDisabled={!formData.hqState}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>{formData.hqCountry === 'US' ? 'ZIP Code' : formData.hqCountry === 'IN' ? 'PIN Code' : 'Postal Code'}</Label>
                            <ReactSelect
                                value={formData.hqZip ? { value: formData.hqZip, label: formData.hqZip } : null}
                                onChange={(option) => updateFormData('hqZip', option?.value || '')}
                                options={[]}
                                placeholder="Search Postal Code..."
                                styles={customSelectStyles}
                                isClearable
                                isDisabled={!formData.hqCountry}
                            />
                        </div>

                        <div>
                            <Label>Timezone</Label>
                            <ReactSelect
                                value={selectedTimezone}
                                onChange={(option) => updateFormData('timezone', option?.value || '')}
                                options={timezones}
                                placeholder="Select timezone"
                                styles={customSelectStyles}
                                isClearable
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="billingAddressSameAsHQ"
                                checked={formData.billingAddressSameAsHQ}
                                onCheckedChange={(checked) => {
                                    updateFormData('billingAddressSameAsHQ', checked);
                                    if (checked) {
                                        updateFormData('billingAddress1', formData.hqAddress1);
                                        updateFormData('billingAddress2', formData.hqAddress2);
                                        updateFormData('billingCity', formData.hqCity);
                                        updateFormData('billingState', formData.hqState);
                                        updateFormData('billingZip', formData.hqZip);
                                        updateFormData('billingCountry', formData.hqCountry);
                                    }
                                }}
                            />
                            <Label htmlFor="billingAddressSameAsHQ" className="cursor-pointer">
                                Billing address is same as headquarters address
                            </Label>
                        </div>

                        {!formData.billingAddressSameAsHQ && (
                            <>
                                <div>
                                    <Label>Billing Street Address Line 1 *</Label>
                                    <Input
                                        value={formData.billingAddress1 || ''}
                                        onChange={(e) => updateFormData('billingAddress1', e.target.value)}
                                        placeholder="123 Billing Street, Building Name"
                                    />
                                </div>

                                <div>
                                    <Label>Billing Street Address Line 2 (Optional)</Label>
                                    <Input
                                        value={formData.billingAddress2 || ''}
                                        onChange={(e) => updateFormData('billingAddress2', e.target.value)}
                                        placeholder="Apartment, Suite, Floor, Locality (e.g., T. Nagar, Adyar)"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Country</Label>
                                        <ReactSelect
                                            value={selectedBillingCountry}
                                            onChange={(option) => {
                                                updateFormData('billingCountry', option?.value || '');
                                                updateFormData('billingState', '');
                                                updateFormData('billingCity', '');
                                            }}
                                            options={countries}
                                            placeholder="Select Country"
                                            styles={customSelectStyles}
                                            isClearable
                                        />
                                    </div>
                                    <div>
                                        <Label>State</Label>
                                        <ReactSelect
                                            value={selectedBillingState}
                                            onChange={(option) => {
                                                updateFormData('billingState', option?.value || '');
                                                updateFormData('billingCity', '');
                                            }}
                                            options={billingStates}
                                            placeholder="Select State"
                                            styles={customSelectStyles}
                                            isClearable
                                            isDisabled={!formData.billingCountry}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>District</Label>
                                        <ReactSelect
                                            value={selectedBillingCity}
                                            onChange={(option) => {
                                                updateFormData('billingCity', option?.value || '');
                                            }}
                                            options={billingCities}
                                            placeholder="Select District"
                                            styles={customSelectStyles}
                                            isClearable
                                            isDisabled={!formData.billingState}
                                        />
                                    </div>
                                    <div>
                                        <Label>City</Label>
                                        <ReactSelect
                                            value={selectedBillingCity}
                                            onChange={(option) => {
                                                updateFormData('billingCity', option?.value || '');
                                            }}
                                            options={billingCities}
                                            placeholder="Select City"
                                            styles={customSelectStyles}
                                            isClearable
                                            isDisabled={!formData.billingState}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{formData.billingCountry === 'US' ? 'ZIP Code' : formData.billingCountry === 'IN' ? 'PIN Code' : 'Postal Code'}</Label>
                                    <ReactSelect
                                        value={formData.billingZip ? { value: formData.billingZip, label: formData.billingZip } : null}
                                        onChange={(option) => updateFormData('billingZip', option?.value || '')}
                                        options={[]}
                                        placeholder="Search Postal Code..."
                                        styles={customSelectStyles}
                                        isClearable
                                        isDisabled={!formData.billingCountry}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <Label>Primary Timezone *</Label>
                        <Select value={formData.timezone} onValueChange={(v) => updateFormData('timezone', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                <SelectItem value="America/Phoenix">Arizona Time (AZ)</SelectItem>
                                <SelectItem value="America/Anchorage">Alaska Time (AK)</SelectItem>
                                <SelectItem value="Pacific/Honolulu">Hawaii Time (HI)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* India-specific Compliance Documents */}
            {formData.hqCountry === 'IN' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            India Compliance Documents
                            <Badge variant="secondary">Required for India</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Entity Type Selection */}
                        <div>
                            <Label>Entity Type *</Label>
                            <Select value={formData.indiaEntityType} onValueChange={(v: any) => updateFormData('indiaEntityType', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select entity type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pvt-ltd-llp">Private Limited / LLP</SelectItem>
                                    <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                                    <SelectItem value="trust-ngo">Trust / NGO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* For Pvt Ltd / LLP */}
                        {formData.indiaEntityType === 'pvt-ltd-llp' && (
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                <h4 className="font-medium text-sm">Private Limited / LLP Documents</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>CIN (Corporate Identity Number) *</Label>
                                        <Input
                                            value={formData.indiaCIN || ''}
                                            onChange={(e) => updateFormData('indiaCIN', e.target.value)}
                                            placeholder="L12345MH2020PTC123456"
                                        />
                                    </div>
                                    <div>
                                        <Label>LLPIN (Limited Liability Partnership Identification Number)</Label>
                                        <Input
                                            value={formData.indiaLLPIN || ''}
                                            onChange={(e) => updateFormData('indiaLLPIN', e.target.value)}
                                            placeholder="AAA-1234 (if applicable)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Incorporation Certificate *</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => updateFormData('indiaIncorporationCert', e.target.files?.[0])}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Upload Certificate of Incorporation</p>
                                </div>

                                <div>
                                    <Label>Company PAN *</Label>
                                    <Input
                                        value={formData.indiaPAN || ''}
                                        onChange={(e) => updateFormData('indiaPAN', e.target.value)}
                                        placeholder="AAAAA1234A"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <Label>GSTIN (GST Identification Number)</Label>
                                    <Input
                                        value={formData.indiaGSTIN || ''}
                                        onChange={(e) => updateFormData('indiaGSTIN', e.target.value)}
                                        placeholder="22AAAAA0000A1Z5 (optional if not registered)"
                                        maxLength={15}
                                    />
                                </div>

                                <Separator />

                                <h4 className="font-medium text-sm">Bank Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Bank Name *</Label>
                                        <Input
                                            value={formData.indiaBankName || ''}
                                            onChange={(e) => updateFormData('indiaBankName', e.target.value)}
                                            placeholder="State Bank of India"
                                        />
                                    </div>
                                    <div>
                                        <Label>Account Number *</Label>
                                        <Input
                                            value={formData.indiaBankAccountNumber || ''}
                                            onChange={(e) => updateFormData('indiaBankAccountNumber', e.target.value)}
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>IFSC Code *</Label>
                                        <Input
                                            value={formData.indiaBankIFSC || ''}
                                            onChange={(e) => updateFormData('indiaBankIFSC', e.target.value)}
                                            placeholder="SBIN0001234"
                                            maxLength={11}
                                        />
                                    </div>
                                    <div>
                                        <Label>Cancelled Cheque *</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => updateFormData('indiaCancelledCheque', e.target.files?.[0])}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <h4 className="font-medium text-sm">Authorized Signatory KYC</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Signatory PAN *</Label>
                                        <Input
                                            value={formData.indiaSignatoryPAN || ''}
                                            onChange={(e) => updateFormData('indiaSignatoryPAN', e.target.value)}
                                            placeholder="ABCDE1234F"
                                            maxLength={10}
                                        />
                                    </div>
                                    <div>
                                        <Label>Aadhaar Number</Label>
                                        <Input
                                            value={formData.indiaSignatoryAadhaar || ''}
                                            onChange={(e) => updateFormData('indiaSignatoryAadhaar', e.target.value)}
                                            placeholder="1234 5678 9012"
                                            maxLength={14}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Passport Number (if no Aadhaar)</Label>
                                    <Input
                                        value={formData.indiaSignatoryPassport || ''}
                                        onChange={(e) => updateFormData('indiaSignatoryPassport', e.target.value)}
                                        placeholder="A1234567"
                                    />
                                </div>
                            </div>
                        )}

                        {/* For Sole Proprietor */}
                        {formData.indiaEntityType === 'sole-proprietor' && (
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                <h4 className="font-medium text-sm">Sole Proprietor Documents</h4>

                                <div>
                                    <Label>Proprietor PAN *</Label>
                                    <Input
                                        value={formData.indiaPAN || ''}
                                        onChange={(e) => updateFormData('indiaPAN', e.target.value)}
                                        placeholder="ABCDE1234F"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <Label>GSTIN (if available)</Label>
                                    <Input
                                        value={formData.indiaGSTIN || ''}
                                        onChange={(e) => updateFormData('indiaGSTIN', e.target.value)}
                                        placeholder="22AAAAA0000A1Z5"
                                        maxLength={15}
                                    />
                                </div>

                                <Separator />

                                <h4 className="font-medium text-sm">Bank Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Bank Name *</Label>
                                        <Input
                                            value={formData.indiaBankName || ''}
                                            onChange={(e) => updateFormData('indiaBankName', e.target.value)}
                                            placeholder="State Bank of India"
                                        />
                                    </div>
                                    <div>
                                        <Label>Account Number *</Label>
                                        <Input
                                            value={formData.indiaBankAccountNumber || ''}
                                            onChange={(e) => updateFormData('indiaBankAccountNumber', e.target.value)}
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>IFSC Code *</Label>
                                        <Input
                                            value={formData.indiaBankIFSC || ''}
                                            onChange={(e) => updateFormData('indiaBankIFSC', e.target.value)}
                                            placeholder="SBIN0001234"
                                            maxLength={11}
                                        />
                                    </div>
                                    <div>
                                        <Label>Cancelled Cheque</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => updateFormData('indiaCancelledCheque', e.target.files?.[0])}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <Label>Address Proof *</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => updateFormData('indiaAddressProof', e.target.files?.[0])}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Upload Aadhaar, Passport, or Utility Bill</p>
                                </div>
                            </div>
                        )}

                        {/* For Trust/NGO */}
                        {formData.indiaEntityType === 'trust-ngo' && (
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                <h4 className="font-medium text-sm">Trust / NGO Documents</h4>

                                <div>
                                    <Label>Trust Deed / Society Registration Certificate *</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => updateFormData('indiaTrustDeed', e.target.files?.[0])}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Upload Trust Deed or Registration Certificate</p>
                                </div>

                                <div>
                                    <Label>PAN of Trust *</Label>
                                    <Input
                                        value={formData.indiaPAN || ''}
                                        onChange={(e) => updateFormData('indiaPAN', e.target.value)}
                                        placeholder="AAAAA1234A"
                                        maxLength={10}
                                    />
                                </div>

                                <Separator />

                                <h4 className="font-medium text-sm">Bank Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Bank Name *</Label>
                                        <Input
                                            value={formData.indiaBankName || ''}
                                            onChange={(e) => updateFormData('indiaBankName', e.target.value)}
                                            placeholder="State Bank of India"
                                        />
                                    </div>
                                    <div>
                                        <Label>Account Number *</Label>
                                        <Input
                                            value={formData.indiaBankAccountNumber || ''}
                                            onChange={(e) => updateFormData('indiaBankAccountNumber', e.target.value)}
                                            placeholder="1234567890"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>IFSC Code *</Label>
                                        <Input
                                            value={formData.indiaBankIFSC || ''}
                                            onChange={(e) => updateFormData('indiaBankIFSC', e.target.value)}
                                            placeholder="SBIN0001234"
                                            maxLength={11}
                                        />
                                    </div>
                                    <div>
                                        <Label>Cancelled Cheque</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => updateFormData('indiaCancelledCheque', e.target.files?.[0])}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <h4 className="font-medium text-sm">Trustee/Signatory KYC</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Trustee PAN *</Label>
                                        <Input
                                            value={formData.indiaSignatoryPAN || ''}
                                            onChange={(e) => updateFormData('indiaSignatoryPAN', e.target.value)}
                                            placeholder="ABCDE1234F"
                                            maxLength={10}
                                        />
                                    </div>
                                    <div>
                                        <Label>Aadhaar Number</Label>
                                        <Input
                                            value={formData.indiaSignatoryAadhaar || ''}
                                            onChange={(e) => updateFormData('indiaSignatoryAadhaar', e.target.value)}
                                            placeholder="1234 5678 9012"
                                            maxLength={14}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Passport Number (if no Aadhaar)</Label>
                                    <Input
                                        value={formData.indiaSignatoryPassport || ''}
                                        onChange={(e) => updateFormData('indiaSignatoryPassport', e.target.value)}
                                        placeholder="A1234567"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Service Locations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.serviceLocations.map((location, index) => (
                        <Card key={location.id} className="p-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Location {index + 1}</Label>
                                    {removeServiceLocation && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeServiceLocation(location.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    placeholder="Location name"
                                    value={location.name}
                                    onChange={(e) => updateServiceLocation?.(location.id, 'name', e.target.value)}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <AddressAutocomplete
                                        placeholder="Street Address Line 1"
                                        value={location.address1}
                                        onChange={(value, components) => {
                                            updateServiceLocation?.(location.id, 'address1', value);
                                            if (components) {
                                                updateServiceLocation?.(location.id, 'city', components.city);
                                                updateServiceLocation?.(location.id, 'state', components.state);
                                                updateServiceLocation?.(location.id, 'zip', components.zip);
                                                if (components.countryCode) {
                                                    updateServiceLocation?.(location.id, 'country', components.countryCode);
                                                    const countryData = Country.getCountryByCode(components.countryCode);
                                                    if (countryData) {
                                                        updateServiceLocation?.(location.id, 'phoneCountryCode', `+${countryData.phonecode}`);
                                                    }
                                                }
                                            }
                                        }}
                                        showIcon={false}
                                    />
                                    <Input
                                        placeholder="Street Address Line 2 (Optional)"
                                        value={location.address2}
                                        onChange={(e) => updateServiceLocation?.(location.id, 'address2', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Select value={location.country} onValueChange={(v) => {
                                        updateServiceLocation?.(location.id, 'country', v);
                                        const countryData = Country.getCountryByCode(v);
                                        if (countryData) {
                                            updateServiceLocation?.(location.id, 'phoneCountryCode', `+${countryData.phonecode}`);
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Country.getAllCountries().map((country) => (
                                                <SelectItem key={country.isoCode} value={country.isoCode}>
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={location.state} onValueChange={(v) => updateServiceLocation?.(location.id, 'state', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {State.getStatesOfCountry(location.country || 'US').map((state) => (
                                                <SelectItem key={state.isoCode} value={state.isoCode}>
                                                    {state.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Select value={location.city} onValueChange={(v) => updateServiceLocation?.(location.id, 'city', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="City" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {City.getCitiesOfState(location.country || 'US', location.state || '').map((city) => (
                                                <SelectItem key={city.name} value={city.name}>
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Zip / Postal Code"
                                        value={location.zip}
                                        onChange={(e) => updateServiceLocation?.(location.id, 'zip', e.target.value)}
                                    />
                                </div>
                                <PhoneInputV2
                                    value={location.phone}
                                    onChange={(value) => updateServiceLocation?.(location.id, 'phone', value || '')}
                                    placeholder="Phone"
                                    defaultCountry="US"
                                />
                            </div>
                        </Card>
                    ))}
                    {addServiceLocation && (
                        <Button onClick={addServiceLocation} variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Service Location
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

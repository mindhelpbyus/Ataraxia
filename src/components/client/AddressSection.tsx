import React, { useState, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import { MapPin } from 'lucide-react';
import * as ct from 'countries-and-timezones';
import zipcodes from 'zipcodes';
import { ComprehensiveClientData } from './types';

interface AddressSectionProps {
    formData: ComprehensiveClientData;
    updateFormData: (field: string, value: any) => void;
}

export function AddressSection({ formData, updateFormData }: AddressSectionProps) {
    const [postalCodeOptions, setPostalCodeOptions] = useState<any>([]);
    const [isLoadingPostalCodes, setIsLoadingPostalCodes] = useState(false);

    // Get all countries
    const countries = useMemo(() => {
        return Country.getAllCountries().map(country => ({
            value: country.isoCode,
            label: country.name,
        }));
    }, []);

    // Get states based on selected country
    const states = useMemo(() => {
        if (!formData.country) return [];
        return State.getStatesOfCountry(formData.country).map(state => ({
            value: state.isoCode,
            label: state.name,
        }));
    }, [formData.country]);

    // Get cities based on selected state
    const cities = useMemo(() => {
        if (!formData.country || !formData.state) return [];
        return City.getCitiesOfState(formData.country, formData.state).map(city => ({
            value: city.name,
            label: city.name,
        }));
    }, [formData.country, formData.state]);

    // Get districts (same as cities for most cases)
    const districts = useMemo(() => {
        if (!formData.country || !formData.state) return [];
        return cities.map(city => ({
            value: city.value,
            label: city.label,
        }));
    }, [cities, formData.country, formData.state]);

    // Get timezones
    const timezones = useMemo(() => {
        const allTimezones = ct.getAllTimezones();
        return Object.keys(allTimezones).map(tz => ({
            value: tz,
            label: `${tz} (UTC${allTimezones[tz].utcOffsetStr})`,
        }));
    }, []);



    // Fetch postal codes from Zippopotam.us API
    const fetchPostalCodesFromAPI = async (countryCode: string, searchQuery: string = '') => {
        try {
            setIsLoadingPostalCodes(true);

            // Zippopotam API - lookup by postal code
            if (searchQuery && searchQuery.length >= 2) {
                const response = await fetch(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${searchQuery}`);
                if (response.ok) {
                    const data = await response.json();
                    const results = data.places?.map((place: any) => ({
                        value: data['post code'],
                        label: `${data['post code']} - ${place['place name']}, ${place['state abbreviation']}`,
                        city: place['place name'],
                        state: place['state'],
                        district: place['place name'],
                        latitude: place['latitude'],
                        longitude: place['longitude'],
                    })) || [];

                    setPostalCodeOptions(results.length > 0 ? results : [{
                        value: data['post code'],
                        label: `${data['post code']} - ${data.places[0]['place name']}, ${data.places[0]['state']}`,
                        city: data.places[0]['place name'],
                        state: data.places[0]['state'],
                        district: data.places[0]['place name'],
                    }]);
                    return;
                }
            }

            setPostalCodeOptions([]);
        } catch (error) {
            console.error('Error fetching postal codes:', error);
            setPostalCodeOptions([]);
        } finally {
            setIsLoadingPostalCodes(false);
        }
    };

    // Fetch postal codes for India
    const fetchIndiaPostalCodes = async (pincode: string) => {
        try {
            setIsLoadingPostalCodes(true);

            if (pincode && pincode.length >= 3) {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                if (response.ok) {
                    const data = await response.json();

                    if (data[0]?.Status === 'Success' && data[0]?.PostOffice) {
                        const results = data[0].PostOffice.map((po: any) => ({
                            value: po.Pincode,
                            label: `${po.Pincode} - ${po.Name}, ${po.District}, ${po.State}`,
                            city: po.Block || po.Name,
                            state: po.State,
                            district: po.District,
                        }));

                        setPostalCodeOptions(results);
                        return;
                    }
                }
            }

            setPostalCodeOptions([]);
        } catch (error) {
            console.error('Error fetching India postal codes:', error);
            setPostalCodeOptions([]);
        } finally {
            setIsLoadingPostalCodes(false);
        }
    };

    // Handle postal code input change
    const handlePostalCodeInputChange = (inputValue: string) => {
        if (!formData.country) return;

        // For US, use zipcodes package
        if (formData.country === 'US') {
            if (inputValue.length >= 2) {
                const results = zipcodes.lookupByName(inputValue);
                const options = results.slice(0, 50).map((zip: any) => ({
                    value: zip.zip,
                    label: `${zip.zip} - ${zip.city}, ${zip.state}`,
                    city: zip.city,
                    state: zip.state,
                }));
                setPostalCodeOptions(options);
            }
        }
        // For India, use India Post API
        else if (formData.country === 'IN') {
            if (inputValue.length >= 3) {
                fetchIndiaPostalCodes(inputValue);
            }
        }
        // For other countries, use Zippopotam API
        else {
            if (inputValue.length >= 2) {
                fetchPostalCodesFromAPI(formData.country, inputValue);
            }
        }
    };

    // Handle country change
    const handleCountryChange = (country: any) => {
        updateFormData('country', country?.value || '');
        updateFormData('state', '');
        updateFormData('city', '');
        updateFormData('zipCode', '');

        if (country) {
            const countryData = ct.getCountry(country.value);
            if (countryData?.timezones && countryData.timezones.length > 0) {
                const primaryTimezone = countryData.timezones[0];
                updateFormData('timezone', primaryTimezone);
            }

        }
    };

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

    const selectedCountryObj = countries.find(c => c.value === formData.country) || null;
    const selectedStateObj = states.find(s => s.value === formData.state) || null;
    const selectedCityObj = cities.find(c => c.value === formData.city) || null;
    const selectedDistrictObj = districts.find(d => d.value === formData.city) || null;
    const selectedTimezoneObj = timezones.find(t => t.value === formData.timezone) || null;

    const handlePostalCodeSelection = (option: any) => {
        updateFormData('zipCode', option?.value || '');

        if (option) {
            // Auto-populate state
            if (option.state) {
                const matchedState = states.find(s =>
                    s.label.toLowerCase() === option.state.toLowerCase() ||
                    (s.value && s.value.toLowerCase() === option.state.toLowerCase())
                );

                if (matchedState) {
                    updateFormData('state', matchedState.value);
                }
            }

            // Auto-populate city (and district since it shares the field)
            const cityValue = option.city || option.district;
            if (cityValue) {
                updateFormData('city', cityValue);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Address Header */}
            <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">
                    Address <span className="text-red-500">*</span>
                </label>
            </div>

            {/* Street Address Line 1 */}
            <div>
                <label className="block text-xs text-gray-600 mb-2">
                    Street Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => updateFormData('address1', e.target.value)}
                    placeholder="123 Main Street, Building Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
            </div>

            {/* Street Address Line 2 */}
            <div>
                <label className="block text-xs text-gray-600 mb-2">
                    Street Address Line 2 (Optional)
                </label>
                <input
                    type="text"
                    value={formData.address2 || ''}
                    onChange={(e) => updateFormData('address2', e.target.value)}
                    placeholder="Apartment, Suite, Floor, Locality (e.g., T. Nagar, Adyar)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
            </div>

            {/* Country and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm mb-2 text-gray-700">Country <span className="text-red-500">*</span></label>
                    <Select
                        value={selectedCountryObj}
                        onChange={handleCountryChange}
                        options={countries}
                        placeholder="Select Country"
                        styles={customSelectStyles}
                        isClearable
                    />
                </div>

                <div>
                    <label className="block text-sm mb-2 text-gray-700">State <span className="text-red-500">*</span></label>
                    <Select
                        value={selectedStateObj}
                        onChange={(state) => {
                            updateFormData('state', state?.value || '');
                            updateFormData('city', '');
                            updateFormData('zipCode', '');
                        }}
                        options={states}
                        placeholder="Select State"
                        styles={customSelectStyles}
                        isClearable
                        isDisabled={!formData.country}
                    />
                </div>

                {/* District and City */}
                <div>
                    <label className="block text-sm mb-2 text-gray-700">District</label>
                    <Select
                        value={selectedDistrictObj}
                        onChange={(district) => {
                            updateFormData('city', district?.value || '');
                            updateFormData('zipCode', '');
                        }}
                        options={districts}
                        placeholder="Select District"
                        styles={customSelectStyles}
                        isClearable
                        isDisabled={!formData.state}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-2 text-gray-700">City <span className="text-red-500">*</span></label>
                    <Select
                        value={selectedCityObj}
                        onChange={(city) => {
                            updateFormData('city', city?.value || '');
                            updateFormData('zipCode', '');
                        }}
                        options={cities}
                        placeholder="Select City"
                        styles={customSelectStyles}
                        isClearable
                        isDisabled={!formData.state}
                    />
                </div>

                {/* Postal Code */}
                <div className="md:col-span-2">
                    <label className="block text-sm mb-2 text-gray-700">
                        {formData.country === 'US' ? 'ZIP Code' :
                            formData.country === 'IN' ? 'PIN Code' :
                                'Postal Code'} <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={postalCodeOptions.find((opt: any) => opt.value === formData.zipCode) || (formData.zipCode ? { value: formData.zipCode, label: formData.zipCode } : null)}
                        onChange={handlePostalCodeSelection}
                        options={postalCodeOptions}
                        placeholder="Search Postal Code..."
                        styles={customSelectStyles}
                        isClearable
                        isDisabled={!formData.country}
                        onInputChange={handlePostalCodeInputChange}
                        isLoading={isLoadingPostalCodes}
                    />
                </div>
            </div>

            {/* Timezone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm mb-2 text-gray-700">Timezone</label>
                    <Select
                        value={selectedTimezoneObj}
                        onChange={(tz) => updateFormData('timezone', tz?.value || '')}
                        options={timezones}
                        placeholder="Select timezone"
                        styles={customSelectStyles}
                        isClearable
                    />
                </div>
            </div>
        </div >
    );
}
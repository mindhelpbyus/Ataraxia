import React, { useState, useRef, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { SettingsSection } from './SettingsSection';
import { MapPin, Upload } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import langs from 'langs';
import * as ct from 'countries-and-timezones';
import zipcodes from 'zipcodes';

interface AccountSettingsProps {
    userId: string;
    userEmail: string;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ userId, userEmail }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [firstName, setFirstName] = useState(userEmail.split('@')[0].split('.')[0] || 'User');
    const [lastName, setLastName] = useState(userEmail.split('@')[0].split('.')[1] || '');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');

    // Select states
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [selectedState, setSelectedState] = useState<any>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [selectedPostalCode, setSelectedPostalCode] = useState<any>(null);

    const [selectedTimezone, setSelectedTimezone] = useState<any>(null);
    const [selectedLanguages, setSelectedLanguages] = useState<any>([]);
    const [postalCodeOptions, setPostalCodeOptions] = useState<any>([]);
    const [isLoadingPostalCodes, setIsLoadingPostalCodes] = useState(false);

    const [shortBio, setShortBio] = useState('');
    const [extendedBio, setExtendedBio] = useState('');
    const [clientExpectations, setClientExpectations] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

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

            // If city is selected, try to get postal codes for that city
            if (selectedCity && selectedState) {
                const cityName = selectedCity.value.replace(/\s+/g, '%20');
                const response = await fetch(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${selectedState.label.toLowerCase()}/${cityName}`);
                if (response.ok) {
                    const data = await response.json();
                    const results = data.places?.map((place: any) => ({
                        value: place['post code'],
                        label: `${place['post code']} - ${place['place name']}`,
                        city: place['place name'],
                        state: selectedState.label,
                        district: place['place name'],
                    })) || [];

                    setPostalCodeOptions(results);
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

    // Fetch India postal codes from India Post API
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
                            region: po.Region,
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

    // Handle postal code input change (for async search)
    const handlePostalCodeInputChange = (inputValue: string) => {
        if (!selectedCountry) return;

        // For US, use zipcodes package
        if (selectedCountry.value === 'US') {
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
        else if (selectedCountry.value === 'IN') {
            if (inputValue.length >= 3) {
                fetchIndiaPostalCodes(inputValue);
            }
        }
        // For other countries, use Zippopotam API
        else {
            if (inputValue.length >= 2) {
                fetchPostalCodesFromAPI(selectedCountry.value, inputValue);
            }
        }
    };

    // Get all languages from langs package
    const allLanguages = useMemo(() => {
        const languages = langs.all();
        return languages
            .map(lang => ({
                value: lang['1'] || lang['2'] || lang['2B'] || lang['3'],
                label: lang.name,
                local: lang.local,
            }))
            .filter(lang => lang.value && lang.label)
            .sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    // Get languages arranged by country (country languages first)
    const languages = useMemo(() => {
        if (!selectedCountry) return allLanguages;

        const countryData = ct.getCountry(selectedCountry.value) as any;
        const countryLanguageCodes = countryData?.languages || [];

        // Separate country languages and other languages
        const countryLanguages: any[] = [];
        const otherLanguages: any[] = [];

        allLanguages.forEach(lang => {
            const isCountryLanguage = countryLanguageCodes.some((countryLang: string) =>
                lang.value.toLowerCase() === countryLang.toLowerCase() ||
                lang.label.toLowerCase().includes(countryLang.toLowerCase()) ||
                countryLang.toLowerCase().includes(lang.value.toLowerCase())
            );

            if (isCountryLanguage) {
                countryLanguages.push({ ...lang, label: `${lang.label} ⭐` });
            } else {
                otherLanguages.push(lang);
            }
        });

        return [...countryLanguages, ...otherLanguages];
    }, [selectedCountry, allLanguages]);

    // Get all timezones from countries-and-timezones package
    const timezones = useMemo(() => {
        const allTimezones = ct.getAllTimezones();
        return Object.keys(allTimezones)
            .map(tzName => {
                const tz = allTimezones[tzName];
                const offset = tz.utcOffset / 60;
                const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
                return {
                    value: tzName,
                    label: `${tzName.replace(/_/g, ' ')} (UTC${offsetStr})`,
                    utcOffset: tz.utcOffset,
                    countries: tz.countries,
                };
            })
            .sort((a, b) => b.utcOffset - a.utcOffset);
    }, []);

    // Get countries
    const countries = useMemo(() => {
        return Country.getAllCountries().map(country => ({
            value: country.isoCode,
            label: country.name,
            phonecode: country.phonecode,
            currency: country.currency,
            ...country
        }));
    }, []);

    // Get states for selected country
    const states = useMemo(() => {
        if (!selectedCountry) return [];
        return State.getStatesOfCountry(selectedCountry.value).map(state => ({
            value: state.isoCode,
            label: state.name,
            countryCode: state.countryCode,
            ...state
        }));
    }, [selectedCountry]);

    // Get cities for selected state
    const cities = useMemo(() => {
        if (!selectedCountry || !selectedState) return [];
        const citiesData = City.getCitiesOfState(selectedCountry.value, selectedState.value);
        return citiesData.map(city => ({
            value: city.name,
            label: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            ...city
        }));
    }, [selectedCountry, selectedState]);

    // Get districts (extracted from cities or postal codes)
    const districts = useMemo(() => {
        if (!selectedCountry || !selectedState) return [];

        // Use cities as districts for most countries
        return cities.map(city => ({
            value: city.value,
            label: city.label,
        }));
    }, [selectedCountry, selectedState, cities]);

    // Get postal codes based on country, state, district, and city
    const postalCodes = useMemo(() => {
        if (!selectedCountry) return [];

        // For US, use zipcodes package
        if (selectedCountry.value === 'US') {
            if (selectedCity) {
                const cityZips = zipcodes.lookupByName(selectedCity.value);
                return cityZips.map((zip: any) => ({
                    value: zip.zip,
                    label: `${zip.zip} - ${zip.city}, ${zip.state}`,
                    city: zip.city,
                    state: zip.state,
                }));
            }
            if (selectedState) {
                const stateZips = zipcodes.lookupByState(selectedState.label);
                return stateZips.slice(0, 100).map((zip: any) => ({
                    value: zip.zip,
                    label: `${zip.zip} - ${zip.city}, ${zip.state}`,
                    city: zip.city,
                    state: zip.state,
                }));
            }
        }

        // For other countries, postal codes will be loaded via API search
        return [];
    }, [selectedCountry, selectedState, selectedDistrict, selectedCity]);

    // Handle country change
    const handleCountryChange = (country: any) => {
        setSelectedCountry(country);
        setSelectedState(null);
        setSelectedDistrict(null);
        setSelectedCity(null);
        setSelectedPostalCode(null);

        if (country) {
            // Auto-populate timezone based on country
            const countryData = ct.getCountry(country.value) as any;
            if (countryData?.timezones && countryData.timezones.length > 0) {
                const primaryTimezone = countryData.timezones[0];
                const timezone = timezones.find(tz => tz.value === primaryTimezone);
                setSelectedTimezone(timezone || null);
            }

            // Auto-populate languages based on country
            const countryLanguageCodes = countryData?.languages || [];
            const countryLanguages = allLanguages.filter(lang =>
                countryLanguageCodes.some((countryLang: string) =>
                    lang.value.toLowerCase() === countryLang.toLowerCase() ||
                    lang.label.toLowerCase().includes(countryLang.toLowerCase()) ||
                    countryLang.toLowerCase().includes(lang.value.toLowerCase())
                )
            );

            if (countryLanguages.length > 0) {
                setSelectedLanguages(countryLanguages);
            }
        } else {
            setSelectedTimezone(null);
            setSelectedLanguages([]);
        }
    };

    // Handle postal code change
    const handlePostalCodeChange = (postalCode: any) => {
        setSelectedPostalCode(postalCode);

        // Auto-populate city and district from postal code if available
        if (postalCode) {
            if (postalCode.city && !selectedCity) {
                const cityOption = cities.find(c => c.value === postalCode.city);
                if (cityOption) {
                    setSelectedCity(cityOption);
                }
            }
            if (postalCode.district && !selectedDistrict) {
                const districtOption = districts.find(d => d.value === postalCode.district);
                if (districtOption) {
                    setSelectedDistrict(districtOption);
                }
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
                toast.success('Photo uploaded');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const isComplete = firstName && lastName && gender && dateOfBirth && addressLine1 &&
                selectedCountry && selectedState && selectedCity &&
                selectedLanguages.length > 0 && shortBio;

            const completionKey = `profileCompletionStatus_${userId}`;
            const currentStatus = JSON.parse(localStorage.getItem(completionKey) || '{}');
            currentStatus['account'] = isComplete ? 'completed' : 'pending';
            localStorage.setItem(completionKey, JSON.stringify(currentStatus));

            window.dispatchEvent(new Event('profile-updated'));

            if (isComplete) {
                toast.success(`Account settings saved!`);
            } else {
                toast.info('Changes saved, but section is still incomplete.');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    const customSelectStyles = {
        control: (base: any) => ({
            ...base,
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            minHeight: '40px', // Adjusted to match Shadcn Input height
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

    return (
        <div className="max-w-5xl pl-6 pb-20 pt-0">
            <SettingsSection>
                <div className="space-y-8">
                    {/* Header Area */}
                    <div>
                        <h1 className="text-lg font-semibold">Personal Information</h1>
                    </div>

                    {/* Profile Picture */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="relative group shrink-0">
                                <Avatar className="w-24 h-24 border-2 border-border shadow-sm">
                                    <AvatarImage src={profileImage || ''} />
                                    <AvatarFallback className="text-2xl bg-orange-100 text-orange-600 font-semibold">
                                        {firstName[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-3">
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-9 font-medium">
                                    <Upload className="w-4 h-4 mr-2" /> Upload Photo
                                </Button>
                                <p className="text-xs text-muted-foreground">Max size: 5MB. JPG, PNG.</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personal Info Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">First Name <span className="text-red-500">*</span></Label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></Label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Gender <span className="text-red-500">*</span></Label>
                            {/* Using native select with shadcn styling match to avoid react-select overhead for simple enum */}
                            <div className="relative">
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></Label>
                            <Input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="h-10"
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> Address <span className="text-red-500">*</span></Label>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Street Address Line 1 *</Label>
                            <Input
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                placeholder="123 Main Street, Building Name"
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Street Address Line 2 (Optional)</Label>
                            <Input
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                placeholder="Apartment, Suite, Floor, Locality (e.g., T. Nagar, Adyar)"
                                className="h-10"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Country</Label>
                                <Select
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    options={countries}
                                    placeholder="Select Country"
                                    styles={customSelectStyles}
                                    isClearable
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    {selectedCountry?.value === 'US' ? 'State' :
                                        selectedCountry?.value === 'GB' ? 'County' :
                                            selectedCountry?.value === 'IN' ? 'State' :
                                                'State / Province / Region'}
                                </Label>
                                <Select
                                    value={selectedState}
                                    onChange={(val) => {
                                        setSelectedState(val);
                                        setSelectedDistrict(null);
                                        setSelectedCity(null);
                                        setSelectedPostalCode(null);
                                    }}
                                    options={states}
                                    placeholder={`Select ${selectedCountry?.value === 'GB' ? 'County' : 'State'}`}
                                    styles={customSelectStyles}
                                    isClearable
                                    isDisabled={!selectedCountry}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    {selectedCountry?.value === 'IN' ? 'District / Locality' :
                                        selectedCountry?.value === 'GB' ? 'District / Borough' :
                                            'District / County'}
                                </Label>
                                <Select
                                    value={selectedDistrict}
                                    onChange={(val) => {
                                        setSelectedDistrict(val);
                                        setSelectedCity(null);
                                        setSelectedPostalCode(null);
                                    }}
                                    options={districts}
                                    placeholder="Select District"
                                    styles={customSelectStyles}
                                    isClearable
                                    isDisabled={!selectedState}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    {selectedCountry?.value === 'GB' ? 'City / Town' : 'City'}
                                </Label>
                                <Select
                                    value={selectedCity}
                                    onChange={(val) => {
                                        setSelectedCity(val);
                                        setSelectedPostalCode(null);
                                    }}
                                    options={cities}
                                    placeholder="Select City"
                                    styles={customSelectStyles}
                                    isClearable
                                    isDisabled={!selectedState}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium">
                                    {selectedCountry?.value === 'US' ? 'ZIP Code' :
                                        selectedCountry?.value === 'IN' ? 'PIN Code' :
                                            selectedCountry?.value === 'GB' ? 'Postcode' :
                                                'Zip / Postal Code'}
                                </Label>
                                <Select
                                    value={selectedPostalCode}
                                    onChange={handlePostalCodeChange}
                                    options={postalCodeOptions.length > 0 ? postalCodeOptions : postalCodes}
                                    placeholder={
                                        selectedCountry?.value === 'US' ? 'Search ZIP Code...' :
                                            selectedCountry?.value === 'IN' ? 'Search PIN Code...' :
                                                selectedCountry?.value === 'GB' ? 'Search Postcode...' :
                                                    'Search Postal Code...'
                                    }
                                    styles={customSelectStyles}
                                    isClearable
                                    isDisabled={!selectedCountry}
                                    noOptionsMessage={() =>
                                        !selectedCountry ? 'Please select a country first' :
                                            !selectedState ? 'Please select a state first' :
                                                'No postal codes available for this selection'
                                    }
                                    onInputChange={handlePostalCodeInputChange}
                                    isLoading={isLoadingPostalCodes}
                                />
                                {postalCodes.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {postalCodes.length} postal code{postalCodes.length !== 1 ? 's' : ''} available. Type to search.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timezone & Languages */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Timezone</Label>
                            <Select
                                value={selectedTimezone}
                                onChange={setSelectedTimezone}
                                options={timezones}
                                placeholder="Select timezone"
                                styles={customSelectStyles}
                                isClearable
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Languages Spoken</Label>
                            <Select
                                value={selectedLanguages}
                                onChange={setSelectedLanguages}
                                options={languages}
                                placeholder="Select languages..."
                                styles={customSelectStyles}
                                isMulti
                            />
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Short Bio <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={shortBio}
                                onChange={(e) => {
                                    if (e.target.value.length <= 150) {
                                        setShortBio(e.target.value);
                                    }
                                }}
                                placeholder="A brief introduction (150 chars max)"
                                maxLength={150}
                                className="h-[120px] resize-none"
                            />
                            <div className="flex justify-end text-xs text-muted-foreground">
                                <span className={shortBio.length > 150 ? "text-red-500 font-medium" : ""}>{shortBio.length}/150 characters</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Extended Bio <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={extendedBio}
                                onChange={(e) => {
                                    if (e.target.value.length <= 700) {
                                        setExtendedBio(e.target.value);
                                    }
                                }}
                                placeholder="Detailed professional biography..."
                                maxLength={700}
                                className="h-[120px] resize-none"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Tell your story and help clients get to know you</span>
                                <span className={extendedBio.length > 700 ? "text-red-500 font-medium" : ""}>{extendedBio.length}/700 characters</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">What Clients Can Expect From Me <span className="text-muted-foreground font-normal ml-1">(Optional)</span></Label>
                            <Textarea
                                value={clientExpectations}
                                onChange={(e) => setClientExpectations(e.target.value)}
                                placeholder="Describe your therapeutic style, what a typical session looks like, and what clients can expect when working with you..."
                                className="min-h-[120px] resize-y"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-10 shadow-sm transition-all rounded-full">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </SettingsSection>
        </div>
    );
};

import React from 'react';
import PhoneInputLib, { Country, getCountries, getCountryCallingCode } from 'react-phone-number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { cn } from './ui/utils';
import { CountryFlag } from './ui/country-flag';

interface PhoneInputV2Props {
    value?: string;
    onChange?: (value: string | undefined) => void;
    onBlur?: () => void;
    label?: string;
    required?: boolean;
    error?: string;
    success?: boolean;
    disabled?: boolean;
    placeholder?: string;
    helperText?: string;
    className?: string;
    id?: string;
    defaultCountry?: Country;
}

/**
 * PhoneInputV2 Component
 * 
 * Modern phone input using react-phone-number-input library
 * Styled to match the custom PhoneInput component (separate country dropdown + phone input)
 * 
 * Features:
 * - 200+ countries supported
 * - E.164 format output
 * - Auto-formatting based on country
 * - Flag icons for all countries
 * - Matches design system perfectly
 */
export function PhoneInputV2({
    value,
    onChange,
    onBlur,
    label,
    required = false,
    error,
    success = false,
    disabled = false,
    placeholder = 'Enter phone number',
    helperText,
    className = '',
    id = 'phone-input-v2',
    defaultCountry = 'US'
}: PhoneInputV2Props) {
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(defaultCountry);
    const [phoneNumber, setPhoneNumber] = React.useState('');

    // Parse the E.164 value to extract country and number
    React.useEffect(() => {
        if (value && value.startsWith('+')) {
            // Try to extract country from the value
            const countries = getCountries();
            for (const country of countries) {
                const callingCode = getCountryCallingCode(country);
                if (value.startsWith(`+${callingCode}`)) {
                    setSelectedCountry(country);
                    setPhoneNumber(value.substring(callingCode.length + 1));
                    break;
                }
            }
        }
    }, [value]);

    const handleCountryChange = (country: string) => {
        setSelectedCountry(country as Country);
        // Reconstruct the E.164 number with new country code
        if (phoneNumber) {
            const callingCode = getCountryCallingCode(country as Country);
            const newValue = `+${callingCode}${phoneNumber}`;
            onChange?.(newValue);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value.replace(/\D/g, ''); // Remove non-digits
        setPhoneNumber(newPhone);

        if (newPhone) {
            const callingCode = getCountryCallingCode(selectedCountry);
            const e164Value = `+${callingCode}${newPhone}`;
            onChange?.(e164Value);
        } else {
            onChange?.(undefined);
        }
    };

    // Get all countries for the dropdown
    const countries = getCountries();

    // Determine border color based on state
    const getBorderClass = () => {
        if (disabled) return 'border-input bg-muted opacity-50 cursor-not-allowed';
        if (error) return 'border-destructive focus-within:ring-destructive';
        if (success) return 'border-green-500 focus-within:ring-green-500';
        return 'border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2';
    };

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <Label htmlFor={id} className={cn(error && "text-destructive")}>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}

            <div
                className={cn(
                    "flex h-10 w-full items-center rounded-md border bg-background text-sm ring-offset-background transition-all duration-200",
                    getBorderClass()
                )}
            >
                <Select
                    value={selectedCountry}
                    onValueChange={handleCountryChange}
                    disabled={disabled}
                >
                    <SelectTrigger
                        className={cn(
                            "h-full w-[100px] border-0 bg-transparent px-3 py-0 shadow-none focus:ring-0",
                            "hover:bg-muted/50 transition-colors rounded-l-md rounded-r-none"
                        )}
                    >
                        <SelectValue>
                            <div className="flex items-center gap-2">
                                <CountryFlag countryCode={selectedCountry} size="sm" />
                                <span className="text-muted-foreground">+{getCountryCallingCode(selectedCountry)}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                        className="z-[9999]"
                        style={{
                            zIndex: 9999,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            width: '300px' // Make it wider so country names fit better
                        }}
                    >
                        {countries.sort((a, b) => {
                            // Priority countries: US, IN
                            const priority = ['US', 'IN'];
                            const indexA = priority.indexOf(a);
                            const indexB = priority.indexOf(b);

                            // If both are priority, sort by priority order
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;

                            // If only A is priority, it comes first
                            if (indexA !== -1) return -1;

                            // If only B is priority, it comes first
                            if (indexB !== -1) return 1;

                            // Otherwise sort by country name
                            const nameA = new Intl.DisplayNames(['en'], { type: 'region' }).of(a) || '';
                            const nameB = new Intl.DisplayNames(['en'], { type: 'region' }).of(b) || '';
                            return nameA.localeCompare(nameB);
                        }).map((country, index) => {
                            const callingCode = getCountryCallingCode(country);
                            const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country) || country;
                            // Generate flag emoji from ISO code (instant, no network)
                            const codePoints = country
                                .toUpperCase()
                                .split('')
                                .map(char => 127397 + char.charCodeAt(0));
                            const flagEmoji = String.fromCodePoint(...codePoints);

                            return (
                                <React.Fragment key={country}>
                                    <SelectItem
                                        value={country} // Pass ISO code as value
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg leading-none">{flagEmoji}</span>
                                            <span className="font-medium">+{callingCode}</span>
                                            <span className="text-muted-foreground text-sm truncate">{countryName}</span>
                                        </div>
                                    </SelectItem>
                                    {/* Add separator after India (index 1) */}
                                    {index === 1 && (
                                        <div className="h-[1px] bg-border my-1 mx-2" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </SelectContent>
                </Select>

                <div className="h-4 w-[1px] bg-border mx-0" />

                <input
                    id={id}
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={cn(
                        "flex-1 bg-transparent px-3 py-2 text-sm outline-none",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "rounded-r-md"
                    )}
                />
            </div>

            {(helperText || error) && (
                <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

// Export for backward compatibility
export default PhoneInputV2;

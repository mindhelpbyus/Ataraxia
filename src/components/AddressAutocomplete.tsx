import React, { useEffect, useRef, useState } from 'react';
import { Label } from './ui/label';
import { MapPin, AlertCircle } from 'lucide-react';
import { GOOGLE_MAPS_CONFIG, isGoogleMapsConfigured } from '../config/googleMaps';

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  countryCode?: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string, components?: AddressComponents) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  success?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function AddressAutocomplete({
  id = 'address-input',
  label,
  value,
  onChange,
  placeholder = 'Start typing an address...',
  required = false,
  disabled = false,
  error,
  helperText,
  success = false,
  className = '',
  showIcon = true,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteElementRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showConfigWarning, setShowConfigWarning] = useState(false);
  const isUpdatingFromAutocomplete = useRef(false);

  // Check if Google Maps is configured
  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      setShowConfigWarning(true);
    }
  }, []);

  // Load Google Places API script with the new loading parameter
  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      return; // Don't load if not configured
    }

    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    // NEW API: Use loading=async and libraries=places
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Places API');
      setShowConfigWarning(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts before loading
      if (!isScriptLoaded && script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [isScriptLoaded]);

  // Initialize Google Places Autocomplete using the NEW API (PlaceAutocompleteElement)
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || disabled) {
      return;
    }

    try {
      // Use the NEW PlaceAutocompleteElement API (recommended as of March 2025)
      // Note: 'fields' is NOT a valid property in the constructor for the web component.
      // Fields are specified in the fetchFields() call in the event listener.
      const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: [] }, // Allow all countries
      });

      // Store reference
      autocompleteElementRef.current = autocompleteElement;

      // Replace the input with the autocomplete element
      if (containerRef.current && inputRef.current) {
        // Hide the original input and show the autocomplete element
        inputRef.current.style.display = 'none';

        // Clear any existing children to avoid duplicates
        while (containerRef.current.children.length > 1) {
          if (containerRef.current.lastChild !== inputRef.current) {
            containerRef.current.removeChild(containerRef.current.lastChild);
          } else {
            break;
          }
        }

        containerRef.current.appendChild(autocompleteElement);

        // Style the autocomplete element to match our input
        const input = autocompleteElement.querySelector('input');
        if (input) {
          input.className = 'flex-1 bg-transparent border-0 outline-none text-[color:var(--content-dark-primary,#111827)] dark:text-[color:var(--content-light-primary,#f9fafb)] text-sm placeholder:text-[color:var(--content-dark-tertiary,#9ca3af)] disabled:cursor-not-allowed';
          input.placeholder = placeholder;
          input.value = value;
          input.disabled = disabled;
        }
      }

      // Listen for place selection
      autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
        const place = event.place;

        if (!place) {
          console.error('No place data received');
          return;
        }

        // Fetch full place details including address_components
        await place.fetchFields({
          fields: ['address_components', 'formatted_address', 'geometry'],
        });

        if (!place.addressComponents) {
          console.error('No address components available');
          return;
        }

        const formattedAddress = place.formattedAddress || '';

        console.log('🗺️ RAW GOOGLE MAPS DATA:', {
          formatted_address: formattedAddress,
          address_components: place.addressComponents
        });

        // Log each component individually for debugging
        console.log('📋 EACH COMPONENT:');
        place.addressComponents.forEach((component: any, index: number) => {
          console.log(`  ${index}: [${component.types.join(', ')}] = "${component.longText}" (short: "${component.shortText}")`);
        });

        // Parse address components with UNIVERSAL international support
        const components: AddressComponents = {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          countryCode: '',
          fullAddress: formattedAddress,
        };

        // Comprehensive address component mapping for ALL countries
        let streetNumber = '';
        let route = '';
        let subpremise = '';
        let premise = '';
        let neighborhood = '';
        let sublocality1 = '';
        let sublocality2 = '';
        let sublocality3 = '';
        let locality = '';
        let postalTown = '';
        let adminArea2 = '';
        let adminArea3 = '';
        let adminArea1 = ''; // State/Province - ALWAYS use this if available
        let adminArea1Short = ''; // State Code

        place.addressComponents.forEach((component: any) => {
          const types = component.types;
          const longName = component.longText;
          const shortName = component.shortText;

          // === STREET ADDRESS COMPONENTS ===
          // Street number (e.g., "123", "555")
          if (types.includes('street_number')) {
            streetNumber = longName;
          }

          // Route/Street name (e.g., "Main Street", "BM Saha Road")
          if (types.includes('route')) {
            route = longName;
          }

          // Subpremise (apartment, suite, unit number)
          if (types.includes('subpremise')) {
            subpremise = longName;
          }

          // Premise (building name or number)
          if (types.includes('premise')) {
            premise = longName;
          }

          // Neighborhood (common in many countries)
          if (types.includes('neighborhood')) {
            neighborhood = longName;
          }

          // Sublocality levels (used in India, Japan, South Korea, etc.)
          if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
            sublocality1 = longName;
          }
          if (types.includes('sublocality_level_2')) {
            sublocality2 = longName;
          }
          if (types.includes('sublocality_level_3')) {
            sublocality3 = longName;
          }

          // === CITY COMPONENTS (collect all, prioritize later) ===
          if (types.includes('locality')) {
            locality = longName;
          }
          if (types.includes('postal_town')) {
            postalTown = longName;
          }
          if (types.includes('administrative_area_level_2')) {
            adminArea2 = longName;
          }
          if (types.includes('administrative_area_level_3')) {
            adminArea3 = longName;
          }

          // === STATE/PROVINCE - ALWAYS CAPTURE LEVEL 1 ===
          if (types.includes('administrative_area_level_1')) {
            adminArea1 = longName; // This is the actual state/province
            adminArea1Short = shortName; // This is the state code (e.g., NY)
          }

          // === POSTAL CODE ===
          if (types.includes('postal_code')) {
            components.zip = longName;
          }
          // Some countries use postal_code_prefix or postal_code_suffix
          else if (types.includes('postal_code_prefix') && !components.zip) {
            components.zip = longName;
          }

          // === COUNTRY ===
          if (types.includes('country')) {
            components.country = longName;
            components.countryCode = shortName; // Add ISO code
          }
        });

        // === ASSIGN CITY with correct priority ===
        // Priority: locality > postal_town > admin_area_3 > admin_area_2 > sublocality_1
        if (locality) {
          components.city = locality;
        } else if (postalTown) {
          components.city = postalTown;
        } else if (adminArea3) {
          components.city = adminArea3;
        } else if (adminArea2) {
          components.city = adminArea2;
        } else if (sublocality1) {
          components.city = sublocality1;
        }

        // === ASSIGN STATE - ALWAYS USE administrative_area_level_1 if available ===
        // Using short name (code) for state/province to match form requirements (e.g. 2-letter codes)
        if (adminArea1Short) {
          components.state = adminArea1Short;
        } else if (adminArea2 && components.city && adminArea2 !== components.city) {
          // Fallback: only use level_2 if level_1 doesn't exist AND it's different from city
          components.state = adminArea2;
        }

        // === BUILD STREET ADDRESS (Universal approach) ===
        const streetParts = [];

        // Different countries have different address ordering
        // We'll build a comprehensive street address from available components

        // Add street number and route (most common worldwide)
        if (streetNumber) streetParts.push(streetNumber);
        if (route) streetParts.push(route);

        // Add premise/building name if available (but not if it's the same as street number)
        if (premise && premise !== streetNumber) streetParts.push(premise);

        // Add subpremise (apartment/unit) if available
        if (subpremise) streetParts.push(subpremise);

        // Add sublocality/neighborhood for Asian countries (India, Japan, Korea, etc.)
        // ONLY if they are NOT the city
        if (sublocality1 && sublocality1 !== components.city) {
          streetParts.push(sublocality1);
        }
        if (sublocality2 && sublocality2 !== components.city) {
          streetParts.push(sublocality2);
        }
        if (neighborhood && neighborhood !== components.city) {
          streetParts.push(neighborhood);
        }

        // Fallback: If no structured components OR only premise found, extract from formatted address
        if (streetParts.length === 0 || (streetParts.length === 1 && streetParts[0] === premise)) {
          // Strategy: Take everything before city/state/country/postal
          const addressLines = formattedAddress.split(',').map(part => part.trim());

          console.log('🔧 FALLBACK: Extracting street from formatted_address');
          console.log('   Address lines:', addressLines);
          console.log('   City to exclude:', components.city);
          console.log('   State to exclude:', components.state);

          // Filter out city, state, country, and postal codes
          const streetLines = addressLines.filter(line => {
            // Exclude exact matches
            if (line === components.city) return false;
            if (line === components.state) return false;
            if (line === components.country) return false;
            if (line === components.zip) return false;

            // Exclude lines that contain state/country names
            const lineLower = line.toLowerCase();
            if (components.state && lineLower.includes(components.state.toLowerCase())) return false;
            if (components.country && lineLower.includes(components.country.toLowerCase())) return false;

            // Exclude standalone postal codes
            if (/^\d{4,6}$/.test(line)) return false;

            return true;
          });

          console.log('   Filtered street lines:', streetLines);

          // Take first 1-2 lines for street address
          if (streetLines.length > 0) {
            // Take up to 2 lines (or just 1 if that's all we have)
            components.street = streetLines.slice(0, 2).join(', ');
            console.log('   ✅ Extracted street:', components.street);
          }
        } else {
          components.street = streetParts.join(', ');
        }

        // Final fallback: if still no street, use first line
        if (!components.street && formattedAddress) {
          components.street = formattedAddress.split(',')[0]?.trim() || '';
          console.log('⚠️ LAST RESORT: Using first line as street:', components.street);
        }

        // Debug logging with comprehensive details
        console.log('📍 PARSED ADDRESS COMPONENTS:', components);
        console.log('🔍 DETAILED BREAKDOWN:', {
          street: components.street,
          city: components.city,
          state: components.state,
          zip: components.zip,
          country: components.country
        });
        console.log('🗺️ RAW GOOGLE COMPONENTS:',
          place.addressComponents.map((c: any) => ({
            types: c.types,
            long_name: c.longText,
            short_name: c.shortText
          }))
        );

        // Mark that we're updating from autocomplete
        isUpdatingFromAutocomplete.current = true;

        // Update the input value
        if (inputRef.current) {
          inputRef.current.value = components.street;
        }

        // Update parent component with parsed components
        onChange(components.street, components);

        // Reset flag after a short delay
        setTimeout(() => {
          isUpdatingFromAutocomplete.current = false;
        }, 100);
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }

    return () => {
      // Cleanup autocomplete listeners
      if (autocompleteElementRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteElementRef.current);
      }
    };
  }, [isScriptLoaded, disabled, onChange]);

  // Sync external value changes to input (but not when autocomplete is updating)
  useEffect(() => {
    if (inputRef.current && !isUpdatingFromAutocomplete.current) {
      // Only update if the value is different
      if (inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
    }
  }, [value]);

  // Handle manual typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Get outline color based on state
  const getOutlineClass = () => {
    if (disabled) {
      return 'outline-[color:var(--border-secondary,#d1d5db)]';
    }
    if (error) {
      return 'outline-[color:var(--interaction-red-base,#ef4444)] focus-within:outline-[color:var(--interaction-red-base,#ef4444)] focus-within:outline-2';
    }
    if (success) {
      return 'outline-[color:var(--interaction-green-base,#10b981)] focus-within:outline-[color:var(--interaction-green-base,#10b981)] focus-within:outline-2';
    }
    return 'outline-[color:var(--border-primary,#e5e7eb)] focus-within:outline-[color:var(--brand-orange-base,#f97316)] focus-within:outline-2';
  };

  // Get text color based on state
  const getTextColor = () => {
    if (disabled) {
      return 'text-[color:var(--content-dark-tertiary,#9ca3af)]';
    }
    return 'text-[color:var(--content-dark-primary,#111827)] dark:text-[color:var(--content-light-primary,#f9fafb)]';
  };

  // Get icon color based on state
  const getIconColor = () => {
    if (disabled) {
      return 'text-[color:var(--content-dark-tertiary,#9ca3af)]';
    }
    if (error) {
      return 'text-[color:var(--interaction-red-base,#ef4444)]';
    }
    if (success) {
      return 'text-[color:var(--interaction-green-base,#10b981)]';
    }
    return 'text-[color:var(--content-dark-secondary,#6b7280)]';
  };

  return (
    <div className={`inline-flex flex-col justify-start items-start gap-2 ${className}`}>
      {label && (
        <div className="self-stretch flex flex-col justify-center items-start">
          <Label htmlFor={id} className="justify-start text-[color:var(--content-dark-primary,#111827)] dark:text-[color:var(--content-light-primary,#f9fafb)] text-sm">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        </div>
      )}

      <div className={`self-stretch px-3 py-2.5 rounded outline outline-1 outline-offset-[-1px] ${getOutlineClass()} inline-flex justify-start items-center gap-3 transition-all bg-background`}>
        {showIcon && (
          <MapPin className={`w-5 h-5 flex-shrink-0 ${getIconColor()}`} />
        )}

        {/* Container for the autocomplete element */}
        <div ref={containerRef} className="flex-1">
          <input
            ref={inputRef}
            id={id}
            type="text"
            defaultValue={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-transparent border-0 outline-none ${getTextColor()} text-sm placeholder:text-[color:var(--content-dark-tertiary,#9ca3af)] disabled:cursor-not-allowed`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          />
        </div>
      </div>

      {/* Helper Text */}
      {helperText && (
        <div
          id={`${id}-helper`}
          className={`justify-start text-xs ${error
            ? 'text-[color:var(--interaction-red-base,#ef4444)]'
            : success
              ? 'text-[color:var(--interaction-green-base,#10b981)]'
              : 'text-[color:var(--content-dark-tertiary,#6b7280)]'
            }`}
        >
          {helperText}
        </div>
      )}

      {/* Error message */}
      {error && !helperText && (
        <p id={`${id}-error`} className="text-xs text-[color:var(--interaction-red-base,#ef4444)]">
          {error}
        </p>
      )}

      {/* Configuration Info - Only show in development */}
      {showConfigWarning && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700 dark:text-blue-300">
            <strong>Dev mode:</strong> Manual address entry. Add VITE_GOOGLE_MAPS_API_KEY to <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-[11px]">.env</code> file for autocomplete.
          </p>
        </div>
      )}

      {/* Success indicator for configured API - Only in DEV */}
      {isScriptLoaded && isGoogleMapsConfigured() && import.meta.env.DEV && (
        <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 dark:text-green-300">
            ✅ Google Maps autocomplete enabled - start typing to see suggestions
          </p>
        </div>
      )}

      {/* Custom styles to override Google's autocomplete dropdown */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .pac-container {
            background-color: var(--background);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            font-family: inherit;
            margin-top: 4px;
            z-index: 9999;
          }
          .pac-item {
            border-top: 1px solid var(--border);
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
            color: var(--foreground);
          }
          .pac-item:first-child {
            border-top: none;
          }
          .pac-item:hover {
            background-color: var(--accent);
          }
          .pac-item-selected {
            background-color: var(--accent);
          }
          .pac-item-query {
            color: var(--foreground);
            font-size: 14px;
          }
          .pac-matched {
            font-weight: 600;
            color: var(--primary);
          }
          .pac-icon {
            display: none;
          }
        `
      }} />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Label } from './ui/label';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { GOOGLE_MAPS_CONFIG, isGoogleMapsConfigured } from '../config/googleMaps';
import { cn } from './ui/utils';

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
  placeholder = 'Street address',
  required = false,
  disabled = false,
  error,
  helperText,
  success = false,
  className = '',
  showIcon = true,
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteInstance = useRef<any>(null); // PlaceAutocompleteElement
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showConfigWarning, setShowConfigWarning] = useState(false);

  // Check configuration
  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      setShowConfigWarning(true);
    }
  }, []);

  // Load Google Maps Script
  useEffect(() => {
    if (!isGoogleMapsConfigured()) return;

    if ((window as any).google?.maps?.places?.PlaceAutocompleteElement) {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      const interval = setInterval(() => {
        if ((window as any).google?.maps?.places?.PlaceAutocompleteElement) {
          setIsScriptLoaded(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => setTimeout(() => setIsScriptLoaded(true), 500);
    script.onerror = () => setShowConfigWarning(true);
    document.head.appendChild(script);
  }, []);

  // Initialize Programmatic Web Component
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !isGoogleMapsConfigured()) return;
    if (autocompleteInstance.current) return;

    try {
      const google = (window as any).google;
      const AutocompleteElement = google.maps.places.PlaceAutocompleteElement;

      if (!AutocompleteElement) return;

      const elem = new AutocompleteElement();

      // Force Styling
      elem.style.width = '100%';
      elem.style.height = '100%';
      elem.style.display = 'block';
      elem.classList.add('bg-transparent');

      if (placeholder) {
        elem.setAttribute('placeholder', placeholder);
      }

      elem.addEventListener('gmp-placeselect', async ({ place }: any) => {
        if (!place) return;
        await place.fetchFields({ fields: ['formattedAddress', 'addressComponents', 'location'] });

        const components: AddressComponents = {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          countryCode: '',
          fullAddress: place.formattedAddress || '',
        };

        if (place.addressComponents) {
          const componentMap: Record<string, any> = {};
          for (const component of place.addressComponents) {
            for (const type of component.types) {
              componentMap[type] = component;
            }
          }

          // Street
          if (componentMap.street_number) components.street = componentMap.street_number.longText + ' ';
          if (componentMap.route) components.street += componentMap.route.longText;

          // City Priority
          if (componentMap.locality) {
            components.city = componentMap.locality.longText;
          } else if (componentMap.postal_town) {
            components.city = componentMap.postal_town.longText;
          } else if (componentMap.sublocality_level_1) {
            components.city = componentMap.sublocality_level_1.longText;
          } else if (componentMap.sublocality) {
            components.city = componentMap.sublocality.longText;
          } else if (componentMap.administrative_area_level_2) {
            components.city = componentMap.administrative_area_level_2.longText;
          }

          // State
          if (componentMap.administrative_area_level_1) {
            components.state = componentMap.administrative_area_level_1.shortText;
          }

          // Zip (Component)
          if (componentMap.postal_code) {
            components.zip = componentMap.postal_code.longText;
          }

          // Country
          if (componentMap.country) {
            components.country = componentMap.country.longText;
            components.countryCode = componentMap.country.shortText;
          }
        }

        // Fallback: Parsing Zip from formatted string if component missing (Common fallback)
        if (!components.zip && place.formattedAddress) {
          // Look for 5-digit (US) or 6-digit (India/others) patterns surrounded by word boundaries
          const zipMatch = place.formattedAddress.match(/\b\d{5,6}\b/);
          if (zipMatch) {
            components.zip = zipMatch[0];
          }
        }

        // Fallback: Parsing State ISO if missing? 
        // (Harder, depends on known lists. We rely on Google components for State mostly).

        components.street = components.street.trim();
        console.log('📍 Parsed Address Data:', components);
        onChange(place.formattedAddress, components);
      });

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(elem);
      autocompleteInstance.current = elem;

    } catch (e) {
      console.error('Init Error', e);
    }
  }, [isScriptLoaded]);

  // Determine styles matching Input.tsx exactly
  const wrapperClasses = cn(
    "flex h-10 w-full rounded relative",
    "bg-[var(--interaction-secondary-base,#FFFFFF)]",
    "outline outline-1 outline-offset-[-1px]",
    error
      ? "outline-[var(--interaction-red-base,#AF4B4B)]"
      : "outline-[var(--interaction-outline-base,#D9DFEB)]",
    "focus-within:outline-[var(--interaction-outline-active,#6D7076)]",
    "focus-within:outline-1",
    disabled && "bg-[var(--interaction-secondary-disabled,#F7F9FB)]",
    disabled && "outline-[var(--interaction-outline-disabled,#E8ECF3)]",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Wrapper acting as Input */}
      <div className={wrapperClasses}>

        {/* Custom Icon: ONLY show if script NOT loaded (fallback). */}
        {showIcon && !isScriptLoaded && (
          <div className="absolute left-3 top-2.5 z-10 pointer-events-none">
            {!isScriptLoaded ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <MapPin className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            )}
          </div>
        )}

        {/* The Google Web Component Container */}
        <div ref={containerRef} className="flex-1 w-full h-full" style={{
          // @ts-ignore
          '--gmp-place-autocomplete-border-radius': '0px',
          '--gmp-place-autocomplete-border-color': 'transparent',
          '--gmp-place-autocomplete-box-shadow': 'none',
          '--gmp-place-autocomplete-font-family': 'inherit',
          '--gmp-place-autocomplete-font-size': '0.875rem',
          '--gmp-place-autocomplete-height': '100%',
          // Padding: Standard (12px)
          '--gmp-place-autocomplete-input-padding': '0px 12px',
          '--gmp-place-autocomplete-background-color': 'transparent',
          '--gmp-place-autocomplete-input-color': 'var(--content-dark-primary,#000000)',
          '--gmp-place-autocomplete-placeholder-color': 'var(--content-dark-tertiary,#A3A7B0)',
        }} />
      </div>

      {(error || helperText) && (
        <p className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}

      {showConfigWarning && process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-1 rounded">
          Check VITE_GOOGLE_MAPS_API_KEY in .env
        </div>
      )}
    </div>
  );
}

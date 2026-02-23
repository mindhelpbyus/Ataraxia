import { useState, useEffect, useRef } from 'react';
import { State, City } from 'country-state-city';

// AddressAutocomplete uses components with countryCode
import { AddressComponents } from '../components/AddressAutocomplete';
import { logger } from '../utils/secureLogger';

export interface UseAddressAutocompleteOptions {
    country: string;
    state: string;
    city: string;
    onUpdate: (data: any) => void;
}

export function useAddressAutocomplete({ country, state, city, onUpdate }: UseAddressAutocompleteOptions) {
    const [availableStates, setAvailableStates] = useState<any[]>([]);
    const [availableCities, setAvailableCities] = useState<any[]>([]);
    const [showOtherCityInput, setShowOtherCityInput] = useState(false);
    const [lastCountry, setLastCountry] = useState<string>('');
    const [lastState, setLastState] = useState<string>('');
    const isAutocompleteUpdate = useRef(false);

    // Auto-populate states when country changes
    useEffect(() => {
        if (country && country !== lastCountry) {
            logger.debug('🌍 Country changed:', { country, lastCountry, isAutocomplete: isAutocompleteUpdate.current });

            // Use country-state-city library for comprehensive data
            const states = State.getStatesOfCountry(country);
            setAvailableStates(states);

            // Get timezone from Intl API based on country
            const timezone = getTimezoneForCountry(country);

            // DON'T reset if this is from autocomplete
            if (isAutocompleteUpdate.current) {
                logger.debug('✅ Skipping reset - autocomplete update');
                onUpdate({ timezone });
                // Don't reset flag here - let timeout handle it to allow state effect to see it too
            } else if (lastCountry) {
                // Manual change - reset dependent fields
                logger.debug('🔄 Manual country change - resetting state and city');
                onUpdate({ timezone, state: '', city: '' });
                setAvailableCities([]);
                setShowOtherCityInput(false);
            } else {
                // Initial load
                logger.debug('🆕 Initial load - just setting timezone');
                onUpdate({ timezone });
            }

            setLastCountry(country);
        }
    }, [country]);

    // Auto-populate cities when state changes
    useEffect(() => {
        if (country && state && state !== lastState) {
            logger.debug('🏙️ State changed:', { state, lastState, isAutocomplete: isAutocompleteUpdate.current });

            // Use country-state-city library for comprehensive data
            const cities = City.getCitiesOfState(country, state);
            setAvailableCities(cities);

            // Get timezone from Intl API
            const timezone = getTimezoneForState(country, state);

            // DON'T reset if this is from autocomplete
            if (isAutocompleteUpdate.current) {
                logger.debug('✅ Skipping city reset - autocomplete update');
                logger.debug('📍 Accepting Google Maps data as-is (prioritizing over library)');

                // Google Maps data takes priority - don't validate against library
                // The city from Google Maps might not be in country-state-city library, but that's OK
                onUpdate({ timezone });
            } else if (lastState) {
                // Manual change - reset city
                logger.debug('🔄 Manual state change - resetting city');
                onUpdate({ timezone, city: '' });
                setShowOtherCityInput(false);
            } else {
                // Initial load
                logger.debug('🆕 Initial state load - just setting timezone');

                // Also check on initial load
                const cityExists = cities.some(c => c.name === city);
                if (!cityExists && city) {
                    logger.debug('⚠️ Initial city not in list - enabling custom input:', { city });
                    setShowOtherCityInput(true);
                }

                onUpdate({ timezone });
            }

            setLastState(state);
        }
    }, [state]);

    // Auto-populate timezone when city changes
    useEffect(() => {
        if (country && state && city) {
            if (city === 'Other') {
                setShowOtherCityInput(true);
                return;
            }

            setShowOtherCityInput(false);
            // Timezone is already set by state, no need to update again
        }
    }, [city]);

    // Helper function to get timezone for country
    const getTimezoneForCountry = (countryCode: string): string => {
        // Use Intl API to get timezone based on country
        const timezoneMap: Record<string, string> = {
            'IN': 'Asia/Kolkata',
            'US': 'America/New_York',
            'GB': 'Europe/London',
            'CA': 'America/Toronto',
            'AU': 'Australia/Sydney',
        };
        return timezoneMap[countryCode] || Intl.DateTimeFormat().resolvedOptions().timeZone;
    };

    // Helper function to get timezone for state
    const getTimezoneForState = (countryCode: string, stateCode: string): string => {
        // For US, we can be more specific
        if (countryCode === 'US') {
            const usTimezones: Record<string, string> = {
                'CA': 'America/Los_Angeles',
                'NY': 'America/New_York',
                'TX': 'America/Chicago',
                'FL': 'America/New_York',
                'IL': 'America/Chicago',
                'WA': 'America/Los_Angeles',
                'AZ': 'America/Phoenix',
                'HI': 'Pacific/Honolulu',
                'AK': 'America/Anchorage',
            };
            return usTimezones[stateCode] || 'America/New_York';
        }
        return getTimezoneForCountry(countryCode);
    };

    /**
     * Handler for AddressAutocomplete onChange
     * Call this from your AddressAutocomplete component
     */
    const handleAddressSelect = (value: string, components?: AddressComponents) => {
        if (components) {
            logger.debug('📍 Autocomplete selected:', components);
            logger.debug('🔑 Country code from autocomplete:', { countryCode: components.countryCode });
            logger.debug('🏙️ State code from autocomplete:', { state: components.state });
            logger.debug('🌆 City from autocomplete:', { city: components.city });

            // Set flag BEFORE calling onUpdate to prevent resets
            isAutocompleteUpdate.current = true;

            // Reset flag after sufficient time for all effects to run
            setTimeout(() => {
                isAutocompleteUpdate.current = false;
                logger.debug('🏁 Autocomplete update flag reset');
            }, 1000);

            // Prepare update object
            const updateData = {
                address1: components.street || value,
                city: components.city,
                state: components.state,
                zip: components.zip,
                zipCode: components.zip,
                country: components.countryCode || components.country
            };

            logger.debug('📤 Sending update to form:', updateData);

            // Update all fields at once
            onUpdate(updateData);
        } else {
            // Manual typing - just update address1
            logger.debug('⌨️ Manual typing - updating address1 only:', { value });
            onUpdate({ address1: value });
        }
    };

    return {
        availableStates,
        availableCities,
        showOtherCityInput,
        setShowOtherCityInput,
        handleAddressSelect
    };
}

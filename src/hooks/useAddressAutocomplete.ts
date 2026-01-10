import { useState, useEffect, useRef } from 'react';
import {
    getStatesForCountry,
    getCitiesForState,
    getTimezoneForCountry,
    getTimezoneForState,
    getTimezoneForCity
} from '../data/locationData';

// AddressAutocomplete uses components with countryCode
import { AddressComponents } from '../components/AddressAutocomplete';

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
            console.log('🌍 Country changed:', { country, lastCountry, isAutocomplete: isAutocompleteUpdate.current });

            const states = getStatesForCountry(country);
            setAvailableStates(states);

            // Auto-populate timezone based on country
            const timezone = getTimezoneForCountry(country);

            // DON'T reset if this is from autocomplete
            if (isAutocompleteUpdate.current) {
                console.log('✅ Skipping reset - autocomplete update');
                onUpdate({ timezone });
                // Don't reset flag here - let timeout handle it to allow state effect to see it too
            } else if (lastCountry) {
                // Manual change - reset dependent fields
                console.log('🔄 Manual country change - resetting state and city');
                onUpdate({ timezone, state: '', city: '' });
                setAvailableCities([]);
                setShowOtherCityInput(false);
            } else {
                // Initial load
                console.log('🆕 Initial load - just setting timezone');
                onUpdate({ timezone });
            }

            setLastCountry(country);
        }
    }, [country]);

    // Auto-populate cities when state changes
    useEffect(() => {
        if (country && state && state !== lastState) {
            console.log('🏙️ State changed:', { state, lastState, isAutocomplete: isAutocompleteUpdate.current });

            const cities = getCitiesForState(country, state);
            setAvailableCities(cities);

            // Auto-populate timezone based on state
            const timezone = getTimezoneForState(country, state);

            // DON'T reset if this is from autocomplete
            if (isAutocompleteUpdate.current) {
                console.log('✅ Skipping city reset - autocomplete update');

                // Check if the current city is in the available cities list
                const cityExists = cities.some(c => c.name === city);
                if (!cityExists && city) {
                    console.log('⚠️ City from autocomplete not in list - enabling custom input:', city);
                    setShowOtherCityInput(true);
                }

                onUpdate({ timezone });
            } else if (lastState) {
                // Manual change - reset city
                console.log('🔄 Manual state change - resetting city');
                onUpdate({ timezone, city: '' });
                setShowOtherCityInput(false);
            } else {
                // Initial load
                console.log('🆕 Initial state load - just setting timezone');

                // Also check on initial load
                const cityExists = cities.some(c => c.name === city);
                if (!cityExists && city) {
                    console.log('⚠️ Initial city not in list - enabling custom input:', city);
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
            const timezone = getTimezoneForCity(country, state, city);
            onUpdate({ timezone });
        }
    }, [city]);

    /**
     * Handler for AddressAutocomplete onChange
     * Call this from your AddressAutocomplete component
     */
    const handleAddressSelect = (value: string, components?: AddressComponents) => {
        if (components) {
            console.log('📍 Autocomplete selected:', components);
            console.log('🔑 Country code from autocomplete:', components.countryCode);
            console.log('🏙️ State code from autocomplete:', components.state);
            console.log('🌆 City from autocomplete:', components.city);

            // Set flag BEFORE calling onUpdate to prevent resets
            isAutocompleteUpdate.current = true;

            // Reset flag after sufficient time for all effects to run
            setTimeout(() => {
                isAutocompleteUpdate.current = false;
                console.log('🏁 Autocomplete update flag reset');
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

            console.log('📤 Sending update to form:', updateData);

            // Update all fields at once
            onUpdate(updateData);
        } else {
            // Manual typing - just update address1
            console.log('⌨️ Manual typing - updating address1 only:', value);
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

# Task Summary: Remove Google Maps API from Client Registration

## Objective
The user requested to remove the "Dev mode: Manual address entry" warning from the client registration form and remove the Google Maps API integration.

## Actions Taken
1.  **Refactored `AddressAutocomplete.tsx`**:
    -   Removed all Google Maps specific imports and logic (script loading, autocomplete initialization).
    -   Removed the `useEffect` that checked for API configuration and displayed the warning `Dev mode: Manual address entry. Add VITE_GOOGLE_MAPS_API_KEY...`.
    -   Simplified the component to validly function as a standard manual address input field while maintaining the same props interface to avoid breaking existing consuming components.
    -   Ensured `onChange` only passes the input value when typing manually, preventing the overwriting of other address fields (City, State, Zip) with empty data in parent forms.

## Verification
-   Verified `ClientSelfRegistrationForm.tsx` handles the `onChange` event correctly (it ignores the components part if undefined, which is now the case for manual entry).
-   `src/components/AddressAutocomplete.tsx` is now a lightweight wrapper around an input field with styling and label support, but without external dependencies.
-   Built the project successfully (`npm run build`).

## Notes
-   `src/config/googleMaps.ts` remains in the codebase but is now effectively unused by the UI components. It can be removed in a future cleanup if desired.
-   `VITE_GOOGLE_MAPS_API_KEY` is no longer required in `.env`.

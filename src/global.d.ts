import React from 'react';

export { };

declare global {
    interface Window {
        google: any;
    }
    namespace JSX {
        interface IntrinsicElements {
            'gmp-place-autocomplete': any;
        }
    }
}

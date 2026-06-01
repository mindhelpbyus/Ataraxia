/**
 * lib/location.ts — lightweight, API-first location data.
 *
 * Replaces the heavy `country-state-city` (8.6 MB) + `zipcodes` (4.6 MB) bundles.
 * Design (PIN-first, India-first):
 *  - Countries: from `countries-and-timezones` (already a dep, ~few KB).
 *  - States: tiny bundled India list; other countries resolve via PIN/zip auto-fill.
 *  - Cities: never bundled — auto-filled from a PIN/zip lookup, or free text.
 *  - PIN/zip lookup: postalpincode.in (India) + zippopotam.us (others), on demand.
 *
 * Exposes `Country` / `State` / `City` with the same method names the old lib used,
 * so consumers swap only the import path.
 */

import * as ct from 'countries-and-timezones';

export interface IsoOption {
  isoCode: string;
  name: string;
  /** Optional, for parity with the old lib — not populated in the light model. */
  phonecode?: string;
  latitude?: string;
  longitude?: string;
}

// ── Countries (light) ───────────────────────────────────────────────────────────
export const Country = {
  getAllCountries(): IsoOption[] {
    return Object.values(ct.getAllCountries())
      .map((c) => ({ isoCode: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  getCountry(code: string): IsoOption | undefined {
    const c = ct.getCountry(code);
    return c ? { isoCode: c.id, name: c.name } : undefined;
  },
  // Alias kept for parity with the old country-state-city API.
  getCountryByCode(code: string): IsoOption | undefined {
    return this.getCountry(code);
  },
};

// ── States ───────────────────────────────────────────────────────────────────────
// India bundled (28 states + 8 UTs). Other countries: empty → use PIN/zip auto-fill.
const INDIA_STATES: IsoOption[] = [
  ['AN', 'Andaman and Nicobar Islands'], ['AP', 'Andhra Pradesh'], ['AR', 'Arunachal Pradesh'],
  ['AS', 'Assam'], ['BR', 'Bihar'], ['CH', 'Chandigarh'], ['CT', 'Chhattisgarh'],
  ['DN', 'Dadra and Nagar Haveli and Daman and Diu'], ['DL', 'Delhi'], ['GA', 'Goa'],
  ['GJ', 'Gujarat'], ['HR', 'Haryana'], ['HP', 'Himachal Pradesh'], ['JK', 'Jammu and Kashmir'],
  ['JH', 'Jharkhand'], ['KA', 'Karnataka'], ['KL', 'Kerala'], ['LA', 'Ladakh'],
  ['LD', 'Lakshadweep'], ['MP', 'Madhya Pradesh'], ['MH', 'Maharashtra'], ['MN', 'Manipur'],
  ['ML', 'Meghalaya'], ['MZ', 'Mizoram'], ['NL', 'Nagaland'], ['OR', 'Odisha'],
  ['PY', 'Puducherry'], ['PB', 'Punjab'], ['RJ', 'Rajasthan'], ['SK', 'Sikkim'],
  ['TN', 'Tamil Nadu'], ['TG', 'Telangana'], ['TR', 'Tripura'], ['UP', 'Uttar Pradesh'],
  ['UT', 'Uttarakhand'], ['WB', 'West Bengal'],
].map(([isoCode, name]) => ({ isoCode, name }));

export const State = {
  getStatesOfCountry(countryCode?: string): IsoOption[] {
    if (countryCode === 'IN') return INDIA_STATES;
    return []; // other countries → PIN/zip auto-fill or free text
  },
};

// ── Cities ───────────────────────────────────────────────────────────────────────
// Never bundled. Resolved by PIN/zip lookup (lookupPostalCode) or free text.
export const City = {
  getCitiesOfState(_countryCode?: string, _stateCode?: string): IsoOption[] {
    return [];
  },
};

// ── PIN / postal-code lookup (on demand) ─────────────────────────────────────────
export interface PostalPlace { city: string; state: string; district?: string; pincode?: string; }

/** India PIN code → places (postalpincode.in). */
export async function lookupIndiaPincode(pincode: string): Promise<PostalPlace[]> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    const offices = data?.[0]?.PostOffice ?? [];
    return offices.map((po: any) => ({
      city: po.Name, district: po.District, state: po.State, pincode: po.Pincode,
    }));
  } catch {
    return [];
  }
}

/** Generic postal/zip → places (zippopotam.us), any supported country. */
export async function lookupPostalCode(countryCode: string, code: string): Promise<PostalPlace[]> {
  try {
    const res = await fetch(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${code}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.places ?? []).map((p: any) => ({
      city: p['place name'], state: p['state'], pincode: data['post code'],
    }));
  } catch {
    return [];
  }
}

/** Drop-in shim for the removed `zipcodes` package (US-only). Returns []. */
export const zipcodesShim = {
  lookupByName: (_name: string): any[] => [],
  lookupByState: (_state: string): any[] => [],
  lookup: (_zip: string): any => undefined,
};

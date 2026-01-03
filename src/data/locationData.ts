/**
 * Location Data for Onboarding
 * Country → States → Cities → Timezones
 */

export interface CityData {
  name: string;
  timezone?: string;
}

export interface StateData {
  name: string;
  code: string;
  cities: CityData[];
  timezone?: string; // Default timezone for state
}

export interface CountryData {
  name: string;
  code: string;
  states: StateData[];
  defaultTimezone?: string;
}

// United States
const usStates: StateData[] = [
  {
    name: 'California',
    code: 'CA',
    timezone: 'America/Los_Angeles',
    cities: [
      { name: 'Los Angeles', timezone: 'America/Los_Angeles' },
      { name: 'San Francisco', timezone: 'America/Los_Angeles' },
      { name: 'San Diego', timezone: 'America/Los_Angeles' },
      { name: 'San Jose', timezone: 'America/Los_Angeles' },
      { name: 'Sacramento', timezone: 'America/Los_Angeles' },
      { name: 'Oakland', timezone: 'America/Los_Angeles' },
      { name: 'Fresno', timezone: 'America/Los_Angeles' },
      { name: 'Other' },
    ],
  },
  {
    name: 'New York',
    code: 'NY',
    timezone: 'America/New_York',
    cities: [
      { name: 'New York City', timezone: 'America/New_York' },
      { name: 'Buffalo', timezone: 'America/New_York' },
      { name: 'Rochester', timezone: 'America/New_York' },
      { name: 'Albany', timezone: 'America/New_York' },
      { name: 'Syracuse', timezone: 'America/New_York' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Texas',
    code: 'TX',
    timezone: 'America/Chicago',
    cities: [
      { name: 'Houston', timezone: 'America/Chicago' },
      { name: 'Dallas', timezone: 'America/Chicago' },
      { name: 'Austin', timezone: 'America/Chicago' },
      { name: 'San Antonio', timezone: 'America/Chicago' },
      { name: 'Fort Worth', timezone: 'America/Chicago' },
      { name: 'El Paso', timezone: 'America/Denver' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Florida',
    code: 'FL',
    timezone: 'America/New_York',
    cities: [
      { name: 'Miami', timezone: 'America/New_York' },
      { name: 'Orlando', timezone: 'America/New_York' },
      { name: 'Tampa', timezone: 'America/New_York' },
      { name: 'Jacksonville', timezone: 'America/New_York' },
      { name: 'Fort Lauderdale', timezone: 'America/New_York' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Illinois',
    code: 'IL',
    timezone: 'America/Chicago',
    cities: [
      { name: 'Chicago', timezone: 'America/Chicago' },
      { name: 'Aurora', timezone: 'America/Chicago' },
      { name: 'Naperville', timezone: 'America/Chicago' },
      { name: 'Rockford', timezone: 'America/Chicago' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Washington',
    code: 'WA',
    timezone: 'America/Los_Angeles',
    cities: [
      { name: 'Seattle', timezone: 'America/Los_Angeles' },
      { name: 'Spokane', timezone: 'America/Los_Angeles' },
      { name: 'Tacoma', timezone: 'America/Los_Angeles' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Massachusetts',
    code: 'MA',
    timezone: 'America/New_York',
    cities: [
      { name: 'Boston', timezone: 'America/New_York' },
      { name: 'Cambridge', timezone: 'America/New_York' },
      { name: 'Worcester', timezone: 'America/New_York' },
      { name: 'Other' },
    ],
  },
];

// India
const indiaStates: StateData[] = [
  {
    name: 'Maharashtra',
    code: 'MH',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'Mumbai', timezone: 'Asia/Kolkata' },
      { name: 'Pune', timezone: 'Asia/Kolkata' },
      { name: 'Nagpur', timezone: 'Asia/Kolkata' },
      { name: 'Thane', timezone: 'Asia/Kolkata' },
      { name: 'Nashik', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'Bangalore', timezone: 'Asia/Kolkata' },
      { name: 'Mysore', timezone: 'Asia/Kolkata' },
      { name: 'Hubli', timezone: 'Asia/Kolkata' },
      { name: 'Mangalore', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'Chennai', timezone: 'Asia/Kolkata' },
      { name: 'Coimbatore', timezone: 'Asia/Kolkata' },
      { name: 'Madurai', timezone: 'Asia/Kolkata' },
      { name: 'Tiruchirappalli', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Delhi',
    code: 'DL',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'New Delhi', timezone: 'Asia/Kolkata' },
      { name: 'Delhi', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
  {
    name: 'West Bengal',
    code: 'WB',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'Kolkata', timezone: 'Asia/Kolkata' },
      { name: 'Howrah', timezone: 'Asia/Kolkata' },
      { name: 'Siliguri', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'Ahmedabad', timezone: 'Asia/Kolkata' },
      { name: 'Surat', timezone: 'Asia/Kolkata' },
      { name: 'Vadodara', timezone: 'Asia/Kolkata' },
      { name: 'Rajkot', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Telangana',
    code: 'TG',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'Hyderabad', timezone: 'Asia/Kolkata' },
      { name: 'Warangal', timezone: 'Asia/Kolkata' },
      { name: 'Nizamabad', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    timezone: 'Asia/Kolkata',
    cities: [
      { name: 'Lucknow', timezone: 'Asia/Kolkata' },
      { name: 'Kanpur', timezone: 'Asia/Kolkata' },
      { name: 'Agra', timezone: 'Asia/Kolkata' },
      { name: 'Varanasi', timezone: 'Asia/Kolkata' },
      { name: 'Other' },
    ],
  },
];

// Country List
export const COUNTRIES: CountryData[] = [
  {
    name: 'United States',
    code: 'US',
    states: usStates,
    defaultTimezone: 'America/New_York',
  },
  {
    name: 'India',
    code: 'IN',
    states: indiaStates,
    defaultTimezone: 'Asia/Kolkata',
  },
  {
    name: 'United Kingdom',
    code: 'UK',
    states: [
      {
        name: 'England',
        code: 'ENG',
        timezone: 'Europe/London',
        cities: [
          { name: 'London', timezone: 'Europe/London' },
          { name: 'Manchester', timezone: 'Europe/London' },
          { name: 'Birmingham', timezone: 'Europe/London' },
          { name: 'Liverpool', timezone: 'Europe/London' },
          { name: 'Other' },
        ],
      },
      {
        name: 'Scotland',
        code: 'SCT',
        timezone: 'Europe/London',
        cities: [
          { name: 'Edinburgh', timezone: 'Europe/London' },
          { name: 'Glasgow', timezone: 'Europe/London' },
          { name: 'Aberdeen', timezone: 'Europe/London' },
          { name: 'Other' },
        ],
      },
    ],
    defaultTimezone: 'Europe/London',
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      {
        name: 'Ontario',
        code: 'ON',
        timezone: 'America/Toronto',
        cities: [
          { name: 'Toronto', timezone: 'America/Toronto' },
          { name: 'Ottawa', timezone: 'America/Toronto' },
          { name: 'Mississauga', timezone: 'America/Toronto' },
          { name: 'Other' },
        ],
      },
      {
        name: 'British Columbia',
        code: 'BC',
        timezone: 'America/Vancouver',
        cities: [
          { name: 'Vancouver', timezone: 'America/Vancouver' },
          { name: 'Victoria', timezone: 'America/Vancouver' },
          { name: 'Surrey', timezone: 'America/Vancouver' },
          { name: 'Other' },
        ],
      },
      {
        name: 'Quebec',
        code: 'QC',
        timezone: 'America/Toronto',
        cities: [
          { name: 'Montreal', timezone: 'America/Toronto' },
          { name: 'Quebec City', timezone: 'America/Toronto' },
          { name: 'Laval', timezone: 'America/Toronto' },
          { name: 'Other' },
        ],
      },
    ],
    defaultTimezone: 'America/Toronto',
  },
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        code: 'NSW',
        timezone: 'Australia/Sydney',
        cities: [
          { name: 'Sydney', timezone: 'Australia/Sydney' },
          { name: 'Newcastle', timezone: 'Australia/Sydney' },
          { name: 'Wollongong', timezone: 'Australia/Sydney' },
          { name: 'Other' },
        ],
      },
      {
        name: 'Victoria',
        code: 'VIC',
        timezone: 'Australia/Melbourne',
        cities: [
          { name: 'Melbourne', timezone: 'Australia/Melbourne' },
          { name: 'Geelong', timezone: 'Australia/Melbourne' },
          { name: 'Ballarat', timezone: 'Australia/Melbourne' },
          { name: 'Other' },
        ],
      },
      {
        name: 'Queensland',
        code: 'QLD',
        timezone: 'Australia/Brisbane',
        cities: [
          { name: 'Brisbane', timezone: 'Australia/Brisbane' },
          { name: 'Gold Coast', timezone: 'Australia/Brisbane' },
          { name: 'Cairns', timezone: 'Australia/Brisbane' },
          { name: 'Other' },
        ],
      },
    ],
    defaultTimezone: 'Australia/Sydney',
  },
];

/**
 * Get states for a country
 */
export function getStatesForCountry(countryName: string): StateData[] {
  const country = COUNTRIES.find(c => c.name === countryName);
  return country?.states || [];
}

/**
 * Get cities for a state
 */
export function getCitiesForState(countryName: string, stateName: string): CityData[] {
  const country = COUNTRIES.find(c => c.name === countryName);
  const state = country?.states.find(s => s.name === stateName);
  return state?.cities || [];
}

/**
 * Get timezone for a country
 */
export function getTimezoneForCountry(countryName: string): string {
  const country = COUNTRIES.find(c => c.name === countryName);
  return country?.defaultTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone for a state
 */
export function getTimezoneForState(countryName: string, stateName: string): string {
  const country = COUNTRIES.find(c => c.name === countryName);
  const state = country?.states.find(s => s.name === stateName);
  return state?.timezone || country?.defaultTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone for a city
 */
export function getTimezoneForCity(countryName: string, stateName: string, cityName: string): string {
  const country = COUNTRIES.find(c => c.name === countryName);
  const state = country?.states.find(s => s.name === stateName);
  const city = state?.cities.find(c => c.name === cityName);
  return city?.timezone || state?.timezone || country?.defaultTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

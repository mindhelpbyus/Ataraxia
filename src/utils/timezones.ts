/**
 * Timezone utilities for Ataraxia
 * Provides comprehensive timezone support with country-based suggestions
 */

export interface TimezoneInfo {
  value: string;
  label: string;
  country: string;
  offset: string;
  popular?: boolean;
}

// Comprehensive timezone list with country mappings
export const TIMEZONES: TimezoneInfo[] = [
  // India (Primary Market)
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', country: 'IN', offset: 'UTC+05:30', popular: true },
  
  // USA (Secondary Market)
  { value: 'America/New_York', label: 'Eastern Time (ET)', country: 'US', offset: 'UTC-05:00', popular: true },
  { value: 'America/Chicago', label: 'Central Time (CT)', country: 'US', offset: 'UTC-06:00', popular: true },
  { value: 'America/Denver', label: 'Mountain Time (MT)', country: 'US', offset: 'UTC-07:00', popular: true },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', country: 'US', offset: 'UTC-08:00', popular: true },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', country: 'US', offset: 'UTC-09:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', country: 'US', offset: 'UTC-10:00' },
  
  // UK & Europe
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', country: 'GB', offset: 'UTC+00:00', popular: true },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', country: 'FR', offset: 'UTC+01:00', popular: true },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)', country: 'DE', offset: 'UTC+01:00' },
  { value: 'Europe/Rome', label: 'Central European Time (CET)', country: 'IT', offset: 'UTC+01:00' },
  { value: 'Europe/Madrid', label: 'Central European Time (CET)', country: 'ES', offset: 'UTC+01:00' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (CET)', country: 'NL', offset: 'UTC+01:00' },
  { value: 'Europe/Zurich', label: 'Central European Time (CET)', country: 'CH', offset: 'UTC+01:00' },
  
  // Asia Pacific
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', country: 'AE', offset: 'UTC+04:00', popular: true },
  { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT)', country: 'SG', offset: 'UTC+08:00', popular: true },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT)', country: 'HK', offset: 'UTC+08:00' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', country: 'JP', offset: 'UTC+09:00', popular: true },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)', country: 'KR', offset: 'UTC+09:00' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', country: 'CN', offset: 'UTC+08:00' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (ICT)', country: 'TH', offset: 'UTC+07:00' },
  { value: 'Asia/Jakarta', label: 'Western Indonesia Time (WIB)', country: 'ID', offset: 'UTC+07:00' },
  { value: 'Asia/Manila', label: 'Philippine Standard Time (PST)', country: 'PH', offset: 'UTC+08:00' },
  
  // Australia & New Zealand
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', country: 'AU', offset: 'UTC+10:00', popular: true },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AET)', country: 'AU', offset: 'UTC+10:00' },
  { value: 'Australia/Brisbane', label: 'Australian Eastern Time (AET)', country: 'AU', offset: 'UTC+10:00' },
  { value: 'Australia/Perth', label: 'Australian Western Time (AWT)', country: 'AU', offset: 'UTC+08:00' },
  { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (NZST)', country: 'NZ', offset: 'UTC+12:00' },
  
  // Canada
  { value: 'America/Toronto', label: 'Eastern Time (ET)', country: 'CA', offset: 'UTC-05:00' },
  { value: 'America/Vancouver', label: 'Pacific Time (PT)', country: 'CA', offset: 'UTC-08:00' },
  { value: 'America/Winnipeg', label: 'Central Time (CT)', country: 'CA', offset: 'UTC-06:00' },
  { value: 'America/Halifax', label: 'Atlantic Time (AT)', country: 'CA', offset: 'UTC-04:00' },
  
  // South America
  { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT)', country: 'BR', offset: 'UTC-03:00' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time (ART)', country: 'AR', offset: 'UTC-03:00' },
  { value: 'America/Santiago', label: 'Chile Standard Time (CLT)', country: 'CL', offset: 'UTC-04:00' },
  
  // Africa & Middle East
  { value: 'Africa/Cairo', label: 'Eastern European Time (EET)', country: 'EG', offset: 'UTC+02:00' },
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)', country: 'ZA', offset: 'UTC+02:00' },
  { value: 'Asia/Riyadh', label: 'Arabia Standard Time (AST)', country: 'SA', offset: 'UTC+03:00' },
  { value: 'Asia/Tehran', label: 'Iran Standard Time (IRST)', country: 'IR', offset: 'UTC+03:30' },
];

/**
 * Get timezone suggestions based on country code
 */
export function getTimezonesForCountry(countryCode: string): TimezoneInfo[] {
  const countryTimezones = TIMEZONES.filter(tz => tz.country === countryCode);
  const otherTimezones = TIMEZONES.filter(tz => tz.country !== countryCode);
  
  return [...countryTimezones, ...otherTimezones];
}

/**
 * Get popular timezones (most commonly used)
 */
export function getPopularTimezones(): TimezoneInfo[] {
  return TIMEZONES.filter(tz => tz.popular);
}

/**
 * Get default timezone based on country and postal code
 */
export function getDefaultTimezone(countryCode?: string, postalCode?: string): string {
  // India - always IST regardless of location
  if (countryCode === 'IN') {
    return 'Asia/Kolkata';
  }
  
  // USA - determine based on postal code if available
  if (countryCode === 'US' && postalCode) {
    const zip = parseInt(postalCode);
    if (zip >= 10001 && zip <= 19999) return 'America/New_York'; // NY area
    if (zip >= 20001 && zip <= 39999) return 'America/New_York'; // Eastern
    if (zip >= 40001 && zip <= 69999) return 'America/Chicago'; // Central
    if (zip >= 70001 && zip <= 89999) return 'America/Denver'; // Mountain
    if (zip >= 90001 && zip <= 99999) return 'America/Los_Angeles'; // Pacific
    return 'America/New_York'; // Default to Eastern
  }
  
  // UK
  if (countryCode === 'GB') {
    return 'Europe/London';
  }
  
  // Australia
  if (countryCode === 'AU') {
    return 'Australia/Sydney';
  }
  
  // Canada
  if (countryCode === 'CA') {
    return 'America/Toronto';
  }
  
  // Default to browser timezone or UTC
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Format timezone for display with current time
 */
export function formatTimezoneWithTime(timezone: string): string {
  try {
    const now = new Date();
    const timeInZone = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const timezoneInfo = TIMEZONES.find(tz => tz.value === timezone);
    const label = timezoneInfo?.label || timezone;
    
    return `${label} (${timeInZone})`;
  } catch {
    return timezone;
  }
}

/**
 * Get timezone offset string
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.round((Math.abs(offset) - hours) * 60);
    
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    const timezoneInfo = TIMEZONES.find(tz => tz.value === timezone);
    return timezoneInfo?.offset || 'UTC+00:00';
  }
}

/**
 * Validate if timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
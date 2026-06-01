/**
 * Per-environment config for the Ataraxia frontend hosting (S3 + CloudFront + WAF).
 *
 * REGION: hosting is **India (ap-south-1)** — the S3 origin bucket lives there.
 * CloudFront is a *global* service (serves India from Mumbai/Chennai edge POPs).
 * AWS forces the CloudFront WAF WebACL + ACM cert into **us-east-1** (control-plane
 * config, NOT user data → no residency impact); a small edge stack handles those.
 *
 * LIFT-AND-SHIFT / MULTI-ACCOUNT: nothing here is account-specific. The AWS account
 * comes from the deploy credentials (`CDK_DEFAULT_ACCOUNT`), so the same code deploys
 * to any account — run with that account's creds and `-c environment=<env>`.
 */

export interface FrontendEnvConfig {
  environment: string;
  /** Hosting region — India. S3 origin bucket + CloudFront stack. */
  region: 'ap-south-1';
  /** Forced by AWS for CloudFront WAF + ACM. Do not change. */
  edgeRegion: 'us-east-1';
  /** Optional custom domain. If unset, use the CloudFront *.cloudfront.net domain. */
  domainName?: string;
  /** ACM cert ARN (us-east-1) for the custom domain. Provide when domainName is set. */
  certificateArn?: string;
  /** WAF rate-based rule: max requests per IP per 5 min before block. */
  wafRateLimitPer5Min: number;
  /** Optional geo allow-list (ISO country codes). Empty = allow all. e.g. ['IN']. */
  allowedCountries: string[];
}

const base = {
  region: 'ap-south-1',
  edgeRegion: 'us-east-1',
  wafRateLimitPer5Min: 2000,
  allowedCountries: [] as string[],
} as const;

const CONFIGS: Record<string, FrontendEnvConfig> = {
  dev:     { ...base, environment: 'dev',     wafRateLimitPer5Min: 5000 },
  staging: { ...base, environment: 'staging' },
  prod:    { ...base, environment: 'prod' /*, domainName, certificateArn, allowedCountries: ['IN'] */ },
};

export function getFrontendConfig(environment: string): FrontendEnvConfig {
  const cfg = CONFIGS[environment];
  if (!cfg) throw new Error(`Unknown environment '${environment}'. Use one of: ${Object.keys(CONFIGS).join(', ')}`);
  return cfg;
}

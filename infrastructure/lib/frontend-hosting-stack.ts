import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as path from 'path';
import type { FrontendEnvConfig } from '../config/environment';

export interface FrontendHostingStackProps extends cdk.StackProps {
  config: FrontendEnvConfig;
  /** WAF WebACL ARN from the us-east-1 edge stack (cross-region reference). */
  webAclArn: string;
}

/**
 * Ataraxia frontend hosting — **India (ap-south-1)**.
 *  - S3 origin bucket (private, OAC only) in ap-south-1
 *  - CloudFront (global; serves India via Mumbai/Chennai edges), TLS1.2+, HTTP/2/3,
 *    security headers, SPA routing, attached to the us-east-1 WAF WebACL.
 * Account = deploy creds (lift-and-shift to any AWS account).
 */
export class FrontendHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendHostingStackProps) {
    super(scope, id, props);
    const { config, webAclArn } = props;
    const prefix = `telehealth-${config.environment}-frontend`;

    // ── S3: private origin bucket in India (no public access; CloudFront OAC only) ──
    const bucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: config.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: config.environment !== 'prod',
    });

    // ── Security headers (real response headers; CSP also enforced here) ───────────
    const headers = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      responseHeadersPolicyName: `${prefix}-security-headers`,
      securityHeadersBehavior: {
        strictTransportSecurity: { accessControlMaxAge: cdk.Duration.days(730), includeSubdomains: true, preload: true, override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
        contentSecurityPolicy: {
          override: true,
          contentSecurityPolicy:
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; " +
            "font-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; " +
            "connect-src 'self' https://*.execute-api.ap-south-1.amazonaws.com https://cognito-idp.ap-south-1.amazonaws.com " +
            "https://*.auth.ap-south-1.amazoncognito.com wss://*.livekit.cloud https://*.livekit.cloud " +
            "https://api.pwnedpasswords.com https://api.zippopotam.us https://api.postalpincode.in;",
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          { header: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(), payment=(self)', override: true },
        ],
      },
    });

    const useCustomDomain = !!(config.domainName && config.certificateArn);

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `${prefix} (Ataraxia web — India)`,
      defaultRootObject: 'index.html',
      webAclId: webAclArn, // us-east-1 WebACL ARN (cross-region)
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL, // includes India edges
      ...(useCustomDomain
        ? { domainNames: [config.domainName!], certificate: acm.Certificate.fromCertificateArn(this, 'Cert', config.certificateArn!) }
        : {}),
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        responseHeadersPolicy: headers,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: cdk.Duration.minutes(5) },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: cdk.Duration.minutes(5) },
      ],
    });

    // Deploy the built SPA → S3 + invalidate the shell (hashed assets are immutable)
    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../build'))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/index.html'],
      prune: true,
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', { value: `https://${distribution.distributionDomainName}` });
    new cdk.CfnOutput(this, 'AppURL', { value: useCustomDomain ? `https://${config.domainName}` : `https://${distribution.distributionDomainName}` });
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });

    cdk.Tags.of(this).add('Project', 'Telehealth');
    cdk.Tags.of(this).add('Service', 'ataraxia-frontend');
    cdk.Tags.of(this).add('Environment', config.environment);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}

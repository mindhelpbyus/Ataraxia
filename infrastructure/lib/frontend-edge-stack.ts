import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import type { FrontendEnvConfig } from '../config/environment';

export interface FrontendEdgeStackProps extends cdk.StackProps {
  config: FrontendEnvConfig;
}

/**
 * Edge resources that AWS forces into us-east-1 for CloudFront:
 *  - WAFv2 WebACL (scope CLOUDFRONT)
 * (ACM cert for a custom domain also belongs here; add when a domain is configured.)
 *
 * The hosting stack (ap-south-1) references `webAclArn` via CDK cross-region refs.
 * These are control-plane config, not user data — no India-residency concern.
 */
export class FrontendEdgeStack extends cdk.Stack {
  public readonly webAclArn: string;

  constructor(scope: Construct, id: string, props: FrontendEdgeStackProps) {
    super(scope, id, props);
    const { config } = props;
    const prefix = `telehealth-${config.environment}-frontend`;

    const webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
      name: `${prefix}-waf`,
      scope: 'CLOUDFRONT',
      defaultAction: { allow: {} },
      visibilityConfig: { sampledRequestsEnabled: true, cloudWatchMetricsEnabled: true, metricName: `${prefix}-waf` },
      rules: [
        managed('AWS-AWSManagedRulesCommonRuleSet', 'AWSManagedRulesCommonRuleSet', 1),
        managed('AWS-AWSManagedRulesKnownBadInputsRuleSet', 'AWSManagedRulesKnownBadInputsRuleSet', 2),
        managed('AWS-AWSManagedRulesSQLiRuleSet', 'AWSManagedRulesSQLiRuleSet', 3),
        managed('AWS-AWSManagedRulesAmazonIpReputationList', 'AWSManagedRulesAmazonIpReputationList', 4),
        {
          name: 'RateLimitPerIP',
          priority: 5,
          action: { block: {} },
          statement: { rateBasedStatement: { limit: config.wafRateLimitPer5Min, aggregateKeyType: 'IP' } },
          visibilityConfig: { sampledRequestsEnabled: true, cloudWatchMetricsEnabled: true, metricName: `${prefix}-ratelimit` },
        },
        ...(config.allowedCountries.length
          ? [{
              name: 'GeoAllowList',
              priority: 6,
              action: { block: {} },
              statement: { notStatement: { statement: { geoMatchStatement: { countryCodes: config.allowedCountries } } } },
              visibilityConfig: { sampledRequestsEnabled: true, cloudWatchMetricsEnabled: true, metricName: `${prefix}-geo` },
            }]
          : []),
      ],
    });

    this.webAclArn = webAcl.attrArn;
    new cdk.CfnOutput(this, 'WebAclArn', { value: this.webAclArn });
  }
}

/** AWS managed-rule-group helper (none override = enforce, not count). */
function managed(name: string, ruleName: string, priority: number): wafv2.CfnWebACL.RuleProperty {
  return {
    name,
    priority,
    overrideAction: { none: {} },
    statement: { managedRuleGroupStatement: { vendorName: 'AWS', name: ruleName } },
    visibilityConfig: { sampledRequestsEnabled: true, cloudWatchMetricsEnabled: true, metricName: name },
  };
}

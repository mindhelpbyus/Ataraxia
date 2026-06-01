#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendEdgeStack } from '../lib/frontend-edge-stack';
import { FrontendHostingStack } from '../lib/frontend-hosting-stack';
import { getFrontendConfig } from '../config/environment';

const app = new cdk.App();

// Environment from context (`-c environment=dev|staging|prod`) or env var; default dev.
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';
const config = getFrontendConfig(environment);

// Account from deploy credentials → lift-and-shift to ANY AWS account, no hardcoding.
const account = process.env.CDK_DEFAULT_ACCOUNT;
const prefix = `telehealth-${environment}-frontend`;

// Edge stack: WAF (+cert) — forced to us-east-1 by CloudFront.
const edge = new FrontendEdgeStack(app, `${prefix}-edge`, {
  env: { account, region: config.edgeRegion },
  crossRegionReferences: true,
  description: `Ataraxia frontend edge (WAF) — ${environment}`,
  config,
});

// Hosting stack: S3 + CloudFront in India (ap-south-1), references the us-east-1 WAF.
const hosting = new FrontendHostingStack(app, `${prefix}-hosting`, {
  env: { account, region: config.region },
  crossRegionReferences: true,
  description: `Ataraxia frontend hosting (S3+CloudFront, India) — ${environment}`,
  config,
  webAclArn: edge.webAclArn,
});
hosting.addDependency(edge);

app.synth();

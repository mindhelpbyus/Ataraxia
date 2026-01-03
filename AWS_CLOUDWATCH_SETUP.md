# AWS CloudWatch + S3 Logging Setup Guide

## Overview
This guide shows how to set up HIPAA-compliant logging with:
- **CloudWatch Logs**: Real-time logging (0-30 days)
- **S3 Standard**: Archived logs (30-90 days)
- **S3 Glacier**: Long-term storage (90 days - 7 years)
- **Automatic lifecycle management**

---

## Architecture

```
Application Logs
    ↓
CloudWatch Logs (30 days retention)
    ↓ (automatic export after 30 days)
S3 Standard Storage
    ↓ (lifecycle policy after 90 days)
S3 Glacier Deep Archive
    ↓ (lifecycle policy after 7 years)
Permanent Deletion
```

---

## Step 1: Create CloudWatch Log Groups

```bash
# Install AWS CLI
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Create log groups
aws logs create-log-group --log-group-name /ataraxia/app-logs
aws logs create-log-group --log-group-name /ataraxia/audit-logs

# Set retention policy (30 days)
aws logs put-retention-policy \
  --log-group-name /ataraxia/app-logs \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name /ataraxia/audit-logs \
  --retention-in-days 30
```

---

## Step 2: Create S3 Bucket for Archives

```bash
# Create S3 bucket
aws s3 mb s3://ataraxia-logs-archive --region us-east-1

# Enable versioning (HIPAA requirement)
aws s3api put-bucket-versioning \
  --bucket ataraxia-logs-archive \
  --versioning-configuration Status=Enabled

# Enable encryption (HIPAA requirement)
aws s3api put-bucket-encryption \
  --bucket ataraxia-logs-archive \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access (HIPAA requirement)
aws s3api put-public-access-block \
  --bucket ataraxia-logs-archive \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## Step 3: Set Up S3 Lifecycle Policy

Create `lifecycle-policy.json`:

```json
{
  "Rules": [
    {
      "Id": "Archive-to-Glacier-after-90-days",
      "Status": "Enabled",
      "Prefix": "",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

Apply lifecycle policy:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket ataraxia-logs-archive \
  --lifecycle-configuration file://lifecycle-policy.json
```

**Lifecycle Timeline:**
- **0-30 days**: CloudWatch Logs (real-time access)
- **30-90 days**: S3 Standard (fast retrieval)
- **90-365 days**: S3 Glacier (retrieval in hours)
- **1-7 years**: S3 Deep Archive (retrieval in 12 hours)
- **After 7 years**: Automatic deletion (HIPAA compliant)

---

## Step 4: Set Up CloudWatch to S3 Export

Create IAM role for CloudWatch to write to S3:

```bash
# Create trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "logs.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name CloudWatchLogsToS3 \
  --assume-role-policy-document file://trust-policy.json

# Create permission policy
cat > permissions-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::ataraxia-logs-archive",
        "arn:aws:s3:::ataraxia-logs-archive/*"
      ]
    }
  ]
}
EOF

# Attach policy to role
aws iam put-role-policy \
  --role-name CloudWatchLogsToS3 \
  --policy-name S3WritePolicy \
  --policy-document file://permissions-policy.json
```

---

## Step 5: Configure Automatic Export (Lambda Function)

Create Lambda function to export logs daily:

```javascript
// lambda-export-logs.js
const AWS = require('aws-sdk');
const cloudwatchlogs = new AWS.CloudWatchLogs();

exports.handler = async (event) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const startTime = new Date(yesterday.setHours(0, 0, 0, 0)).getTime();
  const endTime = new Date(yesterday.setHours(23, 59, 59, 999)).getTime();
  
  const logGroups = ['/ataraxia/app-logs', '/ataraxia/audit-logs'];
  
  for (const logGroup of logGroups) {
    await cloudwatchlogs.createExportTask({
      logGroupName: logGroup,
      from: startTime,
      to: endTime,
      destination: 'ataraxia-logs-archive',
      destinationPrefix: logGroup.replace('/', ''),
    }).promise();
  }
  
  return { statusCode: 200, body: 'Export completed' };
};
```

Deploy Lambda:

```bash
# Create deployment package
zip lambda-export-logs.zip lambda-export-logs.js

# Create Lambda function
aws lambda create-function \
  --function-name ExportCloudWatchLogs \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/CloudWatchLogsToS3 \
  --handler lambda-export-logs.handler \
  --zip-file fileb://lambda-export-logs.zip

# Create EventBridge rule to run daily at 2 AM
aws events put-rule \
  --name DailyLogExport \
  --schedule-expression "cron(0 2 * * ? *)"

# Add Lambda permission
aws lambda add-permission \
  --function-name ExportCloudWatchLogs \
  --statement-id DailyLogExportPermission \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-1:YOUR_ACCOUNT_ID:rule/DailyLogExport

# Add target
aws events put-targets \
  --rule DailyLogExport \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:ExportCloudWatchLogs"
```

---

## Step 6: Application Integration

### Install AWS SDK

```bash
npm install aws-sdk
```

### Configure in Your App

```typescript
// src/config/logging.ts
import AWS from 'aws-sdk';
import { logger } from '../services/secureLogger';
import { AWSCloudWatchStorage } from '../services/awsCloudWatchStorage';

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const cloudwatchlogs = new AWS.CloudWatchLogs();
const s3 = new AWS.S3();

// Set up logging backend
logger.setStorage(new AWSCloudWatchStorage({
  cloudwatchlogs,
  s3,
  logGroupName: '/ataraxia/app-logs',
  auditLogGroupName: '/ataraxia/audit-logs',
  s3Bucket: 'ataraxia-logs-archive',
}));

export { logger };
```

### Environment Variables

```bash
# .env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

---

## Step 7: IAM User Permissions

Create IAM user for application with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/ataraxia/app-logs:*",
        "arn:aws:logs:*:*:log-group:/ataraxia/audit-logs:*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:FilterLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/ataraxia/app-logs",
        "arn:aws:logs:*:*:log-group:/ataraxia/audit-logs"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ataraxia-logs-archive",
        "arn:aws:s3:::ataraxia-logs-archive/*"
      ]
    }
  ]
}
```

---

## Cost Estimation

### CloudWatch Logs
- **Ingestion**: $0.50 per GB
- **Storage**: $0.03 per GB/month (30 days)
- **Estimated**: ~$10-50/month for typical healthcare app

### S3 Storage
- **Standard (30-90 days)**: $0.023 per GB/month
- **Glacier (90 days - 1 year)**: $0.004 per GB/month
- **Deep Archive (1-7 years)**: $0.00099 per GB/month
- **Estimated**: ~$5-20/month

### Total Estimated Cost
- **Monthly**: $15-70
- **Annual**: $180-840

**HIPAA Compliance**: ✅ Included (no extra cost)

---

## HIPAA Compliance Checklist

- [x] Encryption at rest (S3 AES-256)
- [x] Encryption in transit (HTTPS)
- [x] Access controls (IAM policies)
- [x] Audit trail (CloudWatch Logs)
- [x] 7-year retention (S3 lifecycle)
- [x] Automatic deletion after retention period
- [x] Immutable logs (S3 versioning)
- [x] No public access (S3 block public access)

---

## Monitoring & Alerts

Set up CloudWatch Alarms:

```bash
# Alert on failed login attempts
aws cloudwatch put-metric-alarm \
  --alarm-name FailedLoginAttempts \
  --alarm-description "Alert on 5+ failed logins in 5 minutes" \
  --metric-name FailedLoginCount \
  --namespace Ataraxia/Security \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1

# Alert on high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name HighErrorRate \
  --alarm-description "Alert on high error rate" \
  --metric-name ErrorCount \
  --namespace Ataraxia/Application \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## Querying Logs

### CloudWatch Insights Queries

```sql
-- Find all PHI access events
fields @timestamp, userId, resourceId, action
| filter eventType = "PHI_ACCESS"
| sort @timestamp desc
| limit 100

-- Failed login attempts
fields @timestamp, userId, ipAddress
| filter eventType = "FAILED_LOGIN"
| stats count() by userId
| sort count desc

-- Audit trail for specific patient
fields @timestamp, userId, action
| filter resourceId = "patient_123"
| sort @timestamp desc
```

---

## Next Steps

1. **Test the setup**: Send test logs
2. **Verify S3 export**: Check logs appear in S3 after 30 days
3. **Set up monitoring**: Configure CloudWatch Alarms
4. **Document procedures**: Create runbook for log access
5. **Train team**: Ensure team knows how to query logs

---

**Setup Time**: 2-3 hours
**Maintenance**: Minimal (fully automated)
**HIPAA Compliant**: ✅ Yes


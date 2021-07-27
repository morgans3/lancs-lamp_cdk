#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { CdkStack } from "../lib/cdk-stack";
import { _SETTINGS } from "../lib/config";
import { BucketStack } from "../lib/cdk-bucketstack";
import { DynamoDBTable } from "../lib/cdk-dynamodb";
import { SecretsStack } from "../lib/cdk-secrets";
import { _FUNCTIONS } from "../lib/functions";
import { InfrastructureStack } from "../lib/cdk-infrastructure";
import { SPAPipelines } from "../lib/cdk-spapipeline";
import { RDSStack } from "../lib/cdk-rdsstack";

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const buckets: { name: string; stack: BucketStack }[] = [];
_SETTINGS.config.bucketnames.forEach((bucket: string) => {
  const buck = new BucketStack(app, "CDKBuckets" + bucket, { env: env, functions: _FUNCTIONS, bucket: bucket });
  buckets.push({ name: bucket, stack: buck });
});

const dynamotables: { name: string; stack: DynamoDBTable }[] = [];
_SETTINGS.config.dynamodbtables.forEach((table: any) => {
  const tb = new DynamoDBTable(app, "CDKDynamoDBTable" + table.name, { env: env, tab: table, name: table.name });
  dynamotables.push({ name: table.name, stack: tb });
});

const infrastructure = new InfrastructureStack(app, "InfrastructureStack", { env });
const spa = _SETTINGS.config.spa_app;
const frontend = new SPAPipelines(app, "SPAPipelines-" + spa.name, {
  env: env,
  domainName: spa.domainName,
  siteSubDomain: spa.siteSubDomain,
  application: spa,
});

const rds = new RDSStack(app, "RDSStack", {
  env,
  infrastructure,
});
const secrets = new SecretsStack(app, "SecretsStack", { env, rds });

new CdkStack(app, "CdkStack", {
  env,
  secrets,
  infrastructure,
});

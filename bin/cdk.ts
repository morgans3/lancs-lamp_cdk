#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CdkStack } from "../lib/cdk-stack";
import { _SETTINGS } from "../lib/config";
import { BucketStack } from "../lib/cdk-bucketstack";
import { DynamoDBTable } from "../lib/cdk-dynamodb";

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const buckets: { name: string; stack: BucketStack }[] = [];
_SETTINGS.config.bucketnames.forEach((bucket: string) => {
  const buck = new BucketStack(app, "CDKBuckets" + bucket, { env: env, settings: _SETTINGS, bucket: bucket });
  buckets.push({ name: bucket, stack: buck });
});

const dynamotables: { name: string; stack: DynamoDBTable }[] = [];
_SETTINGS.config.dynamodbtables.forEach((table: any) => {
  const tb = new DynamoDBTable(app, "CDKDynamoDBTable" + table.name, { env: env, settings: _SETTINGS, tab: table, name: table.name });
  dynamotables.push({ name: table.name, stack: tb });
});

new CdkStack(app, "CdkStack", {
  env,
  buckets,
});

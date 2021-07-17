#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CdkStack } from "../lib/cdk-stack";
import { _SETTINGS } from "../lib/config";
import { BucketStack } from "../lib/cdk-bucketstack";

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const buckets: { name: string; stack: BucketStack }[] = [];
_SETTINGS.config.bucketnames.forEach((bucket: string) => {
  const buck = new BucketStack(app, "CDKBuckets", { env: env, settings: _SETTINGS, bucket: bucket });
  buckets.push({ name: bucket, stack: buck });
});

new CdkStack(app, "CdkStack", {
  env,
  buckets,
});

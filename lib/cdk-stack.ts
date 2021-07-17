import * as cdk from "@aws-cdk/core";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: any) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // # AWS Secrets Manager
    // - store bucketname in Secret
  }
}

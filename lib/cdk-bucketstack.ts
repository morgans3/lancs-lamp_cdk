import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

export class BucketStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: any) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Storage_Bucket-" + props.bucket, {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: new s3.BlockPublicAccess({ blockPublicAcls: true, blockPublicPolicy: true, ignorePublicAcls: true, restrictPublicBuckets: true }),
      bucketName: props.functions.cleanseBucketName(props.bucket),
    });

    new cdk.CfnOutput(this, "bucketArn", { value: bucket.bucketArn });
  }
}

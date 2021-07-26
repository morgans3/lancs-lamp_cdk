import * as cdk from "@aws-cdk/core";
import * as ecr from "@aws-cdk/aws-ecr";
import { DefaultContainer } from "./cdk-defaultcontainer";
import { ECSCluster } from "./cdk-ecscluster";
import { CDKPipeline } from "./cdk-pipeline";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import { CDKLoadBalancer } from "./cdk-loadbalancer";
import * as acm from "@aws-cdk/aws-certificatemanager";
import route53 = require("@aws-cdk/aws-route53");

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: any) {
    super(scope, id, props);

    const repo = new ecr.Repository(this, "API-ECR-Repo", { repositoryName: props.settings.config.api_app.name });
    repo.addLifecycleRule({ tagPrefixList: ["dev"], maxImageCount: 99 });
    repo.addLifecycleRule({ tagPrefixList: ["main"], maxImageCount: 99 });
    repo.addLifecycleRule({ maxImageAge: cdk.Duration.days(30) });
    const statement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      sid: "Dev Access",
      principals: [new iam.ArnPrincipal("arn:aws:iam::" + process.env.CDK_DEFAULT_ACCOUNT + ":role/ecsTaskExecutionRole")],
      actions: ["ecr:BatchCheckLayerAvailability", "ecr:BatchGetImage", "ecr:DescribeImages", "ecr:DescribeRepositories", "ecr:GetDownloadUrlForLayer", "ecr:GetLifecyclePolicy", "ecr:GetLifecyclePolicyPreview", "ecr:GetRepositoryPolicy", "ecr:InitiateLayerUpload", "ecr:ListImages"],
    });
    repo.addToResourcePolicy(statement);
    const pipeline = new CDKPipeline(this, "API-Pipeline", { secrets: props.secrets });

    const capacity = {
      min: 0,
      max: 2,
      desired: 1,
      startHour: null,
      stopHour: null,
    };
    const ecscluster = new ECSCluster(this, "API-ECSCluster", { name: "API-ECS-Cluster", infrastructure: props.infrastructure, capacity });
    const secGroup = new ec2.SecurityGroup(this, "secGroup", {
      vpc: props.infrastructure.vpc,
      securityGroupName: "SG-LANCSLAMP-LB-" + props.settings.config.api_app.branch,
      description: "HTTP/S Access to ECS",
      allowAllOutbound: true,
    });
    secGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcpRange(80, 8100), "Container Port Range");
    const defaultcontainer = new DefaultContainer(this, "API-DefaultContainer", {
      secGroup: secGroup,
      repo: repo,
      cluster: ecscluster.cluster,
      values: props.settings.config.api_app,
    });
    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName: props.domainName });
    const siteDomain = "api." + props.domainName;
    const certificateArn = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
      domainName: siteDomain,
      hostedZone: zone,
      region: process.env.CDK_DEFAULT_REGION,
    });
    const publicsubnets = props.infrastructure.vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC });
    const loadbalancer = new CDKLoadBalancer(this, "ECS-LoadBalancer", { infrastructure: props.infrastructure, defaultcontainer, secGroup, branch: "main", subnets: publicsubnets, cert: certificateArn });
  }
}

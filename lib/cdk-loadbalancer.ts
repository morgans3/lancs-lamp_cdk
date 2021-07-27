import * as cdk from "@aws-cdk/core";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as wafv2 from "@aws-cdk/aws-wafv2";
import { LoadBalancerStackProps } from "../_models/models";

export class CDKLoadBalancer extends cdk.Construct {
  public readonly loadbalancer: elbv2.ApplicationLoadBalancer;
  public readonly loadbalancer443: elbv2.ApplicationListener;
  public readonly defaultTargetGroup: elbv2.ApplicationTargetGroup;

  constructor(scope: any, id: string, props: LoadBalancerStackProps) {
    super(scope, id);

    this.loadbalancer = new elbv2.ApplicationLoadBalancer(this, "LANCSLAMP-ALB" + props.branch, {
      vpc: props.infrastructure.vpc,
      deletionProtection: true,
      internetFacing: true,
      loadBalancerName: "lancslamp-alb-" + props.branch,
      securityGroup: props.secGroup,
      vpcSubnets: props.subnets,
      idleTimeout: cdk.Duration.seconds(900),
    });

    const cert = props.cert;
    const defaultContainer = props.defaultcontainer;

    this.defaultTargetGroup = new elbv2.ApplicationTargetGroup(this, "defaultTargetGroup", {
      targetGroupName: "nexus",
      vpc: props.infrastructure.vpc,
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80, // props.values.port
      targets: [defaultContainer.service],
    });
    this.loadbalancer443 = this.loadbalancer.addListener("443-Listener", {
      protocol: elbv2.ApplicationProtocol.HTTPS,
      port: 443,
      certificates: [cert],
      sslPolicy: elbv2.SslPolicy.RECOMMENDED,
      defaultAction: elbv2.ListenerAction.forward([this.defaultTargetGroup]),
    });

    this.loadbalancer.addListener("80-Listener", {
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        permanent: true,
        protocol: elbv2.ApplicationProtocol.HTTPS,
        port: "443",
      }),
    });

    const waf = new wafv2.CfnWebACL(this, "waf", {
      name: "LANCSLAMP-ALB-WAF",
      description: "ACL for LANCS LAMP ALB",
      scope: "REGIONAL",
      defaultAction: { allow: {} },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "tnc-firewall",
      },
      rules: [
        {
          name: "GeoMatch",
          priority: 0,
          action: {
            block: {},
          },
          statement: {
            notStatement: {
              statement: {
                geoMatchStatement: {
                  countryCodes: ["GB"],
                },
              },
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "GeoMatch",
          },
        },
        {
          name: "LimitRequests100",
          priority: 2,
          action: {
            block: {},
          },
          statement: {
            rateBasedStatement: {
              limit: 5000,
              aggregateKeyType: "IP",
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "LimitRequests100",
          },
        },
      ],
    });
    const wafAssoc = new wafv2.CfnWebACLAssociation(this, "tnc-waf-assoc", {
      resourceArn: this.loadbalancer.loadBalancerArn,
      webAclArn: waf.attrArn,
    });
    wafAssoc.node.addDependency(this.loadbalancer);

    // Route 53
  }
}

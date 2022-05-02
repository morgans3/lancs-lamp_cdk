import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import { _SETTINGS } from "./config";

export class InfrastructureStack extends cdk.Stack {
  public vpc: ec2.Vpc;
  constructor(scope: any, id: string, props?: any) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "LancsLAMPVPC", {
      cidr: _SETTINGS.config.containerIPs[0],
      subnetConfiguration: [
        { name: "lamplancs-private-0", subnetType: ec2.SubnetType.PRIVATE },
        { name: "lamplancs-private-1", subnetType: ec2.SubnetType.PRIVATE },
        { name: "lamplancs-public-0", subnetType: ec2.SubnetType.PUBLIC },
        { name: "lamplancs-public-1", subnetType: ec2.SubnetType.PUBLIC },
      ],
    });
  }
}

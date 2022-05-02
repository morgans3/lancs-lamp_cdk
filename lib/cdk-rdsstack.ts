import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import { Duration } from "@aws-cdk/core";
import { RDSStackProps } from "../_models/models";
import { _SETTINGS } from "./config";

export class RDSStack extends cdk.Stack {
  public dbInstance: rds.DatabaseInstance;

  constructor(scope: cdk.App, id: string, props: RDSStackProps) {
    super(scope, id, props);

    const vpc = props.infrastructure.vpc;
    const secGroup = new ec2.SecurityGroup(this, "RDSSecurityGroup", {
      securityGroupName: "SG-Postgres-LL-DB",
      description: "Security Group for RDS Postgresql Instance supporting the Lancs LAMP Database",
      vpc: vpc,
    });
    _SETTINGS.config.containerIPs.forEach((range: string) => {
      secGroup.addIngressRule(ec2.Peer.ipv4(range), ec2.Port.tcp(5432), "Access from Containers");
    });

    const subnetgroup = new rds.SubnetGroup(this, "RDSSubnetGroup", {
      description: "Subnet Group for RDS Instance, managed by CDK_RDS",
      vpc,
      subnetGroupName: "RDS-Instance-LL-SUBG",
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
    });
    this.dbInstance = new rds.DatabaseInstance(this, "RDSInstance", {
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
      instanceType: _SETTINGS.config.instanceType,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      deleteAutomatedBackups: true,
      publiclyAccessible: false,
      securityGroups: [secGroup],
      multiAz: true,
      subnetGroup: subnetgroup,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_3,
      }),
      // @ts-ignore
      backupRetention: Duration.days(2),
      storageEncrypted: true,
      port: 5432,
      credentials: rds.Credentials.fromGeneratedSecret("postgres"),
      deletionProtection: _SETTINGS.config.isProduction,
      databaseName: "lamps_lanc",
      maxAllocatedStorage: 100,
      allocatedStorage: 20,
    });

    new cdk.CfnOutput(this, "dbEndpoint", { value: this.dbInstance.dbInstanceEndpointAddress });
  }
}

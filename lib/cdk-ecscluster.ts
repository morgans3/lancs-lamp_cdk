// @ts-check

import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import * as ecs from "@aws-cdk/aws-ecs";
import * as asg from "@aws-cdk/aws-autoscaling";
import { _SETTINGS } from "./config";

export class ECSCluster extends cdk.Construct {
  public readonly cluster: ecs.Cluster;
  constructor(scope: cdk.Construct, id: string, props: any) {
    super(scope, id);
    const vpc: ec2.Vpc = props.infrastructure.vpc;
    this.cluster = new ecs.Cluster(this, "ECS-LANCSLAMPS-" + props.name, {
      vpc: vpc,
      clusterName: "ECS-LANCSLAMPS-" + props.name,
    });

    const capacity = this.cluster.addCapacity("ASG-LANCSLAMPS-" + props.name, {
      instanceType: _SETTINGS.config.instanceType,
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      associatePublicIpAddress: false,
      minCapacity: props.capacity.min,
      maxCapacity: props.capacity.max,
      desiredCapacity: props.capacity.desired,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
      autoScalingGroupName: "ASG-DIU-" + props.name,
    });

    if (_SETTINGS.config.isProduction === false) {
      const starthour = props.capacity.startHour || "8";
      const stophour = props.capacity.stopHour || "18";
      capacity.scaleOnSchedule(props.name + "-PowerOn", {
        minCapacity: props.capacity.min,
        maxCapacity: props.capacity.max,
        desiredCapacity: props.capacity.desired,
        schedule: asg.Schedule.cron({ hour: starthour, minute: "0" }),
      });
      capacity.scaleOnSchedule(props.name + "-PowerOff", {
        minCapacity: 0,
        maxCapacity: 0,
        desiredCapacity: 0,
        schedule: asg.Schedule.cron({ hour: stophour, minute: "0" }),
      });
      capacity.scaleOnSchedule(props.name + "-PowerOff-Saturday", {
        minCapacity: 0,
        maxCapacity: 0,
        desiredCapacity: 0,
        schedule: asg.Schedule.cron({ hour: starthour, minute: "15", weekDay: "Sat" }),
      });
      capacity.scaleOnSchedule(props.name + "-PowerOff-Sunday", {
        minCapacity: 0,
        maxCapacity: 0,
        desiredCapacity: 0,
        schedule: asg.Schedule.cron({ hour: starthour, minute: "15", weekDay: "Sun" }),
      });
    }
  }
}

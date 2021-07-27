import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
import { Duration } from "@aws-cdk/core";
import { DefaultContainerProps } from "../_models/models";

export class DefaultContainer extends cdk.Construct {
  public readonly service: ecs.Ec2Service;

  constructor(scope: cdk.Construct, id: string, props: DefaultContainerProps) {
    super(scope, id);

    const repo = props.repo;
    const inboundlogging = new ecs.AwsLogDriver({
      streamPrefix: props.values.name,
    });
    const taskDef = new ecs.Ec2TaskDefinition(this, props.values.name + "-TaskDef", {
      networkMode: ecs.NetworkMode.AWS_VPC,
    });
    const container = taskDef.addContainer(props.values.name, {
      image: ecs.ContainerImage.fromEcrRepository(repo, props.values.branch),
      logging: inboundlogging,
      essential: true,
      privileged: true,
      memoryLimitMiB: props.values.memory,
      cpu: props.values.cpu,
    });
    container.addPortMappings({ containerPort: parseInt(props.values.port), hostPort: parseInt(props.values.port), protocol: ecs.Protocol.TCP });

    const desiredCount = props.values.desired || 0;
    this.service = new ecs.Ec2Service(this, props.values.name + "-Service", {
      cluster: props.cluster,
      taskDefinition: taskDef,
      assignPublicIp: false,
      desiredCount: desiredCount,
      minHealthyPercent: 50,
      securityGroups: [props.secGroup],
      serviceName: props.values.name,
    });
    const inboundscaling = this.service.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 4 });
    inboundscaling.scaleOnCpuUtilization(props.values.name + "-CpuScaling", {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60),
    });
  }
}

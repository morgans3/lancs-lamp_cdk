//@ts-check
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import dynamodb = require("@aws-cdk/aws-dynamodb");
import { StackProps } from "@aws-cdk/core";
import { RDSStack } from "../lib/cdk-rdsstack";
import { InfrastructureStack } from "../lib/cdk-infrastructure";
import { SecretsStack } from "../lib/cdk-secrets";
import * as acm from "@aws-cdk/aws-certificatemanager";
import { DefaultContainer } from "../lib/cdk-defaultcontainer";
import * as ecr from "@aws-cdk/aws-ecr";

export interface GlobalConfig {
  config: {
    isProduction: boolean;
    domainName: string;
    bucketnames: string[];
    dynamodbtables: DynamoDBConfig[];
    spa_app: AppSettings;
    api_app: AppSettings;
    containerIPs: string[];
    instanceType: ec2.InstanceType;
  };
  dockerhub: {
    username: string;
    password: string;
  };
}

export interface LocalSettings {
  dockerhub: {
    username: string;
    password: string;
  };
  mydomain: string;
}

export interface AppSettings {
  name: string;
  domainName: string;
  siteSubDomain: string;
  owner: string;
  githubrepo: string;
  repo: string;
  branch: string;
  port: string;
  cpu?: number;
  memory?: number;
  desired?: number;
}

export interface DynamoDBConfig {
  name: string;
  fields: dynamodbfield[];
}

interface dynamodbfield {
  name: string;
  type: dynamodb.AttributeType;
  key: string;
}

export interface BucketStackProps extends StackProps {
  bucket: string;
  functions: any;
}

export interface StaticSiteProps extends StackProps {
  domainName: string;
  siteSubDomain: string;
  application: any;
}

export interface SecretStackProps extends StackProps {
  rds: RDSStack;
}

export interface RDSStackProps extends StackProps {
  infrastructure: InfrastructureStack;
}

export interface PipelineStackProps extends StackProps {
  service: ecs.IBaseService;
  secrets: SecretsStack;
  buildArgs: any;
  application: AppSettings;
}

export interface LoadBalancerStackProps extends StackProps {
  infrastructure: InfrastructureStack;
  defaultcontainer: DefaultContainer;
  secGroup: ec2.SecurityGroup;
  branch: string;
  subnets: ec2.SubnetSelection;
  cert: acm.DnsValidatedCertificate;
}

export interface ECSCluserStackProps extends StackProps {
  infrastructure: InfrastructureStack;
  name: string;
  capacity: {
    min: number;
    max: number;
    desired: number;
    startHour?: string;
    stopHour?: string;
  };
}

export interface DynamoDBStackProps extends StackProps {
  name: string;
  tab: DynamoDBConfig;
}

export interface DefaultContainerProps extends StackProps {
  secGroup: ec2.SecurityGroup;
  repo: ecr.Repository;
  values: AppSettings;
  cluster: ecs.Cluster;
}

export interface CdkStackProps extends StackProps {
  infrastructure: InfrastructureStack;
  secrets: SecretsStack;
}

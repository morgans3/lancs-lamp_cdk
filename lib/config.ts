// @ts-check
import * as ec2 from "@aws-cdk/aws-ec2";
import dynamodb = require("@aws-cdk/aws-dynamodb");
import { _LOCAL } from "./localconfig";
import { AppSettings, DynamoDBConfig, GlobalConfig } from "../_models/models";

const standardbuckets: string[] = ["lancs-lamp-results-landing-" + _LOCAL.mydomain];
const spa_app: AppSettings = {
  name: "lamp_lancs",
  domainName: _LOCAL.mydomain,
  siteSubDomain: "www",
  owner: "morgans3",
  githubrepo: "https://github.com/morgans3/lancs-lamp_frontend.git",
  repo: "lancs-lamp_frontend",
  branch: "main",
  port: "80",
};
const api_app: AppSettings = {
  name: "lamp_lancs_api",
  domainName: _LOCAL.mydomain,
  siteSubDomain: "api",
  owner: "morgans3",
  githubrepo: "https://github.com/morgans3/lancs-lamp_api.git",
  repo: "lancs-lamp_api",
  branch: "main",
  port: "8099",
  cpu: 512,
  memory: 512,
  desired: 2,
};

const standardDynamoTables: DynamoDBConfig[] = [
  {
    name: "users",
    fields: [
      { name: "username", type: dynamodb.AttributeType.STRING, key: "primary" },
      { name: "organisation", type: dynamodb.AttributeType.STRING, key: "secondary" },
    ],
  },
  {
    name: "userroles",
    fields: [
      { name: "username", type: dynamodb.AttributeType.STRING, key: "primary" },
      { name: "roleassignedDT", type: dynamodb.AttributeType.STRING, key: "secondary" },
    ],
  },
  {
    name: "componenttypes",
    fields: [
      { name: "type", type: dynamodb.AttributeType.STRING, key: "primary" },
      { name: "createdDT", type: dynamodb.AttributeType.STRING, key: "secondary" },
    ],
  },
  {
    name: "pathways",
    fields: [
      { name: "test_pathway", type: dynamodb.AttributeType.STRING, key: "primary" },
      { name: "createdDT", type: dynamodb.AttributeType.STRING, key: "secondary" },
    ],
  },
];

export const _SETTINGS: GlobalConfig = {
  config: {
    isProduction: false,
    domainName: _LOCAL.mydomain,
    bucketnames: standardbuckets,
    dynamodbtables: standardDynamoTables,
    spa_app,
    api_app,
    containerIPs: ["10.1.0.0/19"],
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
  },
  dockerhub: _LOCAL.dockerhub,
};

// @ts-check
import * as ec2 from "@aws-cdk/aws-ec2";
import dynamodb = require("@aws-cdk/aws-dynamodb");

// START OF MINIMUM MANUAL CONFIGURATION
// YOUR CONFIGURATION SETTINGS ARE NEEDED HERE
const domain = "stewartmorganv2.com";
const standardbuckets = ["lancs-lamp-results-landing"];
const spa_app = {
  name: "lamp_lancs",
  domainName: domain,
  siteSubDomain: "www",
  owner: "morgans3",
  githubrepo: "https://github.com/morgans3/lancs-lamp_frontend.git",
  repo: "lancs-lamp_frontend",
  branch: "main",
};
const api_app = {
  name: "lamp_lancs",
  domainName: domain,
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
// END OF MINIMUM MANUAL CONFIGURATION

const standardDynamoTables = [
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
];

export const _SETTINGS: any = {
  config: {
    isProduction: false,
    domainName: domain,
    bucketnames: standardbuckets,
    dynamodbtables: standardDynamoTables,
    spa_app,
    api_app,
    containerIPs: ["10.1.0.0/19"],
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
  },
  dockerhub: {
    username: "dockeruser",
    password: "SETYOURACCOUNTHERE", // DO NOT COMMIT TO GIT
  },
};

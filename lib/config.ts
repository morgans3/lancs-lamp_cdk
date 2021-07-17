// @ts-check
import dynamodb = require("@aws-cdk/aws-dynamodb");
const domain = "stewartmorganv2.com";
const standardbuckets = ["lancs-lamp-results-landing"];
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

const DevSettings = {
  isProduction: false,
  domainName: domain,
  envname: "dev",
  branch: "dev",
  bucketnames: standardbuckets,
  dynamodbtables: standardDynamoTables,
};

const ProdSettings = {
  isProduction: true,
  domainName: domain,
  envname: "www",
  branch: "main",
  bucketnames: standardbuckets,
  dynamodbtables: standardDynamoTables,
};

const Applications = [
  {
    name: "api",
    siteSubDomain: "api.",
    owner: "morgans3",
    githubrepo: "https://github.com/morgans3/lancs-lamp_api.git",
    repo: "lancs-lamp_api",
    branch: "main",
  },
  {
    name: "frontend",
    siteSubDomain: "www.",
    owner: "morgans3",
    githubrepo: "https://github.com/morgans3/lancs-lamp_frontend.git",
    repo: "lancs-lamp_frontend",
    branch: "main",
  },
];

export const _SETTINGS: any = {
  config: DevSettings,
  // config: ProdSettings,
  applications: Applications,
};

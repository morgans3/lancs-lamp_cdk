import cdk = require("@aws-cdk/core");
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as rds from "@aws-cdk/aws-rds";
import * as iam from "@aws-cdk/aws-iam";
import { generateSecrets, checkSecretExists } from "../sdk/generateSecrets";
import { _SETTINGS } from "./config";
const crypto = require("crypto");

export class SecretsStack extends cdk.Stack {
  public buildEnvVariables: any;
  public apiuser: AutoUser;
  constructor(scope: any, id: string, props: any) {
    super(scope, id, props);
    const pg: rds.DatabaseInstance = props.rds.dbInstance;
    const pgsecret = pg.secret;
    const pgname = pgsecret?.secretName;

    checkSecretExists("dockerhub", (res: any) => {
      if (!res)
        generateSecrets("dockerhub", "username", "password", _SETTINGS.dockerhub.username, _SETTINGS.dockerhub.password, (result: any) => {
          console.log(result);
        });
    });
    checkSecretExists("jwt", (res: any) => {
      if (!res) {
        const jwtsecret = generatePassword(20, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$");
        const jwtsecretkey = generatePassword(20, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$");
        generateSecrets("jwt", "secret", "secretkey", jwtsecret, jwtsecretkey, (result: any) => {
          console.log(result);
        });
      }
    });

    this.apiuser = new AutoUser(this, "API_User");

    let profile = "Dev";
    if (props.settings.config.isProduction) profile = "Prod";

    this.buildEnvVariables = {
      ["AWSPROFILE"]: { value: profile, type: codebuild.BuildEnvironmentVariableType.PLAINTEXT },
      ["AWSREGION"]: { value: process.env.CDK_DEFAULT_REGION, type: codebuild.BuildEnvironmentVariableType.PLAINTEXT },
      ["PGDATABASE"]: { value: pg.instanceEndpoint, type: codebuild.BuildEnvironmentVariableType.PLAINTEXT },
      ["PGPORT"]: { value: "5432", type: codebuild.BuildEnvironmentVariableType.PLAINTEXT },
      ["POSTGRES_UN"]: { value: pgname + ":username", type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER },
      ["POSTGRES_PW"]: { value: pgname + ":password", type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER },
      ["AWS_SECRETID"]: { value: this.apiuser.accesskey.ref, type: codebuild.BuildEnvironmentVariableType.PLAINTEXT },
      ["AWS_SECRETKEY"]: { value: this.apiuser.accesskey.attrSecretAccessKey, type: codebuild.BuildEnvironmentVariableType.PLAINTEXT },

      ["dockerhub_username"]: { value: "dockerhub:username", type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER },
      ["dockerhub_password"]: { value: "dockerhub:password", type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER },
      ["JWT_SECRET"]: { value: "jwt:secret", type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER },
      ["JWT_SECRETKEY"]: { value: "jwt:secretkey", type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER },
    };
  }
}

export class AutoUser extends cdk.Construct {
  public accesskey: iam.CfnAccessKey;
  public user: iam.User;
  constructor(scope: any, id: string) {
    super(scope, id);
    this.user = new iam.User(this, "APIUser", { userName: "API_User", password: cdk.SecretValue.plainText("1234") });
    const group = new iam.Group(this, "MyGroup", { groupName: "API_Access_Group" });
    group.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"));
    this.accesskey = new iam.CfnAccessKey(this, "AccessKey", {
      userName: this.user.userName,
    });
  }
}

function generatePassword(length: number, wishlist: string) {
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x: any) => wishlist[x % wishlist.length])
    .join("");
}

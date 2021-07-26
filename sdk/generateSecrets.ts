// @ts-check

const AWS = (module.exports.AWS = require("aws-sdk"));
AWS.config.update({
  region: process.env.CDK_DEFAULT_REGION,
});
let access = process.env.AWSPROFILE || "default";
const credentials = new AWS.SharedIniFileCredentials({ profile: access });
AWS.config.credentials = credentials;
const secretsmanager = AWS.SecretsManager();

export const generateSecrets = function (name: string, keyA: string, keyB: string, valueA: string, valueB: string, callback: any) {
  const params = {
    Description: "Adding Lamp_Lancs secrets for CDK deployment: " + name,
    Name: name,
    SecretString: `{\"` + keyA + `\":\"` + valueA + `\",\"` + keyB + `\":\"` + valueB + `\"}`,
  };
  secretsmanager.createSecret(params, (err: any, data: any) => {
    if (err) callback("FAILED: " + err.toString());
    else callback("Secret generated.");
  });
};

export const checkSecretExists = function (name: string, callback: any) {
  const params = {
    SecretId: name,
  };
  secretsmanager.describeSecret(params, (err: any, data: any) => {
    if (err) callback(false);
    else {
      if (data && data.ARN) callback(true);
      callback(false);
    }
  });
};

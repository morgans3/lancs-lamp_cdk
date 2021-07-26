# lancs-lamp_cdk

Cloud Development Kit code for deploying all the infrastructure and services required to host Lancs Lamp in AWS

## Pre-requisites

- An AWS Account, with an IAM with required permissions to use CDK
- Locally stored AWS Credentials which grant programmatic access, created in AWS IAM
- Dockerhub credentials

## Steps to deploy

- After downloading the repo, run the command `npm i` to install the node_modules folder and libraries
- In the terminal, run `npm run watch` to watch and compile changes
- Add Dockerhub credentials to config file - do not commit these to a repository
- Update lib/config.ts file to customise the settings to match deployment account
- Run `cdk bootstrap` to bootstrap your AWS account
- Run `cdk deploy` to deploy all the resources

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk bootstrap` bootstrap the cdk output to your AWS environment
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

### Common Issues

#### Multiple locally stored AWS credentials

If you have multiple locally stored AWS credentials, or if you are not sure that you have a key stored with progammatic access, you should check your local machine:

- Linux and macOS: `~/.aws/config` or `~/.aws/credentials`
- Windows: `%USERPROFILE%\.aws\config` or `%USERPROFILE%\.aws\credentials`

To select a non-default account, run the cdk commands with the profile flag on the end like so `cdk bootstrap --profile myprofilename`

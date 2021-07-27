// @ts-check
import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
const codebuild = require("@aws-cdk/aws-codebuild");
import * as iam from "@aws-cdk/aws-iam";
import * as logs from "@aws-cdk/aws-logs";
import { Duration } from "@aws-cdk/core";
import * as secrets from "@aws-cdk/aws-cloudfront/node_modules/@aws-cdk/core/lib/secret-value";
import * as ecs from "@aws-cdk/aws-ecs";
import * as s3 from "@aws-cdk/aws-s3";
import { SecretsStack } from "./cdk-secrets";
import { PipelineStackProps } from "../_models/models";
import * as kms from "@aws-cdk/aws-kms";

export class CDKPipeline extends cdk.Construct {
  public build: any;
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id);

    const service: ecs.IBaseService = props.service;
    const secret: SecretsStack = props.secrets;
    const buildKey = new kms.Key(this, "BuildKMS");
    const repoName = props.application.name;
    const branchName = props.application.branch;
    const codebuildRole = new iam.Role(this, "CodePipelineRole", {
      assumedBy: new iam.ServicePrincipal("codepipeline.amazonaws.com"),
      description: "Role for handling Codepipeline",
      roleName: "ecsTaskExecutionRole",
    });
    const buildEnvVariables = secret.buildEnvVariables;

    const bucket = new s3.Bucket(this, "Pipeline_Bucket-" + id, {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: new s3.BlockPublicAccess({ blockPublicAcls: true, blockPublicPolicy: true, ignorePublicAcls: true, restrictPublicBuckets: true }),
    });

    const sourceArtifact = new codepipeline.Artifact();
    const buildArtifact = new codepipeline.Artifact();
    const accountnum = process.env.CDK_DEFAULT_ACCOUNT;
    const region = process.env.CDK_DEFAULT_REGION;
    let postbuildcommand = ["docker tag " + repoName + ":" + branchName + " " + accountnum + ".dkr.ecr." + region + ".amazonaws.com/" + repoName + ":" + branchName, "docker push " + accountnum + ".dkr.ecr." + region + ".amazonaws.com/" + repoName + ":" + branchName, `printf '[{"name":"` + repoName + `","imageUri":"` + accountnum + `.dkr.ecr.` + region + `.amazonaws.com/` + repoName + `:` + branchName + `}]' > imagedefinitions.json`];
    let reportstatement = {
      jest_reports: { files: ["test-report-directory/report-filename.xml"], "file-format": "JUNITXML" },
    };
    let teststatement = "-f Dockerfile.test ";
    const buildSpecObject = {
      version: "0.2",
      env: { "git-credential-helper": "yes" },
      phases: {
        install: {
          "runtime-versions": { docker: 18 },
          commands: "npm install",
        },
        pre_build: {
          commands: ["eval $(aws ecr get-login --no-include-email --region eu-west-2 --registry-ids 334848134567)"],
        },
        build: {
          commands: ["docker login -u $dockerhub_username -p $dockerhub_password", "docker build " + teststatement + getBuildArgs(buildEnvVariables) + " -t " + repoName + ":" + branchName + " ."],
        },
        post_build: {
          commands: postbuildcommand,
        },
      },
      reports: reportstatement,
      artifacts: {
        files: ["imagedefinitions.json"],
      },
    };

    this.build = new codebuild.PipelineProject(this, repoName + "-" + props.env, {
      bucket: bucket,
      environmentVariables: buildEnvVariables,
      buildSpec: codebuild.BuildSpec.fromObject(buildSpecObject),
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2,
        privileged: true,
        computeType: codebuild.ComputeType.MEDIUM,
      },
      timeout: Duration.minutes(15),
      encryptionKey: buildKey,
      logging: {
        cloudWatch: {
          enabled: true,
          logGroup: new logs.LogGroup(this, repoName + "-" + props.env + "LogGroup"),
        },
      },
      projectName: repoName + "-" + props.env,
      role: codebuildRole,
    });

    const testBuildSpec = {
      version: "0.2",
      env: { "git-credential-helper": "yes" },
      phases: {
        install: {
          "runtime-versions": { docker: 18 },
          commands: "npm install",
        },
        pre_build: {
          commands: ["eval $(aws ecr get-login --no-include-email --region eu-west-2 --registry-ids 334848134567)"],
        },
        build: {
          commands: ["docker login -u $dockerhub_username -p $dockerhub_password", "docker build -f Dockerfile.test " + getBuildArgs(buildEnvVariables) + " -t " + repoName + ":" + branchName + " ."],
        },
      },
      reports: {
        jest_reports: { files: ["test-report-directory/report-filename.xml"], "file-format": "JUNITXML" },
      },
      artifacts: {
        files: ["imagedefinitions.json"],
      },
    };
    const testbuild = new codebuild.PipelineProject(this, repoName + "-Test", {
      bucket: bucket,
      environmentVariables: buildEnvVariables,
      buildSpec: codebuild.BuildSpec.fromObject(testBuildSpec),
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2,
        privileged: true,
      },
      timeout: Duration.minutes(10),
      encryptionKey: buildKey,
      logging: {
        cloudWatch: {
          enabled: true,
          logGroup: new logs.LogGroup(this, repoName + "-Test" + "LogGroup"),
        },
      },
      projectName: repoName + "-Test",
      role: codebuildRole,
    });

    const pipe = new codepipeline.Pipeline(this, repoName + "-" + props.env + "Pipeline", {
      artifactBucket: bucket,
      pipelineName: repoName + "-" + props.env,
      role: codebuildRole,
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: "CodeCommit_Source",
              branch: props.application.branch,
              output: sourceArtifact,
              repo: props.application.repo,
              owner: props.application.owner,
              oauthToken: secrets.SecretValue.secretsManager("github", {
                jsonField: "oauthToken",
              }),
              trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
            }),
          ],
        },
      ],
      restartExecutionOnUpdate: true,
    });

    pipe.addStage({
      stageName: "Test",
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: "Test",
          project: testbuild,
          input: sourceArtifact,
          outputs: [],
          role: codebuildRole,
        }),
      ],
    });

    pipe.addStage({
      stageName: "Build",
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: "Build",
          project: this.build,
          input: sourceArtifact,
          outputs: [buildArtifact],
          role: codebuildRole,
        }),
      ],
    });

    pipe.addStage({
      stageName: "Push",
      actions: [
        new codepipeline_actions.EcsDeployAction({
          actionName: "Deploy",
          input: buildArtifact,
          service: service,
          role: codebuildRole,
        }),
      ],
    });
  }
}

function getBuildArgs(argArray: string[]) {
  let str = "";
  argArray.forEach((arg) => {
    str += "--build-arg " + arg + "=$" + arg + " ";
  });
  return str;
}

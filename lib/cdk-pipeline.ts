// {
//     stageName: "Source",
//     actions: [
//       new cpactions.GitHubSourceAction({
//         actionName: "CodeCommit_Source",
//         branch: props.application.branch,
//         output: sourceOutput,
//         repo: props.application.repo,
//         owner: props.application.owner,
//         oauthToken: secrets.SecretValue.secretsManager("github", {
//           jsonField: "oauthToken",
//         }),
//         trigger: cpactions.GitHubTrigger.WEBHOOK,
//       }),
//     ],
//   },

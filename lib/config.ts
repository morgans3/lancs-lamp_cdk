// @ts-check

const DevSettings = {
  isProduction: false,
  envname: "dev",
  branch: "dev",
  bucketnames: ["lancs-lamp-results-landing"],
};

const ProdSettings = {
  isProduction: true,
  envname: "www",
  branch: "main",
  bucketnames: ["lancs-lamp-results-landing"],
};

export const _SETTINGS: any = {
  config: DevSettings,
  // config: ProdSettings,
};

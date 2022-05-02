// @ts-check
function cleanseBucketName(original: string): string {
  return original.split("_").join("-").split(".").join("-");
}

export const _FUNCTIONS: any = {
  cleanseBucketName: cleanseBucketName,
};

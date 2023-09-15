export interface TsAppVersion {
  version: string;
  name: string;
  description?: string;
  versionLong?: string;
  versionDate: string;
  gitCommitHash?: string;
  gitCommitDate?: string;
  gitTag?: string;
}
export const versions: TsAppVersion = {
  version: '0.11.0',
  name: 'gek',
  versionDate: '2023-04-27T18:54:50.823Z',
  gitCommitHash: 'g6759287',
  gitCommitDate: '2023-03-31T16:14:37.000Z',
  versionLong: '0.11.0-g6759287',
  gitTag: 'v0.10.0-beta',
};
export default versions;

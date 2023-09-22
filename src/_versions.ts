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
  versionDate: '2023-09-20T14:50:54.707Z',
  gitCommitHash: 'g71c6943',
  gitCommitDate: '2023-09-15T22:50:17.000Z',
  versionLong: '0.11.0-g71c6943',
  gitTag: 'v0.11.0-beta',
};
export default versions;

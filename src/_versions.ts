export interface TsAppVersion {
    version: string;
    name: string;
    description?: string;
    versionLong?: string;
    versionDate: string;
    gitCommitHash?: string;
    gitCommitDate?: string;
    gitTag?: string;
};
export const versions: TsAppVersion = {
    version: '0.11.0',
    name: 'gek',
    versionDate: '2023-02-07T23:36:21.932Z',
    gitCommitHash: 'g27f42b4',
    gitCommitDate: '2023-02-07T02:34:09.000Z',
    versionLong: '0.11.0-g27f42b4',
    gitTag: 'v0.10.0-beta',
};
export default versions;

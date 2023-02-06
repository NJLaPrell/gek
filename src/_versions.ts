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
    versionDate: '2023-02-06T22:30:36.657Z',
    gitCommitHash: 'g76d9460',
    gitCommitDate: '2023-02-06T22:09:56.000Z',
    versionLong: '0.11.0-g76d9460',
    gitTag: 'v0.10.0-beta',
};
export default versions;

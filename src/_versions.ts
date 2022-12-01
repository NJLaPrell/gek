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
    version: '0.9.0',
    name: 'gek',
    versionDate: '2022-12-01T00:08:47.065Z',
    gitCommitHash: 'gb03805f',
    gitCommitDate: '2022-11-30T23:38:50.000Z',
    versionLong: '0.9.0-gb03805f',
    gitTag: 'v0.9.0-beta',
};
export default versions;

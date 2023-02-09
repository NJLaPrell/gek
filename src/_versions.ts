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
    versionDate: '2023-02-09T22:16:46.690Z',
    gitCommitHash: 'g19eba49',
    gitCommitDate: '2023-02-09T22:16:22.000Z',
    versionLong: '0.11.0-g19eba49',
    gitTag: 'v0.10.0-beta',
};
export default versions;

import { config, ConfigType as CType } from 'layer-config';

const stage = process.env.NODE_ENV || 'dev';

export type ConfigType = CType;
export default () => config[stage];
import { config } from 'layer-config';

const stage = process.env.NODE_ENV || 'dev';

export type ConfigType = typeof config[keyof typeof config];
export default () => config[stage];
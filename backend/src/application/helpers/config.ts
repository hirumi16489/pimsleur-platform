import { config } from '../../shared';

const stage = process.env.NODE_ENV || 'dev';

export type ConfigType = (typeof config)[keyof typeof config];
export const getConfig = () => config[stage];

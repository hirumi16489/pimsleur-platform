export const getOrigin = () => {
  const environment = process.env.APP_ENV;
  return environment !== 'local'
    ? `https://${process.env.ALTERNATE_DOMAIN_NAME}`
    : 'http://localhost:3000';
};

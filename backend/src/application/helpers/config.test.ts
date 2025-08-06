describe('getConfig returns correct config for each NODE_ENV', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('layer-config', () => ({
      config: {
        dev: {
          UPLOAD_BUCKET_NAME: 'pimsleur-platform-user-uploads',
          REGION: 'ap-northeast-1',
          DEBUG: true,
        },
        prod: {
          UPLOAD_BUCKET_NAME: 'prod-pimsleur-platform-user-uploads',
          REGION: 'ap-northeast-1',
          DEBUG: false,
        },
        test: {
          UPLOAD_BUCKET_NAME: 'test-bucket',
          REGION: 'us-east-1',
          DEBUG: true,
        },
      },
    }));
  });

  it('returns dev config by default', () => {
    delete process.env.NODE_ENV;
    const getConfig = require('./config').getConfig;
    const config = getConfig();
    expect(config).toEqual({
      UPLOAD_BUCKET_NAME: 'pimsleur-platform-user-uploads',
      REGION: 'ap-northeast-1',
      DEBUG: true,
    });
  });

  it('returns prod config when NODE_ENV=prod', () => {
    process.env.NODE_ENV = 'prod';
    const getConfig = require('./config').getConfig;
    const config = getConfig();
    expect(config).toEqual({
      UPLOAD_BUCKET_NAME: 'prod-pimsleur-platform-user-uploads',
      REGION: 'ap-northeast-1',
      DEBUG: false,
    });
  });

  it('returns test config when NODE_ENV=test', () => {
    process.env.NODE_ENV = 'test';
    const getConfig = require('./config').getConfig;
    const config = getConfig();
    expect(config).toEqual({
      UPLOAD_BUCKET_NAME: 'test-bucket',
      REGION: 'us-east-1',
      DEBUG: true,
    });
  });
});
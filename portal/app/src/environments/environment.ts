import env from './.env';
export const environment = {
  production: false,
  test: false,
  version: env.npm_package_version + '-dev',
  serverUrl: '/api',
  defaultLanguage: 'en',
  supportedLanguages: ['en'],
  accessTokenRequesTimeWindow: 10000,
  refreshTokenRequestTimeWindow: 10000,
  eth: {
    transactionStatusPollingTime: 1000,
    transactionCallDelayTime: 2000,
    web3Options: {
      transactionConfirmationBlocks: 2,
      transactionPollingTimeout: 10000
    },
    contractConfig: {
      default: {
        value: 0,
        gasPrice: 0,
        gas: 9999999
      },
      networkId: '83584648538'
    }
  }
};

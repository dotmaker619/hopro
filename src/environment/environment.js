const { VUE_APP_CORE_API_HOST, NODE_ENV = '' } = process.env;

const environment = NODE_ENV.toLowerCase();
const apiBaseUrl = VUE_APP_CORE_API_HOST;

export { environment, apiBaseUrl };

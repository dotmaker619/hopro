import axios from "axios";
import store from "@/store/";
import { authService } from "@/desktop/shared/services/"
import { apiBaseUrl } from "@/environment/environment";
/**
 * Axios basic configuration
 * Some general configuration can be added like timeout, headers, params etc. More details can be found on https://github.com/axios/axios
 * */
const config = {
  baseURL: apiBaseUrl
};

/**
 * Creating the instance of Axios
 * It is because, in large scale application we may need to consume APIs from more than single server,
 * So, may need to create multiple http client with different config
 * Only this client will be used rather than axios in the application
 **/
const httpClient = axios.create(config);

/**
 * Auth interceptors
 * @description Configuration related to AUTH token can be done in interceptors.
 * Currenlty it is just doing nothing but idea to to show the capability of axios and its interceptors
 * In future, interceptors can be created into separate files and consumed into multiple http clients
 * @param {*} config
 */
const authInterceptor = config => {
  /** add auth token */
  if (!config.headers) config.headers = {};
  let token = window.$cookies.get("access_token")
  if (token)
    config.headers["authorization"] = "jwt " + token;
  if (!(config.url.includes("no_org") || config.url.includes("organization")) && store.state.current_organization)
    config.url += `${config.url.includes("?") ? "&" : "?"}organization=${store.state.current_organization.uid
      }`;

  return config;
};

const loggerInterceptor = config => {
  /** Add logging here */
  return config;
};

/** Adding the request interceptors */
httpClient.interceptors.request.use(authInterceptor);
httpClient.interceptors.request.use(loggerInterceptor);

/** Adding the response interceptors */
httpClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    // console.log(error, error.response)
    if (error && error.response && error.response.status === 401 && originalRequest.url.includes("access-code-auth")) {
      window.$cookies.remove("access_token", null, window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com");
      window.location.href = location.origin + "/auth"
      return Promise.reject(error);
    }
    if (error && error.response && error.response.data.code === "OAUTH_21" && !originalRequest._retry) {
      originalRequest._retry = true;
      return authService.get_refresh_token()
        .then(res => {
          if (!res.access_token) return
          window.$cookies.set(
            "access_token",
            res.access_token,
            "1y",
            "/",
            window.location.hostname === "localhost"
              ? "localhost"
              : ".sensehawk.com"
          );
          if (res.access_token)
            originalRequest.headers['authorization'] = 'jwt ' + res.access_token;
          return axios(originalRequest);
        })
    }
    else
      return Promise.reject(error);

  }
);

export { httpClient };
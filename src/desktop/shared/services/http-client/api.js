import { httpClient } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_CORE_API_HOST;

class API {
  constructor() {
    this.baseUrl = API_HOST;
  }
  async get_element_hierarchy(req = {}) {
    let hosts = {
      "core": process.env.VUE_APP_CORE_API_HOST,
      "therm": process.env.VUE_APP_THERM_API_HOST,
      "terra": process.env.VUE_APP_TERRA_API_HOST,
      "vault": process.env.VUE_APP_VAULT_API_HOST,
    };
    if (!req.stage || !hosts[req.stage.toLocaleLowerCase()]) return Promise.reject(new Error("Invalid stage"));

    return httpClient({
      url: `/element/${req.id}/hierarchy/`,
      baseURL: hosts[req.stage.toLocaleLowerCase()],
      headers: req.headers,
    }).then((res) => res.data);
  }
  async get(req = {}) {
    return httpClient({
      url: req.url,
      headers: req.headers,
    });
  }
  async getTags(req = {}) {
    return httpClient({
      url: `${API_HOST}/tags/`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async post(req = {}) {
    return httpClient({
      url: req.url,
      body: req.body,
      headers: req.headers,
    });
  }
  async get_firebase_token(req = {}) {
    return httpClient({
      url: `${API_HOST}/firebase-token/`,
      headers: req.headers,
    });
  }
}
export const apiService = new API();

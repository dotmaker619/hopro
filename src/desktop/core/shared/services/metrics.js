import { httpClient } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
import { apiBaseUrl } from "@/environment/environment";
const API_HOST = apiBaseUrl;
import store from "@/store/";

class API {
  constructor() {
    this.baseURL = API_HOST;
    this.url = URL;
  }
  get_metrics(req = {}) {
    return httpClient({
      url: `organizations/${store.state.current_organization.uid}/metrics`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }

  async get_user_metrics(req = {}) {
    return httpClient({
      url: `users/${req.user_id}/metrics/?organization=${store.state.current_organization.uid}`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  get_metrics_all(req = {}) {
    return httpClient({
      url: `metrics`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  get_resource_metrics(req = {}) {
    return httpClient({
      url: `${req.attribute}/${req.id}/metrics/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL
    }).then(res => res.data);
  }
}
export const metricsService = new API();

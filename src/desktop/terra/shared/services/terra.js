import { httpClient } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_TERRA_API_HOST;
import { BaseService } from "@/desktop/shared/services/";

const URL = "container-views";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
  get_views(req = {}) {
    return httpClient({
      url: `container-views/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res);
  }
  get_elements(req = {}) {
    return httpClient({
      url: `elements/feature/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  // get_one_view(req = {}) {
  //   return httpClient({
  //     url: `containers/${req.id}/${req.query ? `?${req.query}` : ""}`,
  //     baseURL: this.baseURL,
  //     headers: req.headers,
  //   }).then((res) => res);
  // }

  get_view_details(req = {}) {
    return httpClient({
      url: `container-views/${req.id}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }

  get_metrics(req = {}) {
    return httpClient({
      url: `metrics/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }

  create_view(req = {}) {
    return httpClient({
      url: `container-views`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }

  get_groups(req = {}) {
    return httpClient({
      url: `groups/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_project_feature_count() {
    return {};
  }
  get_project_features(req = {}) {
    return httpClient({
      url: `features/container/${req.view_id}/project/${req.id}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
    }).then((res) => res.data);
  }
}

export const terraService = new API();

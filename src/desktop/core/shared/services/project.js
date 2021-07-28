import { httpClient } from "@/desktop/shared/services/";
import { apiBaseUrl } from "@/environment/environment";
// import { apiConstants } from '../../config';
const API_HOST = apiBaseUrl;
const URL = "projects";

class API {
  constructor() {
    this.baseURL = API_HOST;
    this.url = URL;
  }
  // async get_reports(req = {}) {
  //   return httpClient({
  //     url: `${req.resource_name}/${req.id}/reports/${
  //       req.query ? `?${req.query}` : ""
  //     }`,
  //     baseURL: this.baseURL,
  //     headers: req.headers
  //   }).then(res => res.data);
  // }
  async getAll(req = {}) {
    return httpClient({
      url: `groups/${req.group_id}/${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async post(req = {}) {
    return httpClient({
      url: `groups/${req.group_id}/${this.url}/${req.id ? `${req.id}/` : ""}${req.attribute ? `${req.attribute}/` : ""}${
        req.query ? `?${req.query}` : ""
      }`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async get(req = {}) {
    return httpClient({
      url: `groups/${req.group_id}/${this.url}/${req.id}${req.attribute ? req.attribute + "/" : ""}${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async put(req = {}) {
    return httpClient({
      url: `groups/${req.group_id}/${this.url}/${req.id}`,
      baseURL: this.baseURL,
      method: "put",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async patch(req = {}) {
    return httpClient({
      url: `groups/${req.group_id}/${this.url}/${req.id}`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async delete(req = {}) {
    return httpClient({
      url: `groups/${req.group_id}/${this.url}/${req.id}`,
      baseURL: this.baseURL,
      method: "delete",
      headers: req.headers,
    }).then((res) => res.data);
  }

  async sync_report(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/reports/${req.report_id}/sync/`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      body: req.body,
    }).then((res) => res.data);
  }
  get_service_obj(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/service/`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
}
export const projectService = new API();
// export { projectService };

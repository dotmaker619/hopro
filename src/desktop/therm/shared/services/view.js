import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = process.env.VUE_APP_THERM_API_HOST;

const URL = "views";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
  create(req = {}) {
    return httpClient({
      url: `${this.url}/create`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async getAll(req = {}) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res);
  }
  async get_view(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/${req.query ? `?${req.query}` : ""}`,
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
  update(req = {}) {
    return httpClient({
      url: `${this.url}/update?no_org`,
      baseURL: this.baseURL,
      method: "put",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_view_temperature_data(req = {}) {
    return httpClient({
      url: `metrics/view/${req.id}/issues/temperatures`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_view_project_temperature_data(req = {}) {
    return httpClient({
      url: `metrics/view/${req.id}/project/${req.project_id}/issues/temperatures`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_project_features(req={}){
    return httpClient({
      url: `features/view/${req.view_id}/project/${req.project_id}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_view_status(req = {}) {
    return httpClient({
      url: `metrics/view/${req.id}/counts/statuses/project/issues`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_view_issue_types(req = {}) {
    return httpClient({
      url: `viewer/view/${req.id}/config/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_issue_types(req = {}) {
    return httpClient({
      url: "extras/issue-types",
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_view_project_issue_count(req = {}) {
    return httpClient({
      url: `metrics/view/${req.id}/project/${req.project_id}/counts/issues`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_issue_status(req = {}) {
    return httpClient({
      url: `metrics/view/${req.id}/counts/statuses/project/issues`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_projects(req = {}) {
    return httpClient({
      url: "views/projects",
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  download_csv(req = {}) {
    return httpClient({
      url: `views/view/${req.id}/csv`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
}
export const viewService = new API();

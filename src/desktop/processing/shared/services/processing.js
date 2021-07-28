import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = process.env.VUE_APP_PROCESSING_API_HOST;
const URL = "process";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
  get_config(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/config/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  update_config(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/config/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      method: "put",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_action(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/actions/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  start(req = {}) {
    return this.processing_action(req, "start");
  }
  stop(req = {}) {
    return this.processing_action(req, "stop");
  }
  resume(req = {}) {
    return this.processing_action(req, "resume");
  }
  processing_action(req, action) {
    return httpClient({
      url: `${this.url}/${req.id}/${action}/`,
      baseURL: this.baseURL,
      method: "post",
      headers: req.headers,
      data: req.body,
    }).then((res) => res.data);
  }

  //Temp

  get_metrics(req = {}) {
    return httpClient({
      url: `metrics/?status=failed&prject_type=general&gcp_status=marked`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }

  // gcp
  post_gcp(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/gcp/`,
      baseURL: this.baseURL,
      method: "post",
      headers: req.headers,
      data: req.body,
    }).then((res) => res.data);
  }
  get_gcp(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/gcp/`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  delete_gcp(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/gcp/`,
      baseURL: this.baseURL,
      method: "delete",
      headers: req.headers,
    }).then((res) => res.data);
  }
  // marks
  post_marks(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/gcp/`,
      baseURL: this.baseURL,
      method: "post",
      headers: req.headers,
      data: req.body,
    }).then((res) => res.data);
  }
  get_marks(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/marks/`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  delete_marks(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/marks/`,
      baseURL: this.baseURL,
      method: "delete",
      headers: req.headers,
    }).then((res) => res.data);
  }
  get_available_coordinates(req = {}) {
    return httpClient({
      url: `available-coordinate-systems/${req.search ? "?search=" + req.search : ''}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
}
export const processingService = new API();

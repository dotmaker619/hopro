import { httpClient } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
import { apiBaseUrl } from "@/environment/environment";
const API_HOST = apiBaseUrl;
const URL = "reports";

class API {
  constructor() {
    this.baseURL = API_HOST;
    this.url = URL;
  }
  get_reports(req = {}) {
    return httpClient({
      url: `${req.resource_name}/${req.id}/reports/${
        req.query ? `?${req.query}` : ""
      }`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  get_report_details(req = {}) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_uid}/${
        req.query ? `?${req.query}` : ""
      }`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  update_report_details(req = {}) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_uid}/`,
      data: req.body,
      method: "post",
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }

  update_report_detail(req = {}) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_uid}/`,
      data: req.body,
      method: "put",
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  create_report(req = {}) {
    return httpClient({
      url: `projects/${req.id}/reports/?`,
      data: req.body,
      method: "post",
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }

  delete_report(req = {}) {
    return httpClient({
      url: `groups/${req.id}/reports/${req.report_uid}`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "delete"
    }).then(res => res.data);
  }

  delete_project_report(req = {}) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_uid}`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "delete"
    }).then(res => res.data);
  }
  download_report(req = {}) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_uid}/download`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  sync_report(req) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_id}/sync`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
}

export const reportService = new API();

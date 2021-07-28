import { httpClient } from "@/desktop/shared/services/";
import { apiBaseUrl } from "@/environment/environment";
const API_HOST = apiBaseUrl;

export default class API {
  constructor() {
    this.baseURL = API_HOST;
  }

  async upload_completed(req) {
    return httpClient({
      url: `projects/${req.id}/upload-completed/?sendEmail=true`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }

  async get_report_types(req) {
    return httpClient({
      url: `/data/report-types/?datas=false`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }

  async get_reports(req) {
    return httpClient({
      url: `projects/${req.id}/reports/?${req.query ? req.query : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }

  async get_report_details(req) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_uid}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async get_post_url(req) {
    return httpClient({
      url: `projects/${req.id}/reports/generate/post/?`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      data: req.body,
    }).then((res) => res.data);
  }
  async get_post_policy(req) {
    return httpClient({
      url: `projects/${req.id}/reports/generate/post-policy/?`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      data: req.body,
    }).then((res) => res.data);
  }
  async get_raw_datas(req) {
    return httpClient({
      url: `projects/${req.id}/report/get/datas`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async add_raw_datas(req) {
    return httpClient({
      url: `projects/${req.id}/data/reports/?`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      data: req.body,
    });
  }
  //
  async get_raw_datas_download_links(req) {
    return httpClient({
      url: `projects/${req.id}/data/reports/${req.report_uid}/download/`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      data: req.body,
    }).then((res) => res.data);
  }
  // Get form data
  async get_services(req) {
    return httpClient({
      url: `data/services`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async get_report_types(req) {
    return httpClient({
      url: `data/report-types/?datas=false`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  //
  async get_post_creds(req) {
    return httpClient({
      url: `projects/${req.id}/reports/generate/credentials/?`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      data: req.body,
    }).then((res) => res.data);
  }
  async download_report(req) {
    return httpClient({
      url: `projects/${req.id}/reports/${req.report_uid}/download`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      data: req.body,
    }).then((res) => res.data);
  }
}
export const uploadService = new API();

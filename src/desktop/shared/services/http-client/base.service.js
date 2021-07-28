import { httpClient } from "@/desktop/shared/services/";
import { apiBaseUrl } from "@/environment/environment";

export default class BaseService {
  constructor(api_host, url) {
    this.url = url;
    this.baseURL = api_host || apiBaseUrl;
  }
  async getAll(req = {}) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async post(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id ? `${req.id}/` : ""}${req.attribute ? `${req.attribute}/` : ""}${
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
      url: `${this.url}/${req.id}/${req.attribute ? `${req.attribute}` : ""}${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async put(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/${req.attribute ? `${req.attribute}/` : ""}`,
      baseURL: this.baseURL,
      method: "put",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async patch(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}${req.attribute ? `/${req.attribute}` : ""}`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async delete(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}`,
      baseURL: this.baseURL,
      method: "delete",
      headers: req.headers,
    }).then((res) => res.data);
  }
}

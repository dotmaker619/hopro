import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_FORMS_API_HOST;

const URL = "forms";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }

  async get(req = {}) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    });
  }

  async post(req = {}) {
    return httpClient({
      url: `${this.url}/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async delete(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/`,
      baseURL: this.baseURL,
      method: "delete",
      header: req.headers,
    }).then((res) => res.data);
  }
  async update(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
}

export const forms = new API();

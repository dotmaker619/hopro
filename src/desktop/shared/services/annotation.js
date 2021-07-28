import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";

const API_HOST = process.env.VUE_APP_ANNOTATION_API_HOST;

const URL = "annotations";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }

  async getAll(req = {}) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    });
  }

  async add_annotation(req = {}) {
    return httpClient({
      url: `${this.url}`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async update_annotation(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async delete_annotation(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}`,
      baseURL: this.baseURL,
      method: "delete",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
}

export const annotationService = new API();

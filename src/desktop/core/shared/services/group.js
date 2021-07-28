import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = null;
const URL = "groups";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }

  async copy_project(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/copy-projects/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async move_project(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/move-projects/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
}
export const groupService = new API();

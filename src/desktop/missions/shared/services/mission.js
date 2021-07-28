import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
import { apiBaseUrl } from "@/environment/environment";

// import store from "@/store/";

// import { apiConstants } from '../../config';
const API_HOST = process.env.VUE_APP_MISSION_API_HOST;
const URL = "missiongroup";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
  async get_metrics(req = {}) {
    return httpClient({
      url: `metrics/`, //get organization uid from store
      baseURL: this.baseURL,
      method: "get",
      headers: req.headers
    }).then(res => res.data);
  }
  async get_all_missiongroups(req = {}) {
    return httpClient({
      url: `missiongroup/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      method: "get",
      headers: req.headers
    });
  }
  async get_project_mission(req = {}) {
    return httpClient({
      url: `missiongroup${
        req.query ? `?${req.query}` : ""
        }`,
      baseURL: this.baseURL,
      method: "get",
      headers: req.headers
    });
  }
  async create_project(req = {}) {
    return httpClient({
      url: `missiongroups/${req.mission_group_id}/missions/${req.id}/project/`,
      baseURL: apiBaseUrl,
      data: req.body,
      method: "post",
      headers: req.headers
    });
  }

}
export const missionService = new API();

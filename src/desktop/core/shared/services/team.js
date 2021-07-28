import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
import store from "@/store/";
// import { apiConstants } from '../../config';
const API_HOST = null;
const URL = "labels";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
  async getAll(req = {}) {
    if (!req.from_server) {
      if (req.organization) {
        return new Promise((resolve, reject) => {
          resolve(
            {
              results: store.state.teams.filter(u => u.organization == req.organization)
            })
        })
      }
      return new Promise((resolve, reject) => {
        resolve(
          {
            results:
              store.state.teams
          })
      })

    }
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  async get_team_list(req = {}) {
    return new Promise((resolve, reject) => {
      resolve(
        store.state.teams.filter(u => req.body.includes(u.uid))
      )
    })
    return httpClient({
      url: `/label-list/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers
    }).then(res => res.data);
  }
  // Created to use when internal flag is selected in ticket form to search users without org param
  async get_all_without_organization(req) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ''}`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }
  async get_all_without_organization_(req) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ''}`,
      baseURL: this.baseURL,
      headers: req.headers
    })
  }
  async getAll_(req = {}) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers
    }).then(res => res.data);
  }

}
export const teamService = new API();

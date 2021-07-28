import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
import store from "@/store/";
// import { apiConstants } from '../../config';
const API_HOST = null;
const URL = "users";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
  async getAll(req = {}) {
    // let queriesList = req.query.split("&");
    // let queryObj = {};
    // queriesList.forEach(q => {
    //   let splitQuery = q.split("=");
    //   let value = splitQuery[1];
    //   if (splitQuery[1] === "true") value = true;
    //   else if (splitQuery[1] === "false") value = false;
    //   queryObj[splitQuery[0]] = value;
    // });
    if (!req.from_server) {
      if (req.organization) {
        return new Promise((resolve, reject) => {
          resolve({
            results: store.state.users.filter((u) => u.organization && u.organization.uid == req.organization),
          });
        });
      }
      return new Promise((resolve, reject) => {
        resolve({
          results: store.state.users,
          // .filter(u=>u.active)
          // store.state.users.filter(u => {
          //   for (let key in queryObj) {
          //     console.log(`u[${key}]`, u[key])
          //     console.log(`u[${key}] === undefined || u[${key}] != queryObj[${key}]`, u[key] === undefined, u[key] != queryObj[key])
          //     if (u[key] === undefined || u[key] != queryObj[key])
          //       return false;
          //   }
          //   return true;
          // })
        });
      });
    }
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async invite_users(req = {}) {
    return httpClient({
      url: `organizations/${store.state.current_organization.uid}/invite_users/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async resend_invite(req) {
    return httpClient({
      url: `users/${req.id}/lifecycle/reactivate/?organization=${store.state.current_organization.uid}`,
      baseURL: this.baseURL,
      method: "put",
    });
  }
  async verify_email(req = {}) {
    return httpClient({
      url: "verify-email/",
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async invite_guest_users(req = {}) {
    return httpClient({
      url: `organizations/${store.state.current_organization.uid}/guest-users/assign/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      headers: req.headers,
    }).then((res) => res.data);
  }
  async get_users_list(req = {}) {
    return new Promise((resolve, reject) => {
      resolve(
        store.state.users.filter((u) => req.body.includes(u.uid))
        // store.state.users.filter(u => req.body.includes(u.uid) && u.active)
      );
    });
  }
  async get_single_user_details(req = {}) {
    return httpClient({
      url: `/users/${req.id}/?display_picture=true${req.query ? `&${req.query}` : ""}`,
      baseURL: this.baseURL,
    }).then((res) => res.data);
  }
  // Created to use when internal flag is selected in ticket form to search users without org param
  async get_all_without_organization(req) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
    }).then((res) => res.data);
  }
  async get_all_without_organization_(req) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
    });
  }
  async getAll_(req = {}) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    });
  }

  async generate_display_picture_url(req) {
    return httpClient({
      url: "me/profile/generate/post/",
      baseURL: this.baseURL,
      method: "post",
      headers: req.headers,
      data: req.body,
    });
  }
  async upload_display_picture(req) {
    return httpClient({
      url: "me/display-picture/",
      baseURL: this.baseURL,
      method: "post",
      headers: req.headers,
      data: req.body,
    });
  }
  async get_display_picture() {
    return httpClient({
      url: "me/display-picture/",
      baseURL: this.baseURL,
      method: "get",
      headers: req.headers,
    });
  }
  async change_password(req) {
    return httpClient({
      url: `${this.url}/${req.id}/credentials/change_password/`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "put",
      data: req.body,
    }).then((res) => res.data);
  }
  async get_ua_info(req) {
    return httpClient({
      url: `${this.url}/${req.id}/ua-info/`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "get",
    }).then((res) => res.data);
  }
  async logout_all_devices(req) {
    return httpClient({
      url: `${this.url}/${req.id}/logout-all-devices/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "get",
    }).then((res) => res.data);
  }
  async logout_device(req) {
    return httpClient({
      url: `${this.url}/${req.id}/logout-device/`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
      data: req.body,
    }).then((res) => res.data);
  }
  async refresh_user_token(req) {
    return httpClient({
      url: `${this.url}/${req.id}/api-change-token/`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "post",
    }).then((res) => res.data);
  }
  async toggle_guest_user_activation(req = {}) {
    return httpClient({
      url: `organizations/${req.organization_id}/guest-users/details/${req.id}/`,
      baseURL: this.baseURL,
      headers: req.headers,
      method: "put",
      data: req.body,
    }).then((res) => res.data);
  }
}

export const userService = new API();

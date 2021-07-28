import { httpClient } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
import { apiBaseUrl } from "@/environment/environment";
const API_HOST = apiBaseUrl;
import axios from "axios";


class API {
    constructor() { }
    get_token(req) {
        return httpClient({
            url: "api-basic-auth/",
            baseURL: API_HOST,
            method: "post",
            data: req.body,
            headers: req.headers
        }).then(res => res.data);
    }
    get_access_token(req = {}) {
        return httpClient({
            url: "access-code-auth/?",
            baseURL: API_HOST,
            method: "post",
            data: req.body,
            headers: req.headers
        }).then(res => res.data);
    }
    get_user_claims(req = {}) {
        return httpClient({
            url: `claims/`,
            baseURL: API_HOST,
            headers: req.headers
        }).then(res => res.data);
    }
    get_refresh_token(req = {}) {
        return httpClient({
            url: `token/lifetime/extend/?`,
            baseURL: API_HOST,
            method: "post",
            data: { redirect_uri: location.origin + '/auth/callback' },
            headers: req.headers
        }).then(res => res.data);
    }
    logout_okta(req = {}) {
        return axios.delete(process.env.VUE_APP_OKTA_LOGOUT_API)
    }
    logout(req = {}) {
        return httpClient({
            url: `logout/`,
            baseURL: API_HOST,
            headers: req.headers
        }).then(res => res.data);
    }
    logout_all(req = {}) {
        return httpClient({
            url: `users/${req.id}/logout-all-devices/`,
            baseURL: API_HOST,
            headers: req.headers
        }).then(res => res.data);
    }
    get_user_logged_in_devices(req = {}) {
        return httpClient({
            url: `users/${req.id}/ua-info/`,
            baseURL: API_HOST,
            headers: req.headers
        }).then(res => res.data);
    }


    get_enrollment_details(req = {}) {
        return httpClient({
            url: `enrollment/${req.token}/?userId=${req.userId}&no_org`,
            baseURL: API_HOST,
        }).then(res => res.data);
    }
    update_enrollment_details(req = {}) {
        return httpClient({
            url: `enrollment/${req.token}/?userId=${req.userId}&no_org`,
            baseURL: API_HOST,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
}
export const authService = new API();

import { httpClient } from "@/desktop/shared/services/";
import store from "@/store/";

// import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = process.env.VUE_APP_CORE_API_HOST;

// const URL = "users";

class API {
    async get_permissions(req = {}) {
        return httpClient({
            url: "permissions/",
            baseURL: API_HOST,
            method: "get",
            headers: req.headers
        }).then(res => res.data);
    }
    async get_organization_permissions(req = {}) {
        return httpClient({
            url: `organizations/${req.id ? req.id : store.state.current_organization.uid}/permissions/`,
            baseURL: API_HOST,
            method: "get",
            headers: req.headers
        }).then(res => res.data);
    }
    async update_organization_permissions(req = {}) {
        return httpClient({
            url: `organizations/${req.id ? req.id : store.state.current_organization.uid}/permissions/`,
            baseURL: API_HOST,
            method: "put",
            data: req.body,
            headers: req.headers
        }).then(res => res.data);
    }
    async get_role_permissions(req = {}) {
        return httpClient({
            url: `teams/${req.id}/permissions/${req.query ? `?${req.query}` : ''}`,
            baseURL: API_HOST,
            method: "get",
            headers: req.headers
        }).then(res => res.data);
    }
    async update_role_permissions(req = {}) {
        return httpClient({
            url: `teams/${req.id}/permissions/${req.query ? `?${req.query}` : ''}`,
            baseURL: API_HOST,
            method: "put",
            data: req.body,
            headers: req.headers
        }).then(res => res.data);
    }
    async get_user_permissions(req = {}) {
        return httpClient({
            url: `users/${req.id}/permissions/${req.query ? `?${req.query}` : ''}`,
            baseURL: API_HOST,
            method: "get",
            headers: req.headers
        }).then(res => res.data);
    }
    async update_user_permissions(req = {}) {
        return httpClient({
            url: `users/${req.id}/permissions/${req.query ? `?${req.query}` : ''}`,
            baseURL: API_HOST,
            method: "put",
            data: req.body,
            headers: req.headers
        }).then(res => res.data);
    }
}
export const permissionService = new API();

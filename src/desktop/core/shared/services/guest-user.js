import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
import store from "@/store/";

// import { apiConstants } from '../../config';
const API_HOST = null;
const URL = "guest-users";

class API extends BaseService {
    constructor() {
        super(API_HOST, URL);
    }
    async assign_guest_users(req = {}) {
        return httpClient({
            url: `organizations/${store.state.current_organization.uid}/guest-users/assign`,
            baseURL: this.baseURL,
            method: "post",
            data: req.body,
            headers: req.headers
        }).then(res => res.data);
    }
    async get_guest_user_details(req = {}) {
        return httpClient({
            url: `organizations/${store.state.current_organization.uid}/guest-users/details/${req.id}`,
            baseURL: this.baseURL,
            method: "get",
            headers: req.headers
        }).then(res => res.data);
    }
    async put_guest_user_details(req = {}) {
        return httpClient({
            url: `organizations/${store.state.current_organization.uid}/guest-users/details/${req.id}`,
            baseURL: this.baseURL,
            method: "put",
            data: req.body,
            headers: req.headers
        }).then(res => res.data);
    }
}
export const guestUserService = new API();
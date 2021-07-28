import { httpClient } from "@/desktop/shared/services/";

import { BaseService } from "@/desktop/shared/services/";

const API_HOST = process.env.VUE_APP_TERRA_API_HOST;
const URL = "feature-type-groups";

class API extends BaseService {
    constructor() {
        super(API_HOST, URL);
    }
    get_ftg(req = {}) {
        return httpClient({
            url: `container-views/${req.id}/ftg/${req.query ? `?${req.query}` : ""}`,
            baseURL: this.baseURL,
            headers: req.headers
        }).then(res => res.data);
    }
    assign_to_view(req) {
        return httpClient({
            url: `container-views/${req.id}/ftg/add/`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    unassign_from_view(req) {
        return httpClient({
            url: `container-views/${req.id}/ftg/remove/`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
}

export const featureTypeGroupService = new API();
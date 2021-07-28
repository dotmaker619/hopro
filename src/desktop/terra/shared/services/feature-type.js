import { httpClient,BaseService } from "@/desktop/shared/services/";
// import { BaseService } from "@/desktop/shared/services/";

const API_HOST = process.env.VUE_APP_TERRA_API_HOST;
const URL = "feature-types";

class API extends BaseService {
    constructor() {
        super(API_HOST, URL);
    }
    async move(req) {
        return httpClient({
            url: `${API_HOST}/feature-types/move/`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: 'post',
            data: req.body
        }).then(res => res.data);
    }
}
export const featureTypeService = new API();
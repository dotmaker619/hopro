
import { httpClient,BaseService } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_TERRA_API_HOST;
const URL = "features/container-views";

class API extends BaseService {
    constructor() {
        super(API_HOST, URL);
    }
    async get_project_features(req) {
        return httpClient({
            url: `${this.URL}/${req.id}/project/${req.project_id}/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers
        }).then(res => res.data);
    }

}
export const featureService = new API();

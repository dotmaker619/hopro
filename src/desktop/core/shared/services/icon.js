import { httpClient } from "@/desktop/shared/services/";
import { apiBaseUrl } from "@/environment/environment";
const API_HOST = apiBaseUrl;

class API {
    constructor() {
        this.baseURL = API_HOST;
    }

    async generate_url(req) {
        return httpClient({
            url: `generateurl/`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
}

export const iconService = new API();

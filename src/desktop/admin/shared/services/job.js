import { httpClient } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_JOB_API_HOST;
const URL = "jobs";

class API {
    constructor() {
        this.API_HOST = API_HOST;
        this.URL = URL;
    }
    async get(req = {}) {
        return httpClient({
            url: `${this.URL}/${req.query ? `?${req.query}` : ""}`,
            baseURL: this.API_HOST,
            headers: req.headers
        })
    }
    post(req = {}) {
        return httpClient({
            url: `${this.URL}/${req.attribute ? `${req.attribute}/` : ''}`,
            baseURL: this.API_HOST,
            data: req.body,
            method: "post",
            headers: req.headers
        });
    }
}
export const jobService = new API();

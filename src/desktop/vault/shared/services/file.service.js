import { BaseService } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_VAULT_API_HOST;
import { httpClient } from "@/desktop/shared/services/";

class API extends BaseService {
    constructor() {
        super(API_HOST, "files");
    }
    async get_activities(req = {}) {
        return httpClient({
            url: `stream/user-token/file/${req.id}`,
            baseURL: this.baseURL
        });
    }


    files_bulk_patch(req={}) {
        return httpClient({
            url: `${this.url}/folder/${req.id}/bulk/`,
            baseURL: this.baseURL,
            method: "patch",
            data: req.body,
            headers: req.headers
        })
    }
    // get Metrics
    patch_(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}${req.attribute ? `/${req.attribute}` : ""}`,
            baseURL: this.baseURL,
            method: "post",
            data: req.body,
            headers: req.headers
        })
    }
    get_element(req = {}) {
     return httpClient({
      url: `${req.url}`,
      baseURL: this.baseURL,
      method: "get",
      data: req.body,
      headers: req.headers,
     });
    }
    async get_metrics(req = {}) {
        return httpClient({
            url: `metrics/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
        }).then(res => res.data);
    }
    async move_file(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/move/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    // uploads
    update_file_upload_in_folder(req = {}) {
        return httpClient({
            url: `${this.url}/folder/${req.id}/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    get_file_upload_url(req = {}) {
        return httpClient({
            url: `${this.url}/folder/${req.id}/generate-presigned-post-url/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    async get_file_share_url(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/generate-shared-url/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    async get_file_download_url(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/download-presigned-url/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
        })
    }
    // Password

    // bookmark
    async toggle_bookmark(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/bookmark/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    // archive
    async toggle_archive(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/archive/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        })
    }
    async move(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/move/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        })
    }
    // share
    async get_share_uid(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/share/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        })
    }
    async get_shared_file_download_url(req = {}) {
        return httpClient({
            url: `${this.url}/share/${req.share_id}/download?no_org`,
            baseURL: this.baseURL,
            headers: req.headers,
            data: req.body
        })
    }
    // Bulk delete
    async bulk_delete(req = {}) {
        return httpClient({
            url: `${this.url}/folder/${req.id}/delete?no_org`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }

}
export const fileService = new API();

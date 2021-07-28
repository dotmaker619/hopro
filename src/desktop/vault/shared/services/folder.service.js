import { BaseService } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_VAULT_API_HOST;
import { httpClient } from "@/desktop/shared/services/";
import store from "@/store";
class API extends BaseService {
    constructor() {
        super(API_HOST, "folders");
    }
    folders_bulk_patch(req = {}) {
        return httpClient({
            url: `${this.url}/bulk`,
            baseURL: this.baseURL,
            method: "patch",
            data: req.body,
            headers: req.headers
        })
    }
    async bulk_delete(req = {}) {
        return httpClient({
            url: `${this.url}/delete/?no_org`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    get_files_download_url(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/generate-presigned-url/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers
        });
    }
    get_activities(req = {}) {
        if (!req.id)
            return httpClient({
                url: `stream/user-token/vault_user/${store.state.current_organization.uid}-${store.state.claims.user_id}`,
                baseURL: this.baseURL
            });
        return httpClient({
            url: `stream/user-token/folder/${req.id}`,
            baseURL: this.baseURL
        });
    }
    patch_(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}${req.attribute ? `/${req.attribute}` : ""}`,
            baseURL: this.baseURL,
            method: "post",
            data: req.body,
            headers: req.headers
        })
    }
    folder_files(req = {}) {
        return httpClient({
            url: `files/folder/${req.id}/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers
        }).then(res => res.data);
    }
    get_sub_folders(req = {}) {
        return httpClient({
            url: `folders/${req.id}/descendants/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers
        }).then(res => res.data);
    }
    create_sub_folder(req = {}) {
        return httpClient({
            url: `folders/${req.id}/create?no_org`,
            baseURL: this.baseURL,
            headers: req.headers,
            data: req.body,
            method: "post"
        }).then(res => res.data);
    }
    // Password
    async set_password(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/password/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        })
    }
    async remove_password(req = {}) {
        return httpClient({
            url: `${this.url}/${req.id}/password/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "delete"
        })
    }
    // users

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
    async toggle_bulk_bookmark(req = {}) {
        return httpClient({
            url: `${this.url}/bookmark/${req.query ? `?${req.query}` : ''}`,
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
    async toggle_bulk_archive(req = {}) {
        return httpClient({
            url: `${this.url}/archive/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    // Bulk delete
    bulk_delete(req = {}) {
        return httpClient({
            url: `${this.url}/delete/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }

    async bulk_user_add(req = {}) {
        await set_headers(req);
        HEADERS.headers = { ...HEADERS.headers, ...(req.headers || {}) }
        return httpClient({
            url: `${this.url}/users/add/${req.query ? `?${req.query}` : ''}`,
            baseURL: this.baseURL,
            headers: req.headers,
            method: "post",
            data: req.body
        }).then(res => res.data);
    }
    update_recents_list(
        resourceType,
        resourceId,
        appendLength = 25,
        isDelete=false
    ) {
        try {
            let resourceList = !store.state.RECENTLY_ACCESSED_RESOURCES
                ? []
                : [...(store.state.RECENTLY_ACCESSED_RESOURCES[resourceType] || [])];

            let resourceIndex = resourceList.findIndex(f => f.uid == resourceId);
            if (resourceIndex === -1) resourceList.unshift({ time: Date.now(), uid: resourceId });
            else {
                resourceList.splice(resourceIndex, 1);
                resourceList.unshift({ time: Date.now(), uid: resourceId });
                if(isDelete) resourceList.splice(resourceindex, 1);
            }
            store.state.firebase_database
                .ref(
                    `/userProfile/${store.state.claims.user_id}/organizations/${store.state.current_organization.uid}/recentlyAccessed/${resourceType}`
                )
                .set(resourceList.slice(0, appendLength));
        } catch (err) {
            console.log(err)
        }
    }
}
export const folderService = new API();

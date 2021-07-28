import store from "@/store/index"

class TagApi {
    async create(req = {}) {
        let uniqueId = btoa(Math.random()).substring(0, 8)
        await store.state.firebase_database.ref(
            `/organizations/${store.state.current_organization.uid}/tags/${uniqueId}`
        ).set({ uid: uniqueId, name: req.name, color: req.color })
        return uniqueId;
    }
    async update(req = {}) {
        await store.state.firebase_database.ref(
            `/organizations/${store.state.current_organization.uid}/tags/${req.id}`
        ).set({ uid: req.id, name: req.name, color: req.color })
        return req
    }
}

export const tagService = new TagApi();

const API_HOST = process.env.VUE_APP_VAULT_API_HOST;
import { BaseService } from "@/desktop/shared/services/";

class API extends BaseService {
    constructor() {
        super(API_HOST, "tags");
    }
}
export const vaultTagService = new API();

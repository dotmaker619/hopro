// import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const URL = "roles";

class API extends BaseService {
    constructor() {
        super(null, URL);
    }
}
export const internalRoleService = new API();

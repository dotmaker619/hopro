import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const URL = "organizations";
import store from "@/store/";

class API extends BaseService {
  constructor() {
    super(null, URL);
  }
  async get_guest_organizations(req={}) {
    return httpClient({
      url: `${this.url}/${store.state.current_organization.uid}/guest-organizations/`,
      baseURL: this.API_HOST,
      headers: req.headers
    })
  }
  async update_guest_organization_details(req={}) {
    return httpClient({
      url: `${this.url}/${store.state.current_organization.uid}/guest-organizations/${req.uid}`,
      baseURL: this.API_HOST,
      headers: req.headers,
      method: "put",
      data: req.body
    })
  }
}
export const organizationService = new API();

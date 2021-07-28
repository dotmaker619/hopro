import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = null
const URL = "assets";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
  async getAssetsDashboard(req = {}) {
    return httpClient({
      url: `asset-lists/${req.query ? `?${req.query}` : ""}`
    }).then((res) => res.data);
  }
}
export const assetService = new API();

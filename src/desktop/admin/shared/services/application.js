// import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = null;
const URL = "applications";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
}
export const applicationService = new API();

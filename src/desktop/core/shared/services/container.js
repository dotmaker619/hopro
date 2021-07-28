// import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = null;
const URL = "containers";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
}
const containerService = new API();
export { containerService };

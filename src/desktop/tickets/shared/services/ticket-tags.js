// import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
// import { apiConstants } from '../../config';
const API_HOST = process.env.VUE_APP_TICKETS_API_HOST;

const URL = "tags";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }
}
export const ticketTagsService = new API();

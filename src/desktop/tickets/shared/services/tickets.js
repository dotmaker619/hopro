import { httpClient } from "@/desktop/shared/services/";
import { BaseService } from "@/desktop/shared/services/";
const API_HOST = process.env.VUE_APP_TICKETS_API_HOST;

const URL = "tickets";

class API extends BaseService {
  constructor() {
    super(API_HOST, URL);
  }

  async getAll(req = {}) {
    return httpClient({
      url: `${this.url}/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      headers: req.headers,
    });
  }

  //Multiple ticket actions

  async bulk_update(req = {}) {
    return httpClient({
      url: `${this.url}/bulkUpdate`,
      method: "post",
      data: req.body,
      baseURL: this.baseURL,
      headers: req.headers,
    });
  }

  async bulk_delete(req = {}) {
    return httpClient({
      url: `${this.url}/delete`,
      method: "post",
      data: req.body,
      baseURL: this.baseURL,
      headers: req.headers,
    });
  }

  // activities

  async get_activities(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/activity/auth`,
      baseURL: this.baseURL,
    }).then((res) => res.data);
  }

  // comments
  async get_comments(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/comment/auth`,
      baseURL: this.baseURL,
    }).then((res) => res.data);
  }

  async add_comment(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/comment/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async delete_comment(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/comment/${req.comment_id}`,
      baseURL: this.baseURL,
      method: "delete",
      header: req.headers,
    }).then((res) => res.data);
  }
  async update_comment(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/comment/${req.comment_id}`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async upload_comments_attachment(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/comments/${req.comment_id}/attachments/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async get_file_download_comments(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/comments/${req.comment_id}/attachments/`,
      baseURL: this.baseURL,
      method: "get",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  // reports
  async get_report(req = {}) {
    return httpClient({
      url: `${this.url}/reports`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async get_chart_reports(req = {}) {
    return httpClient({
      url: `reports`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }

  async update_chart_reports(req = {}) {
    return httpClient({
      url: `reports`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  // elements
  async create_or_get_element(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/element/`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }

  // attachments

  async get_file_download_details(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/attachments/${
        req.query ? `?${req.query}` : ""
      }`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }

  async update_attachment_data(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/attachments/${req.file_id}`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async delete_attachments(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/attachments/${req.file_id}`,
      baseURL: this.baseURL,
      method: "delete",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async bulk_delete_attachments(req = {}) {
    return httpClient({
      url: `${this.url}/attachments/bulkDelete`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async bulk_update_attachments(req = {}) {
    return httpClient({
      url: `${this.url}/attachments/bulkUpdate`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async bulk_create_attachments(req = {}) {
    return httpClient({
      url: `${this.url}/attachments/bulkCreate`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async update_file_upload(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/attachments/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async update_files_upload(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/attachments/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async get_files_upload_urls(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/attachments/generateUrl/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  // Checklist
  async get_checklist(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${
        req.query ? `?${req.query}` : ""
      }`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }
  async get_all_checklists(req = {}) {
    return httpClient({
      url: `checklists/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }
  async get_checklist_template(req = {}) {
    return httpClient({
      url: `checklists?isTemplate=true`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }
  async create_new_checklist(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async update_checklist(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${req.checklist_id}/`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async create_new_checklist_template(req = {}) {
    return httpClient({
      url: `checklists/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async update_checklist_template(req = {}) {
    return httpClient({
      url: `checklists/${req.checklist_id}/`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async delete_checklist_template(req = {}) {
    return httpClient({
      url: `checklists/${req.checklist_id}/`,
      baseURL: this.baseURL,
      method: "delete",
      header: req.headers,
    }).then((res) => res.data);
  }

  async load_template_items(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${req.checklist_id}/loadItems`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async checklist_template(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/template`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async delete_checklist(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${req.checklist_id}/`,
      baseURL: this.baseURL,
      method: "delete",
      header: req.headers,
    }).then((res) => res.data);
  }
  async upload_task_attachment(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${req.checklist_id}/items/${req.item_id}/attachments/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async upload_template_task_attachment(req = {}) {
    return httpClient({
      url: `checklists/${req.checklist_id}/items/${req.item_id}/attachments/`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  async get_task_attachment_upload_url(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${req.checklist_id}/items/${req.item_id}/attachments/generateUrl`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async get_task_attachments(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${req.checklist_id}/items/${req.item_id}/attachments/`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }
  async get_template_task_attachments(req = {}) {
    return httpClient({
      url: `checklists/${req.checklist_id}/items/${req.item_id}/attachments/`,
      baseURL: this.baseURL,
      header: req.headers,
    }).then((res) => res.data);
  }
  async update_checklist_template_attachment(req = {}) {
    return httpClient({
      url: `checklists/${req.checklist_id}/items/${req.item_id}/attachments/${req.file_id}`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async delete_checklist_template_attachment(req = {}) {
    return httpClient({
      url: `checklists/${req.checklist_id}/items/${req.item_id}/attachments/${req.file_id}`,
      baseURL: this.baseURL,
      method: "delete",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async delete_checklist_attachment(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/checklists/${req.checklist_id}/items/${req.item_id}/attachments/${req.file_id}`,
      baseURL: this.baseURL,
      method: "delete",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  async delete_comment_attachment(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/comments/${req.comment_id}/attachments/${req.file_id}`,
      baseURL: this.baseURL,
      method: "delete",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  //Metrics

  async get_all_metrics(req = {}) {
    return httpClient({
      url: `metrics/${req.query ? `?${req.query}` : ""}`,
      baseURL: this.baseURL,
      method: "get",

      header: req.headers,
    }).then((res) => res.data);
  }

  // Ticket actions

  bulk_template(req = {}) {
    return httpClient({
      url: `${this.url}/bulkTemplate`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  duplicate_ticket(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/duplicate`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  save_ticket_template(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/template`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
  update_ticket_template(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/template`,
      baseURL: this.baseURL,
      method: "patch",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }

  load_ticket_template(req = {}) {
    return httpClient({
      url: `${this.url}/${req.id}/loadTemplate`,
      baseURL: this.baseURL,
      method: "post",
      data: req.body,
      header: req.headers,
    }).then((res) => res.data);
  }
}

export const ticketService = new API();

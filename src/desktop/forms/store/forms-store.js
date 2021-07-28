import { formsService } from "@/desktop/shared/services";

const forms = {
  strict: true,
  namespaced: true,
  state: {
    forms: [],
    section_template: [],
    field_template: [],
    form_id: 0,
    selectedIndex: 0,
    fields: [
      { name: "Text Field", type: "short_text", dataType: "short_text", component: "text-field" },
      { name: "Rich Text Field", type: "long_text", dataType: "long_text", component: "text-field" },
      { name: "Checkbox", type: "checkbox", dataType: "check_item", component: "checkbox-field" },
      { name: "Dropdown", type: "dropdown", dataType: "dropdown", component: "dropdown-field" },
      { name: "Radio", type: "radio", dataType: "dropdown", component: "radio-field" },
      { name: "Date & Time", type: "date_time", dataType: "date_time", component: "date-time-field" },
      { name: "Email", type: "email", dataType: "email", component: "email-field" },
      { name: "Money", type: "money", dataType: "decimal", component: "money-field" },
      { name: "Phone number", type: "phone", dataType: "number", component: "phone-field" },
      { name: "Website", type: "url", dataType: "url", component: "website-field" },
      { name: "File Upload", type: "attachment", dataType: "attachment", component: "upload-field" },
    ],
  },
  getters: {
    selectedForm(state) {
      return state.forms.find((v) => v.uid === state.form_id);
    },
    fieldType(state) {
      return state.fields.reduce((acc, cur) => {
        acc[cur.type] = cur;
        return acc;
      }, {});
    },
  },
  mutations: {
    SET_FORMID(state, value) {
      state.form_id = value;
    },
    SET_FORMS(state, value = []) {
      state.forms = value ? value : [];
    },
    SET_SECTION_TEMPLATE(state, value = []) {
      state.section_template = value ? value : [];
    },
    SET_FIELD_TEMPLATE(state, value = []) {
      state.field_template = value ? value : [];
    },
    RESET_STORE(state) {
      state.forms = [];
    },
  },

  actions: {
    async add_form({ dispatch }, payload) {
      let form = await formsService.forms.post(payload);
      await dispatch("get_forms");
      return form;
    },
    async get_forms({ commit }) {
      let data = await formsService.forms.get();
      commit("SET_FORMS", data && data.data && data.data.data);
    },
    async delete_section({ dispatch }, payload) {
      await formsService.sections.delete(payload);
      dispatch("get_forms");
    },
    async add_section({ dispatch }, payload) {
      await formsService.sections.post(payload);
      dispatch("get_forms");
    },
    async update_section({ dispatch }, payload) {
      await formsService.sections.update(payload);
      dispatch("get_forms");
    },
    async get_section_template({ commit }) {
      let data = await formsService.sections.get({ query: "isTemplate=true" });
      commit("SET_SECTION_TEMPLATE", data && data.data && data.data.data);
    },
    async add_section_template({ dispatch }, payload) {
      let template = await formsService.sections.saveTemplate(payload);
      dispatch("get_section_template");
      return template;
    },
    async load_section_template({ dispatch }, payload) {
      await formsService.sections.loadTemplate(payload);
      dispatch("get_forms");
    },
    async add_field({ dispatch }, payload) {
      await formsService.fields.post(payload);
      dispatch("get_forms");
    },
    async update_field({ dispatch }, payload) {
      await formsService.fields.update(payload);
      dispatch("get_forms");
    },
    async delete_field({ dispatch }, payload) {
      await formsService.fields.delete(payload);
      dispatch("get_forms");
    },
    async get_field_template({ commit }) {
      let data = await formsService.fields.get({ query: "isTemplate=true" });
      commit("SET_FIELD_TEMPLATE", data && data.data && data.data.data);
    },
    async add_field_template({ dispatch }, payload) {
      await formsService.fields.saveTemplate(payload);
      dispatch("get_field_template");
    },
    async load_field_template({ dispatch }, payload) {
      await formsService.fields.loadTemplate(payload);
      dispatch("get_forms");
    },
  },
};

export default forms;

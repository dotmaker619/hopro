import { uploadService } from "@/desktop/shared/services/";

const processing = {
  namespaced: true,
  state: {
    config: {},
    process_details: null,
    selected_images: [],
    image_report: null,
    raw_images: null,
    report_details: null,
  },
  mutations: {
    SET_CONFIG(state, value) {
      state.config = value || {};
    },
    SET_PROCESS_DETAILS(state, value) {
      state.process_details = value || {};
    },
    SET_SELECTED_IMAGES(state, value) {
      state.selected_images = value || [];
    },
    SET_IMAGE_REPORT(state, value) {
      state.image_report = value;
    },
    SET_RAW_IMAGES(state, value) {
      state.raw_images = value;
    },
    SET_REPORT_DETAILS(state, value) {
      state.report_details = value;
    },
  },
};
export default processing;

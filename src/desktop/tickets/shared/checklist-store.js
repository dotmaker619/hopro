const checklist = {
  namespaced: true,
  state: {
    allChecklists: [],
    template: {},
    service: {},
  },
  getters: {
    reverseAllChecklist: (state) =>
      state.allChecklists.slice().sort((a, b) => {
        return (
          new Date(b.templatedAt || b.createdAt) -
          new Date(a.templatedAt || a.createdAt)
        );
      }),
    template: (state) => state.template,
  },
  mutations: {
    INITIALIZE_SERVICE(state, payload) {
      state.service = payload;
    },
    ADD_CHECKLISTS(state, payload) {
      state.allChecklists = payload;
    },
    ADD_NEW_CHECKLIST(state, payload) {
      state.template = payload;
      state.allChecklists.push(payload);
    },
    UPDATE_CHECKLIST(state, payload) {
      state.allChecklists[payload.checklistIndex] = {
        ...state.allChecklists[payload.checklistIndex],
        ...payload.body,
      };
      state.allChecklists = Object.assign([], state.allChecklists);
    },
    DELETE_CHECKLIST(state, checklistIndex) {
      state.allChecklists = _.pull(
        state.allChecklists,
        state.allChecklists[checklistIndex]
      );
      state.allChecklists = Object.assign([], state.allChecklists);
    },
  },

  actions: {
    initialize_service({ commit }, obj) {
      commit("INITIALIZE_SERVICE", obj);
    },
    async add_checklists({ state,rootState, commit }, { id }) {
      let { data } = await state.service.get_checklist({
        id,
        query: rootState.current_organization.uid,
      });
      commit("ADD_CHECKLISTS", data);
    },
    async add_template_checklists({ state,commit }) {
      let { data } = await state.service.get_all_checklists({
        query: "isTemplate=true",
      });
      commit("ADD_CHECKLISTS", data);
    },
    async add_new_checklist({ state, commit }, obj) {
      let { data } = await state.service.create_new_checklist(obj);
      commit("ADD_NEW_CHECKLIST", data);
    },
    async add_new_template_checklist({ state, commit }, obj) {
      let { data } = await state.service.create_new_checklist_template(obj);
      commit("ADD_NEW_CHECKLIST", data);
    },

    async getAttachments({ state,commit }, obj) {
      let data = await state.service.get_task_attachments(obj);
      commit("UPDATE_Attachments", data);
    },

    async update_checklist({ state, commit }, obj) {
      let checklistIndex = _.findIndex(
        state.allChecklists,
        (checklist) => checklist.uid == obj.body.uid
      );
      if (checklistIndex == -1) return;
      let payload = {
        body: obj.body,
        checklistIndex,
      };
      let old_details = _.cloneDeep(state.allChecklists[checklistIndex]);
      commit("UPDATE_CHECKLIST", payload);
      await state.service.update_checklist(obj).catch((err) => {
        let payload = {
          body: old_details,
          checklistIndex,
        };
        commit("UPDATE_CHECKLIST", payload);
      });
    },
    async update_template_checklist({ state, commit }, obj) {
      let checklistIndex = _.findIndex(
        state.allChecklists,
        (checklist) => checklist.uid == obj.body.uid
      );
      if (checklistIndex == -1) return;
      let payload = {
        body: obj.body,
        checklistIndex,
      };
      let old_details = _.cloneDeep(state.allChecklists[checklistIndex]);
      commit("UPDATE_CHECKLIST", payload);
      await state.service.update_checklist_template(obj).catch((err) => {
        let payload = {
          body: old_details,
          checklistIndex,
        };
        commit("UPDATE_CHECKLIST", payload);
      });
    },

    update_realtime_checklist({ state, commit }, obj) {
      let checklistIndex = _.findIndex(
        state.allChecklists,
        (checklist) => checklist.uid == obj.body.uid
      );
      if (checklistIndex == -1) {
        commit("ADD_NEW_CHECKLIST", obj.body);
      } else {
        let payload = {
          body: obj.body,
          checklistIndex,
        };
        commit("UPDATE_CHECKLIST", payload);
      }
    },
    async delete_checklist({ state, commit }, obj) {
      let checklistIndex = _.findIndex(
        state.allChecklists,
        (checklist) => checklist.uid == obj.checklist_id
      );
      if (checklistIndex == -1) return;
      let old_details = _.cloneDeep(state.allChecklists[checklistIndex]);
      commit("DELETE_CHECKLIST", checklistIndex);
      await state.service.delete_checklist(obj).catch((err) => {
        commit("ADD_NEW_CHECKLIST", old_details);
      });
    },
  },
};

export default checklist;

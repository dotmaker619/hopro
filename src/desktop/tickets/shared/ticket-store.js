import { ticketService } from "@/desktop/shared/services/";

const tickets = {
  strict: true,
  namespaced: true,
  state: {
    selected: [],
    selected_asset: [],
    tickets: [],
    //
    search_by: "",
    sort_by: {},
    group_by: { label: "None", key: null, filter_key: null, enable: true },
    filters: [],
    is_internal: false,
    tickets_total_count: 0,
    cluster_ticket: {},
    cluster_ticket_delete: null,
    describe: {
      priority: [
        { value: 1, name: "Critical" },
        { value: 2, name: "High" },
        { value: 3, name: "Medium" },
        { value: 4, name: "Low" },
      ],
      status: [
        {
          name: "pending",
          value: "1",
        },
        {
          name: "in progress",
          value: "2",
        },
        {
          name: "resolved",
          value: "3",
        },
        {
          name: "closed",
          value: "4",
        },
        {
          name: "rejected",
          value: "5",
        },
      ],
    },
    is_filters_selected: false,
  },
  mutations: {
    IS_FILTERS_SELECTED(state, value) {
      state.is_filters_selected = value;
    },
    RESET_STORE(state) {
      state.selected = [];
      state.selected_asset = [];
      state.tickets = [];
      state.search_by = "";
      state.sort_by = {};
      state.group_by = {
        label: "None",
        key: null,
        filter_key: null,
        enable: true,
      };
      state.filters = [];
      state.is_internal = false;
      state.tickets_total_count = 0;
      state.cluster_ticket = {};
      state.cluster_ticket_delete = null;
    },
    SET_SELECTED_ASSET(state, value) {
      state.tickets = [];
      state.selected_asset = [...value] || [];
    },
    SET_IS_INTERNAL(state, value) {
      state.tickets = [];
      state.is_internal = value;
    },
    SET_FILTERS(state, value) {
      state.tickets = [];
      state.filters = [...value];
    },
    SET_SORT_BY(state, value) {
      state.tickets = [];
      state.sort_by = { ...value };
    },
    SET_SEARCH_BY(state, value) {
      // if (value && value.length) {
      //   state.tickets = [];
      // }
      state.search_by = value;
    },
    SET_GROUP_BY(state, value) {
      state.tickets = [];
      state.group_by = { ...value };
    },
    SET_TICKETS(state, list = []) {
      state.tickets = list;
    },
    REMOVE_TICKETS(state, uids = []) {
      _.remove(state.tickets, (ticket) => uids.includes(ticket.uid));
      state.tickets = Object.assign([], state.tickets);
      state.cluster_ticket_delete = uids;
    },
    UPDATE_MULTIPLE_TICKETS(state, payload = { uids: [], value: {} }) {
      let ticketIndex = _.map(payload.tickets, (uids) => _.findIndex(state.tickets, (ticket) => ticket.uid == uids));
      if (ticketIndex == -1) return;
      ticketIndex.forEach((ticketIndex) => {
        state.tickets[ticketIndex] = {
          ...state.tickets[ticketIndex],
          ...payload.value,
        };
      });
      state.tickets = Object.assign([], state.tickets);
    },
    UPDATE_OFFLINE_TICKETS(state, payload) {
      state.tickets.forEach((ticket) => (ticket.uid = payload[ticket.uid] ? payload[ticket.uid] : ticket.uid));
      state.tickets = Object.assign([], state.tickets);
    },
    UPDATE_TICKET(state, payload) {
      state.tickets[payload.index] = {
        ...state.tickets[payload.index],
        ...payload.value,
      };
      state.tickets = Object.assign([], state.tickets);
      state.cluster_ticket = { ...state.tickets[payload.index] };
    },
    ADD_TICKET_DETAILS(state, payload) {
      let ticketIndex = _.findIndex(state.tickets, (ticket) => ticket.uid == payload.uid);
      if (ticketIndex == -1) {
        state.tickets.push(payload);
        state.cluster_ticket = { ...payload };
      } else {
        state.tickets[ticketIndex] = {
          ...state.tickets[ticketIndex],
          ...payload,
        };
        state.cluster_ticket = { ...state.tickets[ticketIndex] };
      }
      state.tickets = Object.assign([], state.tickets);
    },
    ADD_NEW_TICKET(state, payload) {
      state.tickets.unshift(payload);
      state.tickets = Object.assign([], state.tickets);
      state.cluster_ticket = { ...payload };
    },
    SELECT_TICKET(state, uid) {
      state.selected.includes(uid) ? (state.selected = _.pull(state.selected, uid)) : state.selected.push(uid);
      state.selected = Object.assign([], state.selected);
    },
    CLEAR_SELECTED_TICKETS(state) {
      state.selected = [];
    },
    ADD_TOTAL_COUNT(state, payload) {
      state.tickets_total_count = payload;
    },
  },
  actions: {
    add_tickets({ commit }, payload) {
      payload.forEach((ticket) => {
        if (ticket && ticket.checklistsStats && ticket.checklistsStats.totalItems) {
          ticket["progress"] = Math.round(((ticket.checklistsStats.checkedItems || 0) / ticket.checklistsStats.totalItems) * 100);
        } else {
          ticket["progress"] = 0;
        }
      });
      commit("SET_TICKETS", payload);
    },
    async bulk_create_attachments({ commit, state }, payload) {
      return await ticketService.bulk_create_attachments(payload);
    },

    async update_ticket_value({ commit, state }, payload) {
      let index = state.tickets.findIndex((ticket) => ticket.uid === payload.id);
      var old_details = _.cloneDeep(state.tickets[index]);
      commit("UPDATE_TICKET", { index: index, value: payload.value });
      await ticketService
        .patch({
          id: payload.id,
          body: payload.value,
        })
        .catch((err) => {
          commit("UPDATE_TICKET", { index: index, value: old_details });
        });
    },

    async update_multiple_tickets({ commit }, payload) {
      if (payload.value.labels) {
        let e = payload.value.labels.add;
        let readLabels = e.filter((u) => u.access === "read").map((u) => u.uid);
        let writeLabels = e.filter((u) => u.access === "write").map((u) => u.uid);
        let teamsPayload = {
          uids: payload.tickets,
          value: {
            readLabels,
            writeLabels,
          },
        };
        commit("UPDATE_MULTIPLE_TICKETS", teamsPayload);
      } else if (payload.value.users) {
        let e = payload.value.users.add;
        let readUsers = e.filter((u) => u.access === "read");
        let writeUsers = e.filter((u) => u.access === "write");
        let usersPayload = {
          uids: payload.tickets,
          value: {
            readUsers,
            writeUsers,
          },
        };
        commit("UPDATE_MULTIPLE_TICKETS", usersPayload);
      } else if (payload.value.watchers) {
        let watchersPayload = {
          uids: payload.tickets,
          value: { watchers: payload.value.watchers.add },
        };
        commit("UPDATE_MULTIPLE_TICKETS", watchersPayload);
      } else if (payload.value.tags) {
        let tagsPayload = {
          uids: payload.tickets,
          value: { tags: payload.value.tags.add },
        };
        commit("UPDATE_MULTIPLE_TICKETS", tagsPayload);
      } else {
        commit("UPDATE_MULTIPLE_TICKETS", payload);
      }

      let updateObject = {};
      payload.tickets.forEach((uid) => {
        updateObject[uid] = payload.value;
      });

      await ticketService
        .bulk_update({
          body: { tickets: updateObject, strict: true },
        })
        .catch((err) => {
          console.log(err);
        });
    },
    async delete_multiple_tickets({ commit }, payload) {
      await ticketService
        .bulk_delete({
          body: { tickets: payload },
        })
        .catch(this.handleErrors);
      commit("REMOVE_TICKETS", payload);
      commit("CLEAR_SELECTED_TICKETS", payload);
    },
    remove_tickets({ commit }, payload) {
      commit("REMOVE_TICKETS", payload);
    },
    add_ticket_details({ commit }, payload) {
      if (payload && payload.checklistsStats && payload.checklistsStats.totalItems) {
        payload["progress"] = Math.round(((payload.checklistsStats.checkedItems || 0) / payload.checklistsStats.totalItems) * 100);
      } else {
        payload["progress"] = 0;
      }

      commit("ADD_TICKET_DETAILS", payload);
    },

    select_ticket({ commit }, uid) {
      if (uid) {
        commit("SELECT_TICKET", uid);
      } else {
        commit("CLEAR_SELECTED_TICKETS");
      }
    },
    async add_new_ticket({ commit }, payload) {
      let { data } = await ticketService.post({ body: payload }).catch((err) => {
        // this.handleErrors(err);
        console.log(err);
      });

      data.writeAccess = true;
      commit("ADD_NEW_TICKET", data);
      return data;
    },
    add_tickets_total_count({ commit }, payload) {
      commit("ADD_TOTAL_COUNT", payload);
    },
    add_realtime_ticket({ commit }, payload) {
      commit("ADD_NEW_TICKET", payload);
    },
  },
};

export default tickets;

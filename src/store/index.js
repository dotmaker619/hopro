import Vue from "vue";
import Vuex from "vuex";
// import { db } from "../main.js";
import izitoast_options from "@/desktop/shared/plugin-options/izitoast.json";
import tickets from "@/desktop/tickets/shared/ticket-store";
import forms from "@/desktop/forms/store/forms-store";
import processing from "@/desktop/processing/shared/processing-store";
import checklist from "@/desktop/tickets/shared/checklist-store";
const ALLOWED_ROLES = ["hacker", "manager_team"];
import vault from "@/desktop/vault/shared/vault-store.js";
import viewer from "@/mobile/viewer/shared/viewer-store.js";
import { apiService, organizationService, assetService } from "@/desktop/shared/services/";
import { set } from "idb-keyval";

Vue.use(Vuex);

let check_split_permissions = (treatment) => {
  if (treatment == "on") {
    return true;
  } else if (treatment == "off") {
    return false;
  } else {
    return true;
  }
};

export default new Vuex.Store({
  modules: {
    vault,
    tickets,
    checklist,
    viewer,
    processing,
    forms,
  },
  state: {
    // strict: process.env.NODE_ENV !== 'production',
    pass_keys: {},
    app_loading: false,
    izitoast_options: izitoast_options,
    current_organization: null,
    claims: null,
    user_claims: null,
    ALLOWED_ROLES: ALLOWED_ROLES, // complete access of core.
    QC_ALLOWED_ROLES: [...ALLOWED_ROLES, "qc_team", "gis_team"], // access qc actions.
    MISSION_ALLOWED_ROLES: [...ALLOWED_ROLES, "pilots"],
    PINNED_TABS: [],
    users: [],
    teams: [],
    TAGS: {},
    chat: {},
    PUSHER: null,
    RECENTLY_ACCESSED_RESOURCES: null,
    user_channel: null,
    org_channel: null,
    split_client: null,
    online_users: [],
    firebase_database: null,
    is_offline: false,
    org_element: null,
    background_sync: 0,
    assets: null,
    organization_list: null,
    go_offline: false,
  },
  mutations: {
    SET_ORGANIZATION_LIST(state, value) {
      state.organization_list = value;
    },
    SET_SYNC_STATUS(state, val) {
      state.background_sync = val;
    },
    SET_GO_OFFLINE(state, val) {
      state.go_offline = val;
      state.is_offline = val;
      set("offline_client", state.go_offline);
    },
    SET_OFFLINE_STATUS(state, val) {
      state.is_offline = state.go_offline ? state.go_offline : val;
    },
    SET_FIREBASE_DATABASE(state, value) {
      state.firebase_database = value;
    },
    SET_SPLIT_CLIENT(state, split_client) {
      state.split_client = split_client;
    },
    SET_RECENTLY_ACCESSED_RESOURCES(state, value) {
      state.RECENTLY_ACCESSED_RESOURCES = value;
    },
    SET_RECENTLY_ACCESSED(state, resourceType) {
      state.firebase_database
        .ref(`/userProfile/${state.claims.user_id}/organizations/${state.current_organization.uid}/recentlyAccessed/${resourceType}/`)
        .on("value", (snapshot) => {
          if (snapshot.val()) {
            if (!state.RECENTLY_ACCESSED_RESOURCES) state.RECENTLY_ACCESSED_RESOURCES = {};
            state.RECENTLY_ACCESSED_RESOURCES[resourceType] = snapshot.val();
          }
        });
    },
    SET_PUSHER(state, value) {
      state.PUSHER = value;
      state.user_channel = state.PUSHER.subscribe("presence-user_devices_" + state.claims.user_id);
      state.org_channel = state.PUSHER.subscribe("presence-users-org_" + state.current_organization.uid);
    },
    SET_STREAM_CHAT(state, value) {
      state.chat = value;
    },
    SET_TEAMS_AND_USERS(state, data) {
      if (data && data.length) {
        state.users = data[0].results;
        state.teams = data[1].results;
        if (window.is_mobile) state.TAGS = data[2];
      }
    },
    SET_TEAMS(state, data) {
      state.teams = [...(data ? data.results : [])];
    },
    ADD_NEW_TEAM(state, data) {
      console.log("ADD_NEW_TEAM", data);
      state.teams.push(data);
      state.teams = [...state.teams];
    },
    SET_USERS(state, data) {
      state.users = [...(data ? data.results : [])];
    },
    SET_PASS_KEY(state, payload) {
      state.pass_keys[payload.uid] = payload.value;
    },
    SET_APP_LOADING(state, value) {
      state.app_loading = value;
    },
    SET_CURRENT_ORGANIZATION(state, value) {
      if (!value) return;

      state.current_organization = value;
      window.$cookies.set(
        "user_organization",
        btoa(JSON.stringify(value)),
        "1y",
        "/",
        window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com"
      );
      let claims = { ...state.user_claims };
      //  SET COOKIE
      let current_org;

      const user_role = claims.user_role || {};
      const is_internal_user = state.claims && state.claims.user_role ? true : false;

      _.includes(state.ALLOWED_ROLES, user_role.name);
      let cookies_organization = window.$cookies.get("user_organization");
      if (cookies_organization) cookies_organization = JSON.parse(atob(cookies_organization));

      // user is internal and organization cookies exists
      if (is_internal_user) {
        current_org = cookies_organization || { uid: "", name: "All" };
      }
      // user has guest organizations access
      else if (claims.guest_organizations.length) {
        // organization cookies exists and its not the user_organization
        if (cookies_organization && cookies_organization.uid !== state.claims.user_organization.uid) {
          // check if cookies_organization is from guest_organizations list
          let guest_organization = claims.guest_organizations.find((o) => o.uid === cookies_organization.uid);
          // if not from guest_organizations list
          if (!guest_organization) {
            current_org = claims.user_organization;
          } else {
            // set claims persmission, teams, label etc from guest_organization
            claims = {
              ...claims,
              app_permissions: guest_organization.app_permissions,
              labels: guest_organization.labels,
              is_manager: false,
              is_owner: false,
            };
            current_org = {
              name: guest_organization.name,
              uid: guest_organization.uid,
            };
          }
        } else {
          current_org = claims.user_organization;
        }
      }
      // user is not internal and no organization cookies exists
      else {
        current_org = claims.user_organization;
      }

      // finally update the state and cookies
      state.current_organization = current_org;

      state.claims = claims;
      window.$cookies.set(
        "user_organization",
        btoa(JSON.stringify(current_org)),
        "1d",
        "/",
        window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com"
      );
      if (state.PUSHER) {
        state.org_channel = state.PUSHER.subscribe("presence-users-org_" + state.current_organization.uid);
      }
    },
    SET_ORGANIZATION_ELEMENT(state, payload) {
      state.org_element = payload;
    },
    SET_COOKIE_TOKEN(state, value) {
      if (!value || value === undefined || value === "undefined") {
        window.$cookies.remove("access_token", null, window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com");
        return;
      }
      window.$cookies.set("access_token", value, "1y", "/", window.location.hostname === "localhost" ? "localhost" : ".sensehawk.com");
    },
    SET_CLAIMS(state, value) {
      state.claims = value;
      state.user_claims = value;
    },
    SET_PINNED_TABS(state) {
      state.firebase_database
        .ref(`/userProfile/${state.claims.user_id}/organizations/${state.current_organization.uid}/pinnedTabs`)
        .once("value")
        .then((result) => {
          if (result.val()) state.PINNED_TABS = result.val();
          else state.PINNED_TABS = [];
        });
    },
    SET_INITIAL_TAGS(state, val) {
      state.TAGS = val;
    },
    SET_TAGS(state, value) {
      if (value) {
        state.TAGS = value;
        return;
      }
      try {
        if (state.current_organization) {
          state.firebase_database.ref(`/organizations/${state.current_organization.uid}/tags/`).on("value", (snapshot) => {
            if (snapshot.val()) state.TAGS = snapshot.val();
          });
        }
      } catch (err) {
        console.log(err);
      }
    },
    UPDATE_ONLINE_USERS(state, value) {
      state.online_users = value;
    },
    SET_ASSETS(state, val) {
      if (_.isArray(val)) {
        state.assets = val;
        set("asset_configuration", val);
      } else if (_.isObject(val)) {
        let index = state.assets.findIndex((f) => f.uid === val.uid);
        if (index !== -1) {
          state.assets[index] = { ...state.assets[index], ...val };
        } else {
          state.assets.unshift(val);
        }
        state.assets = [...state.assets];
      } else if (_.isString(val)) {
        _.remove(state.assets, (asset) => asset == val);
      }
    },
  },
  actions: {
    async connect_stream_chat({ state }) {
      state.chat.client.disconnect();
      try {
        await state.chat.client.setUser(
          {
            id: state.claims.user_id,
            email: state.claims.email,
            firstname: state.claims.firstname,
            lastname: state.claims.lastname,
            user_dp: state.claims.user_dp,
          },
          state.chat.token
        );
        return true;
      } catch (e) {
        return false;
        console.log(e);
      }
    },
    async set_tags({ commit, state }) {
      try {
        if (state.current_organization) {
          let snapshot = await state.firebase_database.ref(`/organizations/${state.current_organization.uid}/tags/`).once("value");
          if (snapshot.val()) {
            commit("SET_INITIAL_TAGS", snapshot.val());
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
    set_claims({ commit }, value) {
      commit("SET_CLAIMS", value);
    },
    set_users({ commit }, value) {
      commit("SET_USERS", value);
    },
    set_teams({ commit }, value) {
      commit("SET_TEAMS", value);
    },
    set_teams_and_users({ commit }, value) {
      commit("SET_TEAMS_AND_USERS", value);
    },
    async set_current_organization({ commit, state }, value) {
      commit("SET_CURRENT_ORGANIZATION", value);

      try {
        let details = await organizationService.get({
          id: state.current_organization.uid,
        });

        if (details.element && _.isString(details.element)) {
          let res = await apiService.get({ url: details.element });
          commit("SET_ORGANIZATION_ELEMENT", res.data);
        } else {
          commit("SET_ORGANIZATION_ELEMENT", details.element);
        }
      } catch (err) {
        return null;
      }
    },
    update_online_users({ commit }, value) {
      commit("UPDATE_ONLINE_USERS", value);
    },
    // async get_assets({ commit }, value) {
    //   let { results } = await assetService.getAssetsDashboard({ query: value });
    //   console.log("get assets", results);
    //   commit("SET_ASSETS", results);
    // },
  },
  getters: {
    state_users(state) {
      let data = {};
      state.users.forEach((u) => {
        data[u.uid] = u;
      });
      return data;
    },
    state_teams(state) {
      let data = {};
      state.teams.forEach((u) => {
        data[u.uid] = u;
      });
      return data;
    },
    is_loggedIn(state) {
      if (window.$cookies.get("access_token") && state.claims) return true;
      return false;
    },
    has_user_role(state) {
      if (state.claims && state.claims.user_role) return true;
      return false;
    },
    is_internal_user(state) {
      if (state.claims && state.claims.user_role) return _.includes(state.ALLOWED_ROLES, state.claims.user_role.name);
      return false;
    },
    is_qc_internal_user(state) {
      if (state.claims && state.claims.user_role) return _.includes(state.QC_ALLOWED_ROLES, state.claims.user_role.name);
      return false;
    },
    is_owner(state) {
      return state.claims && state.claims.is_owner ? true : false;
    },
    is_manager(state) {
      return state.claims && state.claims.is_manager ? true : false;
    },
    is_power_user(state) {
      return state.claims && state.claims.user_organization ? true : false;
    },
    is_org_user(state) {
      return state.claims && state.claims.user_organization && !(state.claims.is_owner || state.claims.is_manager);
    },
    is_basic_user(state) {
      return state.claims && !state.claims.user_organization && !state.claims.user_role ? true : false;
    },
    is_online(state) {
      let isOnline = new Set();
      state.org_channel.members.each((m) => {
        isOnline.add(m.id);
      });

      return isOnline;
    },
    has_missions_permissions(state) {
      if (state.claims && state.claims.app_permissions) return state.claims.app_permissions.missions ? true : false;
      return false;
    },
    has_processing_permissions(state) {
      if (state.claims && state.claims.app_permissions) return state.claims.app_permissions.processing ? true : false;
      return false;
    },
    has_terra_permissions(state) {
      if (state.claims && state.claims.app_permissions) return state.claims.app_permissions.terra ? true : false;
      return false;
    },
    has_therm_permissions(state) {
      if (state.claims && state.claims.app_permissions) return state.claims.app_permissions.therm ? true : false;
      return false;
    },
    has_download_reports_permissions(state) {
      if (state.claims && state.claims.app_permissions && state.claims.app_permissions.core && state.claims.app_permissions.core.length)
        return _.includes(state.claims.app_permissions.core, "can_download_report");
      return false;
    },
    has_gis_tools_permissions(state) {
      if (state.claims && state.claims.app_permissions) return state.claims.app_permissions.access_gis_tools ? true : false;
      return false;
    },

    // Split permissions
    new_raw_upload_flow(state) {
      if (state.split_client && state.claims) {
        return check_split_permissions(state.split_client.getTreatment("new_raw_image_uploads", state.claims));
      }
      return false;
    },
    tickets_clustering(state) {
      if (state.split_client && state.claims) {
        return check_split_permissions(state.split_client.getTreatment("tickets_clustering", state.claims));
      }
      return false;
    },
    is_push_notifications(state) {
      if (state.split_client && state.claims) {
        return check_split_permissions(state.split_client.getTreatment("push_notifications", state.claims));
      }
      return false;
    },
    asset_configuration(state) {
      if (state.split_client && state.claims) {
        return check_split_permissions(state.split_client.getTreatment("asset_configuration", state.claims));
      }
      return false;
    },
    upload_third_party_providers(state) {
      if (state.split_client && state.claims) {
        return check_split_permissions(state.split_client.getTreatment("upload_third_party_providers", state.claims));
      }
      return false;
    },
    annotation_tools(state) {
      if (state.split_client && state.claims) {
        return check_split_permissions(state.split_client.getTreatment("annotation_tools", state.claims));
      }
      return false;
    },
    is_show_dashboard_tickets_chart_widget(state) {
      if (state.split_client) {
        return check_split_permissions(state.split_client.getTreatment("show_dashboard_tickets_chart_widget", state.claims));
      }
    },
    is_show_intercom_support(state) {
      if (state.split_client) {
        return check_split_permissions(state.split_client.getTreatment("show_intercom_support", state.claims));
      }
    },
    vault_files_bulk_actions(state) {
      if (state.split_client) {
        return check_split_permissions(state.split_client.getTreatment("vault_files_bulk_actions", state.claims));
      }
    },
    download_files_zip(state) {
      if (state.split_client) {
        return check_split_permissions(state.split_client.getTreatment("download_files_zip", state.claims));
      }
    },
    ticket_replication_features(state) {
      if (state.split_client) {
        return check_split_permissions(state.split_client.getTreatment("ticket_replication_features", state.claims));
      }
    },
    app_debug_mode(state) {
      if (state.split_client) {
        return check_split_permissions(state.split_client.getTreatment("debug", state.claims));
      }
    },
  },
});

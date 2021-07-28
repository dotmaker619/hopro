import { folderService } from "@/desktop/shared/services/";

function filterQueryString(state) {
  let val = state.vault_filters;
  let str = "";
  str += getQueryString(val.owners.map(u => u.uid), "owners");
  str += getQueryString(val.users.map(u => u.uid), "users");
  str += getQueryString(val.teams.map(u => u.uid), "labels");
  str += getQueryString(val.tags, "tags");
  str += getQueryString(val.assets, "asset");
  str += val.bookmark ? `&bookmark=` + val.bookmark : '';
  str += val.archive ? `&archive=` + val.archive : '';
  str += val.share ? `&shared=` + val.share : '';
  return str;
}
function getQueryString(arr, query) {
  let str = "";
  if (arr && arr.length) {
    arr.forEach((val) => {
      str += `&${query}=` + val;
    });
  }
  return str;
}

function set_files_folders(state) {
  state.selected_files = [];
  state.selected_folders = [];

  state.selected.forEach(item => {
    if (item && item.hasOwnProperty('parent')) {
      !state.selected_folders.includes(item.uid) ? state.selected_folders.push(item.uid) : ''
    } else {
      !state.selected_files.includes(item.uid) ? state.selected_files.push(item.uid) : ''
    }
  })
}

const vault = {
  namespaced: true,
  state: {
    element: null,
    // data  
    vault_folders: [],
    vault_files: [],
    // active folder
    current_folder_uid: null,
    current_folder: {},

    compact_view: true,
    is_internal: false,

    // 
    search_keys: "",
    info_tab: { active: false, type: "file", tab: "info", uid: null },
    view_type: "list",
    // attachment selection
    selected_files: [],
    selected_folders: [],
    last_selected: -1,
    selected: [],
    // vault dashboard top filters
    group_by: { label: "None", key: null, filter_key: null, enable: true },
    show_filter: { label: "All", key: null, filter_key: null, enable: true },
    selected_asset: [],
    vault_filters: {
      assets: [],
      users: [],
      teams: [],
      owners: [],
      archive: false,
      bookmark: false,
      share: false,
      tags: [],
      owned_by_me: null
    },
    filter_query: ''
  },
  mutations: {
    DRAG_SELECT(state, items) {
      state.selected = [];
      state.selected_files = [];
      state.selected_folders = [];
      state.selected = items.map(comp => {
        return comp.item
      });
      if (state.selected.length) {
        state.last_selected = state.selected[state.selected.length - 1];
      } else {
        state.last_selected = -1;
      }
      set_files_folders(state)
    },
    TOGGLE_SELECTION(state, item) {
      console.log("toggle");
      let exists = state.selected.filter(f => f.uid == item.uid).length ? true : false;
      console.log(exists)
      let selected = [...state.selected];
      if (exists) {
        _.remove(selected, existingitem => existingitem == item);
        if (!state.selected.length > 0) {
          state.last_selected = -1;
        }
      } else {
        selected.push(item);
        state.last_selected = item;
      }
      state.selected = selected;
      console.log("selected", state.selected);
      set_files_folders(state)
    },
    SHIFT_SELECTION(state, data) {

      let all_items = data.all_items;
      let lastIndex = all_items.findIndex(
        f => f == state.last_selected
      );
      let currentIndex = all_items.findIndex(f => f == data.item);
      let min = Math.min(lastIndex, currentIndex);
      let max = Math.max(lastIndex, currentIndex);
      console.log("min,max: ", min, max);
      let selected = []
      for (let i = min; i <= max && i < all_items.length; i++) {
        console.log("index", i);
        console.log(all_items[i])
        selected.push(all_items[i]);
      }
      console.log("union", _.union(state.selected, selected));
      state.selected = (_.union(
        state.selected,
        selected
      ))
      state.last_selected = data.item;
      set_files_folders(state)
    },
    SET_IS_INTERNAL(state, value) {
      state.is_internal = value;
    },
    SET_CURRENT_FOLDER_UID(state, value) {
      state.current_folder_uid = value;
    },
    SET_ELEMENT(state, value) {
      state.element = value
    },
    SET_CURRENT_FOLDER(state, value) {
      state.current_folder = value;
    },
    SET_VAULT_FILES(state, value) {
      state.vault_files = value
    },
    SET_VAULT_FOLDERS(state, value) {
      state.vault_folders = value
    },
    SET_SELECTED_FILES(state, val) {
      state.selected_files = val;
    },
    SET_SELECTED_FOLDERS(state, val) {
      state.selected_folders = val;
    },
    SET_LAST_SELECTED(state, val) {
      state.last_selected = val;
    },
    REMOVE_FOLDER(state, items_to_remove = []) {
      _.remove(state.vault_folders, (folder) => items_to_remove.includes(folder.uid));
      state.vault_folders = [...state.vault_folders]
    },
    REMOVE_FILE(state, items_to_remove = []) {
      _.remove(state.vault_files, (file) => items_to_remove.includes(file.uid));
      state.vault_files = [...state.vault_files];
    },

    UPDATE_FOLDER_DETAILS(state, details) {
      let index = state.vault_folders.findIndex((f) => f.uid === details.uid);
      
      if (index !== -1) {
        state.vault_folders[index] = { ...state.vault_folders[index], ...details };
      } else {
        // Adding new folder 
        if(state.current_folder.uid==details.uid){
          // console.log("updating current ... folder",details)
          state.current_folder={...state.current_folder,...details}
        }else{
          state.vault_folders.unshift(details)
        }
      }
      state.vault_folders = [...state.vault_folders];
      folderService.update_recents_list('vault-folders', details.uid)
    },
    UPDATE_FILE_DETAILS(state, details) {
      let index = state.vault_files.findIndex((f) => f.uid === details.uid);
      if (index !== -1) {
        state.vault_files[index] = { ...state.vault_files[index], ...details };
      } else {
        //Adding new file
        state.vault_files.unshift(details)
      }
      state.vault_files = [...state.vault_files];

      folderService.update_recents_list('vault-files', details.uid)

    },
    UPDATE_FILES_BULK(state, data) {
      let files_obj = _.keyBy(data.success, 'uid');
      state.vault_files = state.vault_files.map(element => {
        return { ...element, ...(files_obj[element.uid] || {}) }
      });
      state.vault_files = state.vault_files.filter(f => !f.archive && f.folder === state.current_folder.uid)
    },
    UPDATE_FOLDERS_BULK(state, data) {
      let files_obj = _.keyBy(data.success, 'uid');
      state.vault_folders = state.vault_folders.map(element => {
        return { ...element, ...(files_obj[element.uid] || {}) }
      });
      if (data.is_remove) {
        let to_remove_uids = data.success.map(f => f.uid)
        console.log(to_remove_uids)
        _.remove(state.vault_folders, f => to_remove_uids.includes(f.uid))
      }
      state.vault_folders = state.vault_folders.filter(f => !f.archive)
    },
    SET_VIEW_TYPE(state, val) {
      state.view_type = val;
    },
    SET_INFO_TAB(state, val) {
      state.info_tab = { ...state.info_tab, ...val };
      if (val.active) {
        if (val.type == 'file') {
          folderService.update_recents_list('vault-files', val.file.uid);
        } else if (val.type == 'folder') {
          folderService.update_recents_list('vault-folders', val.folder.uid);
        }
      }
    },
    SET_COMPACT_VIEW(state, val) {
      state.compact_view = val;
    },

    SET_SEARCH_KEYS(state, val) {
      state.search_keys = val;
    },
    SET_GROUP_BY(state, value) {
      state.group_by = { ...value };
    },
    SET_SHOW_FILTER(state, value) {
      state.show_filter = { ...value };
    },
    SET_SELECTED_ASSET(state, value) {
      state.selected_asset = [...(value || [])];
      state.vault_filters.assets = [...state.selected_asset]
    },
    SET_VAULT_FILTERS(state, val) {
      if (val == 'reset') {
        state.vault_filters = {
          assets: [],
          users: [],
          teams: [],
          owners: [],
          archive: false,
          bookmark: false,
          share: false,
          tags: [],
          owned_by_me: null
        }
        state.filter_query = '';
        return;
      }
      state.vault_filters = { ...val }
      state.filter_query = filterQueryString(state);
    },
    SET_QUERY(state, val) {
      state.filter_query = val;
    },
  },
  actions: {
    async SHIFT_SELECTION({ state, commit }, data) {
      if (state.last_selected !== -1) {
        commit("SHIFT_SELECTION", data);
      } else {
        commit("TOGGLE_SELECTION", data.item);
      }
    },
  },
};
export default vault;

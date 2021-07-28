
const viewer = {
  strict: true,
  namespaced: true,
  state: {
    details: {},
    map: null,
    layer_data: {},
    active_layer: null,
    feature_types: [],
    feature_type_filters: [],
    selected_feature_id: null,
    is_viewer_loading: true,
    extra_property_filters: {
      selected_key: "",
      selected_values: [],
    },
    cluster_tickets: [],
  },
  mutations: {
    RESET_STORE(state) {
      state.details = {};
      state.map = null;
      state.layer_data = {};
      state.active_layer = null;
      state.feature_types = [];
      state.feature_type_filters = [];
      state.selected_feature_id = null;
      state.is_viewer_loading = true;
      state.extra_property_filters = {
        selected_key: "",
        selected_values: [],
      };
      state.cluster_tickets = [];
    },
    SET_CLUSTER_TICKETS(state, value) {
      state.cluster_tickets = value;
    },
    UPDATE_OFFLINE_CLUSTER_TICKETS(state, value) {
      state.cluster_tickets.forEach(
        (ticket) =>
          (ticket.uid = value[ticket.uid] ? value[ticket.uid] : ticket.uid)
      );
      console.log(state.cluster_tickets);
      state.cluster_tickets = Object.assign([], state.cluster_tickets);
    },
    SET_EXTRA_PROPERTY_FILTERS(state, value) {
      state.extra_property_filters = value;
    },
    SET_IS_VIEWER_LOADING(state, value) {
      state.is_viewer_loading = value;
    },
    SET_MAP(state, value) {
      state.map = value;
    },
    SET_DETAILS(state, value) {
      state.details = value;
    },
    SET_LAYER_DATA(state, value) {
      state.layer_data = { ...value };
    },
    SET_ACTIVE_LAYER(state, value) {
      state.active_layer = value;
    },
    SET_FEATURE_TYPES(state, value) {
      state.feature_types = value;
    },
    SET_FEATURE_TYPE_FILTERS(state, value) {
      state.feature_type_filters = value;
    },
    SET_SELECTED_FEATURE_ID(state, value) {
      state.selected_feature_id = value;
    },
  },
  actions: {},
  getters: {
    all_features(state) {
      let features = [];
      Object.values(state.layer_data).forEach((layer) => {
        if (layer.is_features)
          features.push(
            ...(layer.features || []).filter((f) => {
              return (
                (state.feature_type_filters.length
                  ? !state.feature_type_filters.includes(
                      f.properties.featureTypeId
                    )
                  : true) &&
                (state.extra_property_filters.selected_key &&
                state.extra_property_filters.selected_values.length
                  ? state.extra_property_filters.selected_values.includes(
                      f.properties.extraProperties[
                        state.extra_property_filters.selected_key
                      ]
                    )
                  : true)
              );
            })
          );
      });
      return features;
    },
    feature_count(state, getters) {
      return _.countBy(getters.all_features, (f) => f.properties.featureTypeId);
    },
    selected_feature(state, getters) {
      return (getters.all_features || []).find((f) => {
        if (state.selected_feature_id && f.properties.custom_feature_id)
          return state.selected_feature_id == f.properties.custom_feature_id;
        return false;
      });
    },
    selected_feature_element(state, getters) {
      if (
        getters.selected_feature &&
        !_.isString(getters.selected_feature.properties.element)
      ) {
        let centroid = turf.centroid(getters.selected_feature);
        return {
          ...getters.selected_feature.properties.element,
          centroid: centroid.geometry.coordinates,
        };
      }
      return getters.selected_feature;
    },
  },
};

export default viewer;

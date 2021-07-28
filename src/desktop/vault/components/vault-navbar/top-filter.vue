<template>
<!-- :class="{ 'is-hidden': $route.name.includes('viewer') }" -->
  <div class="vault-top-filters my-10" :class="{'my-20':!is_viewer_small}" >
    <div class="left">
      <template v-if="!is_viewer_small">
        <div class="each-filter is-medium-16-500-19">
        {{ header }}
        <a v-if="$store.getters.is_internal_user" @click="is_internal = !is_internal" class="left-internal-filter" :class="{ 'active': is_internal }"
          >Internal</a
        >
      </div>
      <div class="each-filter" v-if="!$route.path.includes('application')">
        <AssetDropdown :from="'vault-dashboard'" />
      </div>
      </template>
      <div class="each-filter">
        <FiltersDropdown :data="show_filters" :filters="show" :type="'show'" :header="'Show'" />
      </div>
    </div>
    <div class="right mr-15">
      <div class="each-filter" v-if="!$route.query.recents && !is_viewer_small">
        <FiltersDropdown :data="groupby" :filters="group_by" :type="'groupby'" :header="'Group by'" />
      </div>
      <div class="each-filter is-flex align-center" v-if="is_viewer_small">
        <p @click="open_filter = !open_filter" class="is-pointer is-flex is-vcenter">
          <span class="is-medium-14-500-17 has-opacity-5 mr-5"> Filters: </span>
          <span class="is-semiBold-14-600-17 is-pointer is-flex is-vcenter">
            {{ filter_query ? "Selected" : "None" }}
            <sh-icon :name="`${open_filter ? 'expand' : 'collapse'}`" class="is-16x16 is-pointer"></sh-icon>
          </span>
        </p>
        <filter-card 
          v-click-outside="() => (open_filter = false)"
          style="position:relative;right:26rem;"
          v-if="open_filter"
          @close_filter="open_filter = false"
        ></filter-card>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters } from "vuex";
  import FilterCard from "@/desktop/vault/components/vault-navbar/components/vault-filter-card";
  import AssetDropdown from "@/desktop/tickets/components/tickets-list/components/tickets-top-filters/components/asset-dropdown";
  import FiltersDropdown from "./components/single-select-dropdown";
  export default {
    components: {
      FiltersDropdown,
      AssetDropdown,
      FilterCard
    },
    props: ["header","is_viewer_small"],
    methods: {
      ...mapMutations("vault", ["SET_INFO_TAB", "SET_VIEW_TYPE", "SET_GROUP_BY", "SET_SHOW_FILTER"]),
    },
    computed: {
      ...mapState("vault", ["view_type", "info_tab", "show_filter", "group_by","filter_query"]),
      is_internal: {
        get() {
          return this.$store.state.vault.is_internal;
        },
        set(value) {
          this.$store.commit("vault/SET_IS_INTERNAL", value);
        },
      },
    },
    data() {
      return {
        open_filter: false,
        show_filters: [
          { label: "All", key: null, filter_key: null, enable: true },
          {
            label: "Files",
            key: "files.value",
            filter_key: "files",
            enable: true,
          },
          {
            label: "Folders",
            key: "folders.value",
            filter_key: "folders",
            enable: true,
          },
        ],
        groupby: [
          { label: "None", key: null, filter_key: null, enable: true },
          {
            label: "Type",
            key: "fileType",
            filter_key: "type",
            enable: true,
          },
          {
            label: "Tags",
            key: "tags",
            filter_key: "tags",
            enable: true,
          },
          {
            label: "Owner",
            key: "owner.uid",
            filter_key: "owner",
            enable: true,
          },
          // { label: "Raised", key: "owner.uid", filter_key: "owner" },
          // { label: "Assignee", key: "takenUp.uid", filter_key: "takenUp" },
          // { label: "Progress", key: "meta.itemsChecked", filter_key: "meta" },
          // { label: "Due date", key: "dueDate", filter_key: "dueDate" }
        ],
      };
    },
  };
</script>

<style lang="scss">
  .vault-top-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .header {
      align-items: center;
    }
    .left {
      // flex: 0 1 55%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .each-filter {
        margin: 0 1rem;
      }
      &-heading {
        font-family: Barlow-Medium;
        font-size: 16px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.19;
        letter-spacing: normal;
        text-align: left;
        color: $primary-text;
      }
      &-internal-filter {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 10px;
        width: 74px;
        height: 30px;
        border-radius: 6px;
        border: solid 1px rgba(91, 96, 126, 0.3);
        background-color: white;
        opacity: 0.7;
        font-family: Barlow-SemiBold;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.21;
        text-align: left;
        color: #171e48;
        &.active {
          background: #171e48;
          color: white;
        }
      }
    }
    .right {
      display: flex;
    }
    .heading-1 {
      opacity: 0.4;
      font-family: Barlow-Medium;
      font-size: 14px;
      font-weight: 500;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
    }
    .heading-2 {
      margin-left: 7px;
      margin-right: 7px;
      font-family: Barlow-SemiBold;
      font-size: 14px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
      cursor: pointer;
    }

    .dropdown-content {
      border-radius: 12px;
      box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      border: solid 1px rgba(23, 30, 72, 0.15);
      background-color: white;
      .dropdown-item {
        padding-right: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        font-family: Barlow-Medium;
        font-size: 16px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: 3.13;
        letter-spacing: normal;
        text-align: left;
        color: #171e48;
        &:hover {
          background-color: #f4f6fe;
        }
      }
    }
  }
</style>

<template>
  <div @mouseleave="close_dropdown(item.uid)" class="user-group-list-items">
    <div class="show-project-icon" @click="show_projects = !show_projects">
      <sh-icon v-if="!show_projects" :name="'group-right-arrow'" class="is-15x15"></sh-icon>
      <sh-icon v-else :name="'group-right-arrow-expand'" class="is-15x15"></sh-icon>
    </div>
    <div class="columns is-flex align-center">
      <div class="column is-3">
        <router-link :to="{name: 'asset-details', params:{id:item.uid}}" class="has-text-dark">
          <main-details-media
            :info="{
            name: item.name,
            subtext: item.project_counts +  ' projects',
            name_class: 'is-medium-16-500-19 has-primary-text',
            subtext_class: 'is-medium-14-500-17 has-primary-text has-opacity-7',
            properties: item.properties,
          }"
            :hideImage="false"
          ></main-details-media>
        </router-link>
      </div>
      <div class="column is-3">
        <primary-tag
          :tags="item.asset ? [item.asset] : null"
          :type="'asset'"
          :noTopMargin="true"
          :truncate_length="5"
        ></primary-tag>
      </div>
      <div class="column is-3">
        <primary-tag
          :tags="item.container ? [item.container] : null"
          :type="'container'"
          :noTopMargin="true"
          :truncate_length="5"
        ></primary-tag>
      </div>
      <div class="column is-flex align-center is-between is-3">
        <div class="is-flex">
          <div class="mr-10 is-flex is-vcenter">
            <span
              class="sh-access-tag"
              :class="{'sh-access-tag--read' : (item.access === 'read' || item.access === 'write')}"
            >
              <i class="fa fa-check" aria-hidden="true" />
            </span>
            <span class="ml-5 is-regular-12-00-14 has-text-theme-black has-opacity-7">Read</span>
          </div>

          <div class="is-flex is-vcenter">
            <span class="sh-access-tag" :class="{'sh-access-tag--write' : item.access === 'write'}">
              <i class="fa fa-check" aria-hidden="true" />
            </span>
            <span class="ml-5 is-regular-12-00-14 has-text-theme-black has-opacity-7">Write</span>
          </div>
        </div>
        <div v-if="!$store.getters.is_org_user" class="user--grouplist--drop">
          <sh-icon
            @click.native="drop_group(item)"
            v-tooltip="{content : 'Remove group'}"
            :name="'close'"
            :file="'helper_sprite'"
            class="is-16x16 mr-10 is-pointer"
          ></sh-icon>
        </div>
      </div>
    </div>
    <keep-alive>
      <group-project-list v-if="show_projects" :group_id="item.uid"></group-project-list>
    </keep-alive>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="item.uid"
      :resourceName="item.name"
      :resourceType="'group'"
      :resourceService="groupService"
      @closed="showDeleteModal=false"
      @deleted="$emit('refresh-group-list')"
    />
  </div>
</template>

<script>
import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import shDropdown from "@/desktop/shared/components/sh-dropdown";
import GroupProjectList from "@/desktop/core/components/group/group-list/components/group-project-list";
import {
  groupService,
  userService,
  containerService,
} from "@/desktop/shared/services/";

export default {
  props: ["item", "groupService", "owner"],
  components: {
    MainDetailsMedia,
    PrimaryTag,
    shDropdown,
    GroupProjectList,
  },
  data() {
    return {
      show_projects: false,
      ownerDetails: null,
    };
  },
  created() {
    this.get_owner();
  },

  computed: {
    hideInfoBlockImage() {
      return this.$route.name == "user-group-list" ? false : true;
    },
    isResourceList() {
      if (this.$route.name === "user-group-list") return true;
      return false;
    },
    showUnassign() {
      return !(
        this.$route.name === "container-details" ||
        this.$route.name === "asset-details-groups"
      );
    },
  },
  methods: {
    async get_owner() {
      let result = await userService.get({ id: this.owner });
      if (result) this.ownerDetails = result;
    },

    close_dropdown(uid) {
      if (this.$refs[uid] && this.$refs[uid].active)
        this.$refs[uid].active = false;
    },

    drop_group() {
      this.$parent.$emit("updateDetails");
      userService
        .post({
          id: this.$route.params.id,
          attribute: "groups/unassign",
          body: [{ uid: this.item.uid }],
        })
        .then(() => {
          this.get_owner();
          this.$eventHub.$emit("refresh-details");
          this.$eventHub.$emit("refresh-group-list");
        })
        .catch((err) => this.handleErrors());
    },
  },
};
</script>

<style lang="scss" scoped>
.user-group-list-items {
  position: relative;
  .user--grouplist--drop {
    visibility: hidden;
  }

  &:hover {
    .user--grouplist--drop {
      visibility: visible;
    }
  }
}
</style>
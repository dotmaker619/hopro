<template>
  <div class="is-relative">
    <div class="show-project-icon" @click="show_projects = !show_projects" v-click-outside="() => (hover = false)">
      <sh-icon v-if="!show_projects" :name="'group-right-arrow'" class="is-15x15"></sh-icon>
      <sh-icon v-else :name="'group-right-arrow-expand'" class="is-15x15"></sh-icon>
    </div>
    <div class="columns" @mouseleave="close_dropdown(item.uid)" @mouseenter="hover = true">
      <div class="column is-3">
        <router-link :to="{ name: 'group-details', params: { id: item.uid } }" class="has-text-theme-black">
          <main-details-media
            :truncate_value="'15'"
            :info="{
              name: item.name,
              subtext: item.project_counts + ' Projects',
              name_class: 'is-semiBold-16-600-19 name-highlights-on-hover',
              subtext_class: 'is-medium-14-500-17 has-opacity-7 mt-5',
              properties: item.properties,
            }"
          ></main-details-media>
        </router-link>
      </div>
      <div class="column is-flex align-center " :class="[$route.name !== 'asset-details-groups' ? 'is-3' : 'is-4']">
        <user-avatar :user="item.owner" :pxsize="30" class="mr-10"></user-avatar>
        <span class="is-medium-14-500-17 has-text-new-grey truncate-text is-width-15" v-username="item.owner"></span>
      </div>
      <div class="column" v-if="$route.name !== 'asset-details-groups'">
        <primary-tag :tags="item.asset ? [item.asset] : null" :type="'asset'"></primary-tag>
      </div>
      <div class="column" v-if="$route.name !== 'container-details'">
        <primary-tag :tags="item.container ? [item.container] : null" :type="'container'"></primary-tag>
      </div>
      <div class="column is-flex is-between align-center" >
        <div>
          <assigned-tags :tags="item.tags" :write_access="false" :number_of_tags_to_display="2" v-if="item.tags && item.tags.length" />
          <div v-else class="is-flex align-center">
            <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
            <span class="is-regular-14-00-17 not-assigned">*No tags assigned</span>
          </div>
        </div>
        <div>
          <transfer-owner
            ref="groupListTransferOwner"
            :name="item.name"
            :service="groupService"
            :id="item.uid"
            @update_user="$emit('update-group-owner', $event)"
          ></transfer-owner>
        </div>
        <div>
          <div :class="{ 'is-hidden': !hover }" class="margin-auto">
            <sh-dropdown :triggerIsIcon="true" :ref="item.uid">
              <div slot="content">
                <p @click="$emit('edit')"><sh-icon :name="'edit-small'" class="is-24x24 mr-10"></sh-icon>Edit Group</p>
                <p @click="$refs.groupListTransferOwner.open_popup()">
                  <sh-icon :name="'transfer-2'" class="is-24x24 mr-10"></sh-icon>Transfer ownership
                </p>
                <p @click="showDeleteModal = true"><sh-icon :name="'delete-small'" class="is-24x24 mr-10"></sh-icon>Delete group</p>
              </div>
            </sh-dropdown>
          </div>
        </div>
      </div>
    </div>
    <keep-alive>
      <group-project-list v-if="show_projects" :group_id="item.uid" @update_project_count="item.project_counts = $event"></group-project-list>
    </keep-alive>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="item.uid"
      :resourceName="item.name"
      :resourceType="'group'"
      :resourceService="groupService"
      @closed="showDeleteModal = false"
      @deleted="$emit('refresh-group-list')"
    />
  </div>
</template>

<script>
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import GroupProjectList from "../components/group-project-list";
  import { groupService } from "@/desktop/shared/services/";

  export default {
    props: ["item", "groupService", "owner"],
    components: {
      MainDetailsMedia,
      PrimaryTag,
      AssignedTags,
      shDropdown,
      GroupProjectList,
    },
    data() {
      return {
        show_projects: false,
        hover: false,
      };
    },
    methods: {
      close_dropdown(uid) {
        if (this.$refs[uid] && this.$refs[uid].active) {
          this.hover = true;
        } else {
          this.hover = false;
        }
      },
    },
  };
</script>
<style lang="scss">
  .show-project-icon {
    position: absolute;
    left: -2.5rem;
    min-height: 6rem;
    display: flex;
    align-items: center;
    color: #5c617e;
    cursor: pointer;
  }
</style>

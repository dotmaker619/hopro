<template>
  <div class="sh-list__item padding-20">
    <div class="columns">
      <div class="column is-narrow is-pointer" @click="active = !active">
        <i class="fas fa-chevron-right"></i>
      </div>
      <div class="column" :class="[$route.name == 'group-details-processing' ? 'is-2' : 'is-3']">
        <router-link :to="{ name: 'processing-config', params: { id: item.uid } }" class="has-text-dark">
          <info-block
            :info="{
              type: 'projectManagement',

              'name': item.name.split('$$')[1],
              'name_class': 'is-semiBold-16-600-19 ',
              'bottom_class': 'is-medium-14-500-17 has-text-theme-grey mt-5 has-opacity-7',
              'bottom': item.no_of_images + ' images',
            }"
            :hideImage="true"
          ></info-block>
        </router-link>
      </div>
      <div class="column is-1" v-if="$route.name != 'group-details-processing'">
        <info-block
          :info="{
            'name': 'Group',
            'top': 'Group',
            'top_class': 'mb-5',
            type: 'projectManagement',
          }"
          :hideImage="true"
        ></info-block>
      </div>
      <div class="column is-2">
        <p class="is-regular-14-00-17 has-text-theme-grey mb-10">Project Type</p>
        <p class="is-medium-16-500-19 has-text-theme-black is-marginless is-capitalized">{{ item.project_type }}</p>
      </div>
      <div class="column" :class="[$route.name == 'group-details-processing' ? 'is-3' : 'is-2']">
        <info-block
          v-if="$store.getters.state_users[item.owner.uid]"
          :info="{
            'name': `${$store.getters.state_users[item.owner.uid].first_name} ${$store.getters.state_users[item.owner.uid].last_name}`,
            'top': 'Created By',
            'top_class': 'mb-5',
            'name_class': 'is-medium-16-500-19 has-text-theme-black',
            'image': $store.getters.state_users[item.owner.uid].display_picture,
            type: 'userManagement',
          }"
        ></info-block>
        <info-block
          :unknown="true"
          v-else-if="item.owner && item.owner.uid"
          :info="{
            'name': item.owner.email.includes('@sensehawk') ? 'Sensehawk' : 'Unknown',
            'top': 'Created By',
            'top_class': 'mb-5',
            'name_class': 'is-medium-16-500-19 has-text-theme-black',
            'type': 'userManagement',
          }"
        ></info-block>
      </div>
      <div class="column" :class="[$route.name == 'group-details-processing' ? 'is-3' : 'is-2']">
        <p class="is-regular-14-00-17 has-text-theme-grey mb-10">Created on</p>
        <p class="is-medium-16-500-19 has-text-theme-black is-marginless is-capitalized no-whitespace-wrap is-uppercase">
          {{ item.created_at | dateFormat }}
        </p>
      </div>
      <div class="column is-1">
        <p class="is-regular-14-00-17 has-text-theme-grey mb-10 mr-5">Status</p>
        <p class="is-medium-16-500-19 has-text-theme-black processing" :class="'processing--' + item.status">{{ item && item.status }}</p>
      </div>

      <div class="column is-narrow margin-auto">
        <div class="asset-dropdown " v-click-outside="() => (dropdown == item.uid ? (dropdown = -1) : null)">
          <div class="asset-dropdown-selection sh-list__item--icon" @click="dropdown == -1 ? (dropdown = item.uid) : (dropdown = -1)">
            <sh-icon :name="'3-dots-menu'" class="is-20x20"></sh-icon>
          </div>
          <div class="asset-dropdown-content" v-if="dropdown == item.uid">
            <router-link :to="{ name: 'processing-config', params: { id: item.uid } }" tag="p" class="is-flex">
              <sh-icon :name="'expand-leftside'" class="is-16x16 mr-10"></sh-icon>

              Go to Process
            </router-link>

            <p @click="showDeleteModal = true">
              <sh-icon :name="'trash'" class="is-16x16 mr-10"></sh-icon>

              Delete Process
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="details" v-if="active">
      <keep-alive>
        <processing-list-details :process="item.uid"></processing-list-details>
      </keep-alive>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="item.uid"
      :resourceName="item.name"
      :resourceType="'processing'"
      :resourceService="processingService"
      @closed="showDeleteModal = false"
      @deleted="$emit('refresh-processing-list')"
    />
  </div>
</template>

<script>
  import InfoBlock from "@/desktop/shared/components/info-block";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import { processingService } from "@/desktop/shared/services/";
  import ProcessingListDetails from "./processing-list-details";

  export default {
    props: ["item"],
    components: {
      InfoBlock,
      shDropdown,
      ProcessingListDetails,
    },

    data() {
      return {
        active: false,
        processingService: processingService,
        dropdown: -1,
      };
    },
    methods: {
      close_dropdown(uid) {
        if (this.$refs[uid].active) this.$refs[uid].active = false;
      },
    },
  };
</script>
<style lang="scss">
  .router-group-details {
    .router-process-management-main {
      .sh-list {
        min-width: -webkit-fill-available;
      }
    }
  }
</style>

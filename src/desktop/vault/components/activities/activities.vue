<template>
  <div class="is-flex is-center is-relative mb-40">
    <div class="overall-activity mt-40" v-if="activities.length">
      <div
        class="mt-20 activity-group has-background-white is-center"
        v-for="(activities_data,i) in activities"
        :key="i"
      >
        <div
          class="activity-header has-background-white pt-20 pb-15 pl-25 pr-20"
          style="border-bottom: 1px solid #dde;"
        >
          <div class="is-flex align-center has-space-between">
            <div class="is-medium-14-500-17">
              <div
                :class="{'is-pointer' : !item_deleted(activities_data)}"
                class="is-inline-flex mt-5 align-center"
                v-if="activities_data.group.includes('folder')"
                @click="redirect_user_to_folder(activities_data)"
              >
                <sh-icon :file="'vault_sprite'" :name="'add-folder'" class="image is-20x20" />
                <p
                  class="ml-5 is-medium-18-500-22"
                >{{activities_data.activities[0].object.data.name }}</p>
              </div>
              <div class="is-flex align-center mt-5" v-else>
                <div class="file-thumbnail is-relative is-flex">
                  <div
                    v-if="!item_deleted(activities_data)"
                    @click="$eventHub.$emit('init-pdftron', vault_file(activities_data.activities[0].object.id) ? vault_file(activities_data.activities[0].object.id) : {uid: activities_data.activities[0].object.id, ...activities_data.activities[0].object.data})"
                    class="is-pointer thumbnail-overlay"
                  >
                    <sh-icon
                      :class="'is-20x20 view-eye'"
                      :file="'tickets_sprite'"
                      :name="'attachment-eye'"
                    ></sh-icon>
                  </div>
                  <img
                    class="is-20x20"
                    v-if="activities_data.activities[0].object.data.thumbnailSmall"
                    :src="activities_data.activities[0].object.data.thumbnailSmall"
                  />
                  <img
                    v-else
                    class="is-20x20"
                    :src="require('@/assets/file-type-icons/' + prettyFileIcons.getIcon(activities_data.activities[0].object.data.name) + '.svg')"
                  />
                </div>
                <p
                  class="ml-5 is-medium-18-500-22"
                >{{activities_data.activities[0].object.data.name }}</p>
              </div>
            </div>
            <!-- <div>
              <div :class="{ 'ishidden': !(presence_members && presence_members.length) }">
                <div class="is-flex is-vcenter">
                  <user-tag
                    :custom_class="'tiny-user-avatar '"
                    :custom_size="24"
                    :users="[$store.state.claims.user_id]"
                    :tagsCountToShow="3"
                    :no_access="true"
                    :is_precense_component="true"
                  ></user-tag>
                    <sh-icon class="is-24x24 mr-20"  :name="'sidebar-views'"></sh-icon>
                    <img class="is-24x24" src="@/assets/icons/vault/activity-hamburger.svg" alt />
                </div>
              </div>
            </div>-->
          </div>
        </div>
        <activities-container :activities="activities_data.activities" />
      </div>
      <button
        class="has-text-centered has-background-white is-relative is-medium-14-500-17 show-btn is-pointer px-5 py-5"
        @click="load_more"
        v-if="!is_loading && current_response.length"
      >Load more</button>
      <img
        class="image is-64x64 is-relative loading-icon"
        v-if="is_loading"
        src="@/assets/icons/ellipsis-animation.svg"
      />
    </div>
    <div v-else class="overall-activity mt-60">
      <activities-skeleton v-if="is_loading"></activities-skeleton>
      <div v-else>
        <p class="is-medium-14-500-17 has-text-dark has-text-centered">No Activities</p>
      </div>
    </div>
  </div>
</template>
<script>
import {
  fileService,
  folderService,
  userService
} from "@/desktop/shared/services/";
import { DateTime } from "luxon";
import ActivitiesContainer from "./components/activities-container";
import prettyFileIcons from "pretty-file-icons";
import ActivitiesSkeleton from "@/desktop/shared/components/skeleton/vault/activities-skeleton";

import { mapState } from "vuex";

export default {
  props: ["file", "folder"],
  components: {
    ActivitiesContainer,
    ActivitiesSkeleton
  },
  data() {
    return {
      activities: [],
      prettyFileIcons,

      active: false,
      activity_limit: 10,
      activities_to_skip: 0,
      scrolled: false,
      status_bg_classes: {
        "1": "is-bg-yellow",
        "2": "is-bg-green",
        "3": "is-bg-blue",
        "4": "is-bg-light-grey",
        "5": "is-bg-red"
      },
      priority_bg_classes: {
        "1": "is-bg-critical",
        "2": "is-bg-high",
        "3": "is-bg-medium",
        "4": "is-bg-low"
      },
      vaultFeed: null,
      load_more_scroll_position: 500,
      constLimit: 10,
      current_response: [],
      is_loading: false
    };
  },
  computed: {
    ...mapState("vault", ["vault_files"]),
    ...mapState(["claims", "current_organization"]),
    type() {
      // if (this.file) return "file";
      return "folder";
    },
    vault() {
      return { uid: this.$route.params.folder_id };
    },
    presence_members() {
      return [];
    }
  },
  async created() {
    this.is_loading = true;
    this.vaultFeed = await this.get_activity_token("all");
    await this.get_activities();
  },
  methods: {
    async get_activity_token(type, uid) {
      let { data } = await folderService
        .get_activities({})
        .catch(err => this.handleErrors(err));
      return stream.connect(data.api_key, data.token, data.app_id, {
        location: data.location
      });
    },
    item_deleted(activities_data) {
      return activities_data.activities[0].object.data.is_deleted;
    },
    redirect_user_to_folder(activities_data) {
      if (!this.item_deleted(activities_data)) {
        this.$router.push({
          name: "vault",
          params: { folder_id: activities_data.activities[0].object.id }
        });
      }
    },
    vault_file(file_id) {
      return this.vault_files.find(file => file_id == file.uid);
    },
    async get_activities() {
      this.is_loading = true;
      let act = this.vaultFeed.feed(
        "vault_user",
        `${this.current_organization.uid}-${this.claims.user_id}`
      );
      let { results } = await act.get({
        limit: this.activity_limit,
        offset: this.activity_limit - this.constLimit,
        enrich: true
      });
      // await this.getUsersPicture(results, "user");
      this.current_response = results;
      this.is_loading = false;
      this.activities.push(...results);
      this.activities = [...this.activities];
    },
    load_more(e) {
      // if (this.current_response.length) {
      //   if (e.target.scrollTop > this.load_more_scroll_position) {
      this.activity_limit = parseInt(this.activity_limit + this.constLimit);
      this.get_activities();
      this.load_more_scroll_position = this.load_more_scroll_position * 2;
      //   }
      // }
    },
    days_to_duedate(dueDate) {
      let givenDate = new DateTime.fromISO(dueDate);
      let today = new DateTime.local();
      return Math.floor(givenDate.diff(today, "days").days);
    }
  }
};
</script>

<style lang="scss" scoped>
.overall-activity {
  width: 77.8rem;
  border-radius: 1rem;
  padding: 0.2rem;
  // background-color: white;
  align-items: center;

  .loading-icon {
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    margin: inherit;
  }

  .show-btn {
    border-radius: 2rem;
    border: 1px solid #8d95aa;
    width: 10rem;
    color: $primary;
    margin: inherit;
    left: 50%;
    transform: translateX(-50%);
  }

  .activity-group {
    box-shadow: 0 2px 7px 0 rgba(23, 30, 72, 0.1);
    border-radius: 1rem;
    padding-bottom: 0.5rem;
  }
  .activity-header {
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }
  .activity-circle {
    position: absolute;
    top: 4px;
  }
  .activity-block {
    // height: 8rem;
    // margin-left: 4rem;
  }
}
.file-thumbnail {
  img {
    border-radius: 4px;
  }
  &:hover .thumbnail-overlay {
    opacity: 0.5;
  }
  .thumbnail-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    z-index: 5;
    transition: 0.1s ease;
    background: rgba(23, 30, 72, 1);
    border-radius: 4px;
  }
  .view-eye {
    z-index: 10;
    color: white;
    font-size: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    text-align: center;
  }
}
</style>
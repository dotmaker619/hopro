<template>
  <div class="columns">
    <div class="column is-3">
      <transfer-owner
        ref="projectTransferOwner"
        v-if="details"
        :name="details.name"
        :service="projectService"
        :id="details.uid"
        @update_user="update_owner(details, $event)"
        :group_id="details.group.uid"
      ></transfer-owner>

      <details-skeleton v-if="isloading"></details-skeleton>
      <details-sidecard v-else-if="details">
        <template slot="header">
          <div>
            <info-block
              :info="{
                name: details.name,
                name_class: 'no-whitespace-wrap is-block is-semiBold-16-600-22',
                type: 'projectManagement',
              }"
            ></info-block>
            <div>
              <div
                @click="create_process(details)"
                v-if="access('processing') && $store.getters.is_qc_internal_user"
                class="is-pointer"
                :class="[
                  details.process && details.process.status ? ' project-processing is-' + details.process.status : 'project-processing is-start ',
                ]"
              >
                {{ details.process && details.process.status ? details.process.status : " Start Processing" }}
              </div>
              <div
                v-else
                @click="no_access_popup('processing')"
                class="is-not-allowed disabled-link is-hidden"
                :class="[
                  details.process && details.process.status ? ' project-processing is-' + details.process.status : 'project-processing is-start ',
                ]"
              >
                {{ details.process && details.process.status ? details.process.status : " Start Processing" }}
              </div>
            </div>
          </div>
          <div class="is-relative">
            <div @click="active == details.uid ? (active = -1) : (active = details.uid)" class="column">
              <div class="actions-dropdown">
                <div class="actions-dropdown-selection">
                  <sh-icon :name="'3-dots-menu'" class="is-20x20" />
                </div>
              </div>
            </div>
            <project-dropdown
              @deleted="$router.go(-1)"
              @group-change="routeChange"
              @hide-dropdown="active = -1"
              :item="details"
              :active="active"
              @on-edit="
                open_form(
                  ProjectFormComponent,
                  {
                    header: 'Edit Project for',
                    subheader: details.group.name,
                    group_id: $route.params.id,
                  },
                  details
                )
              "
            ></project-dropdown>
          </div>
        </template>

        <template slot="main">
          <div class="details-card__content">
            <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
              Created on
            </div>
            <p class="details-card__content-description is-regular-14-00-17 has-text-theme-black">
              {{ details.created_at | dateFormat }}
            </p>
          </div>
          <div
            class="details-card__content"
            v-click-outside="() => (cal_active = false)"
            @click="
              cal_active = !cal_active;
              create_cal();
            "
          >
            <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
              Date
            </div>
            <p
              class="details-card__content-description is-regular-14-00-17 has-text-theme-black"
              v-if="details.properties && details.properties.date"
            >
              {{ new Date(details.properties.date).toLocaleDateString() }}
            </p>
            <p v-else class="is-marginless is-regular-14-00-17 has-text-blue-grey is-pointer">
              Set Date
            </p>
            <div v-show="cal_active">
              <div :id="`${'project_list_cal-' + details.uid}`"></div>
            </div>
          </div>
          <div class="details-card__content">
            <div class="details-card__content-heading">Asset</div>
            <primary-tag v-if="details.asset" :tags="[details.asset]" :type="'asset'" :noTopMargin="true"></primary-tag>
            <p v-else class="sh-text-normal-14 has-text-grey has-opacity-7">
              *No associated asset
            </p>
          </div>
          <div class="details-card__content">
            <div class="details-card__content-heading">Container</div>
            <primary-tag v-if="details.container" :tags="[details.container]" :type="'container'" :noTopMargin="true"></primary-tag>
            <p v-else class="sh-text-normal-14 has-text-grey has-opacity-7">
              *No associated container
            </p>
          </div>
          <div class="details-card__content">
            <div class="details-card__content-heading">Group</div>
            <primary-tag v-if="details.group" :tags="[details.group]" :type="'group'" :noTopMargin="true"></primary-tag>
            <p v-else class="sh-text-normal-14 has-text-grey has-opacity-7">
              *No associated group
            </p>
          </div>
          <div class="details-card__content">
            <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
              Images
            </div>
            <p class="details-card__content-descriptio is-medium-16-500-19 has-text-theme-black">
              {{ details.no_of_images || 0 }}
            </p>
          </div>
          <div class="details-card__content">
            <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
              Size
            </div>
            <p class="details-card__content-descriptio is-medium-16-500-19 has-text-theme-black">
              {{ $prettysize(details.data_size) }}
            </p>
          </div>
          <div class="details-card__content">
            <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
              Missions
            </div>
            <p class="details-card__content-descriptio is-medium-16-500-19 has-text-theme-black">
              {{ details.missions ? details.missions : "*No missions found" }}
            </p>
          </div>

          <div class="details-card__content">
            <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
              Tags
            </div>
            <p class="details-card__content-description" v-if="details.tags.length">
              <type-tag :tags="details.tags" :write_access="hasEditAccess" :service="projectService" :complete="getData(false)" />
            </p>
            <p class="details-card__content-description is-flex is-vcenter" v-else>
              <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
              <span class="is-regular-14-00-17 has-opacity-7 has-text-light-grey">*No tags assigned</span>
            </p>
          </div>
        </template>
        <template slot="footer">
          <div v-if="details && details.owner && details.owner.uid">
            <user-avatar class="mr-10" :user="$store.getters.state_users[details.owner.uid]"></user-avatar>
            <router-link class="has-text-dark" :to="{ name: 'user-details', params: { id: details.owner.uid } }">
              <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mt-5">
                Owner
              </div>
              <div class="is-semiBold-16-600-19 name-highlights-on-hover" v-username="$store.getters.state_users[details.owner.uid]"></div>
            </router-link>
          </div>
        </template>
      </details-sidecard>
    </div>
    <div class="column is-9">
      <project-images @update_details="getData(false)"></project-images>
      <div class="project__reports">
        <project-report></project-report>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script>
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { projectService, processingService } from "@/desktop/shared/services/";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import TypeTag from "@/desktop/shared/components/tags/type-tag/type-tag";
  import ProjectDropdown from "@/desktop/core/components/project/project-list/components/project-dropdown";

  import ProjectImages from "./project-images/project-images";
  import ProjectReport from "./project-report/project-report";
  import ProjectFormComponent from "@/desktop/core/components/project/project-list/components/project-form.component";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";

  export default {
    data() {
      return {
        isloading: false,
        details: null,
        hasEditAccess: false,
        projectService: projectService,
        showDeleteModal: false,
        ProjectFormComponent: ProjectFormComponent,
        active: -1,
        cal_active: false,
      };
    },
    mixins: [FormPopup],
    components: {
      shDropdown,
      detailsSidecard,
      InfoBlock,
      TypeTag,
      ProjectImages,
      ProjectReport,
      DetailsSkeleton,
      PrimaryTag,
      ProjectDropdown,
    },
    created() {
      this.checkEditAccess();
      this.getData();
      this.$eventHub.$on("refresh-project-details", this.refresh_project_details);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-project-details", this.refresh_project_details);
    },

    methods: {
      create_cal() {
        if (!this.calendar) {
          this.calendar = new dhx.Calendar(`${"project_list_cal-" + this.details.uid}`, {
            css: "projects-cal",
            value: this.details && this.details.properties && this.details.properties.date ? new Date(this.details.properties.date) : new Date(),
          });
        }
        this.calendar.events.on("Change", (date) => {
          this.change_duedate(date);
        });
      },
      async change_duedate(date) {
        console.log(this.details);
        let result = await projectService
          .patch({
            group_id: this.details.group.uid,
            id: this.details.uid,
            body: { properties: { date: date } },
          })
          .catch((err) => this.handleErrors(err));

        this.cal_active = false;
        this.calendar = null;
        this.refresh_project_details();
      },
      refresh_project_details() {
        this.getData(false);
      },
      checkEditAccess() {
        projectService
          .get({
            group_id: this.$route.params.group_id,
            id: this.$route.params.id,
            query: "edit=true",
          })
          .then(() => (this.hasEditAccess = true))
          .catch((err) => this.handleErrors(err));
      },

      async getData(loading = true) {
        this.isloading = loading;
        this.details = await projectService
          .get({
            group_id: this.$route.params.group_id,
            id: this.$route.params.id,
          })
          .catch((err) => {
            this.handleErrors(err);
            this.isloading = false;
          });
        setTimeout(() => {
          this.isloading = false;
        }, 0);
      },

      async create_process(project) {
        let body = {
          name: project.group.name + "$$" + project.name,
          images: [],
          project_id: project.uid,
          group_id: this.$route.params.group_id,
          project_type: "general",
          organization: _.pick(this.$store.state.current_organization, ["uid", "name"]) || null,
          asset_id: project.asset && project.asset.uid ? project.asset.uid : null ,
        };
        let data = await processingService.post({ body }).catch(async (err) => {
          console.log("Process not Found creating new one...");
          await this.get_process(project);
        });
        if (data) {
          this.$router.push({
            name: "processing-config",
            params: { id: data.uid },
          });
        }
      },
      async get_process(project) {
        let { results } = await processingService.getAll({ query: "&no_org&project_id=" + project.uid }).catch((err) => {
          this.handleErrors(err);
        });
        if (results && results.length) {
          this.$router.push({
            name: "processing-config",
            params: { id: results[0].uid },
          });
        } else {
          this.$toast.show("Process for this project already exists", "", this.$store.state.izitoast_options.appWarning);
        }
      },

      asyncRouterPush(route) {
        return new Promise((resolve) => {
          resolve(
            this.$router.push({
              name: "project-details",
              params: {
                group_id: route,
                id: this.details.uid,
              },
            })
          );
        });
      },
      routeChange(e) {
        this.asyncRouterPush(e).then(() => {
          this.refresh_project_details();
        });
      },
    },
  };
</script>
<style lang="scss">
  .dialog {
    modal-card-head {
      background: $white !important;
      border-bottom: none !important;
    }
    modal-card-title {
      font-weight: 500 !important;
      font-size: 1.8rem !important;
    }
  }

  .project-processing {
    margin-left: 5rem;
    font-size: 1.6rem;
    font-weight: 600;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    &.is-failed::before {
      content: "\f071";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      font-size: 1.6rem;
      position: relative;
      right: 0.5rem;
      color: $red;
    }
    &.is-finished::before {
      content: "\f058";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      font-size: 1.6rem;
      position: relative;
      right: 0.5rem;
      color: $green;
    }
    &.is-pending::before {
      content: "\f110";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      font-size: 1.6rem;
      position: relative;
      right: 0.5rem;
      color: $yellow;
    }
    &.is-inprogress::before {
      content: "\f058";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      font-size: 1.6rem;
      position: relative;
      right: 0.5rem;
      color: $blue;
    }
    &.is-start {
      width: 15rem;
      height: 3.4rem;
      border-radius: 6px;
      border: solid 1.5px $primary;
      background-color: #ffffff;
      padding: 0.2rem 1rem;
      display: inline-flex;
      align-items: center;
      border-radius: 0.5rem;

      font-family: Barlow-Medium;
      font-size: 14px;
      font-weight: 500;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      justify-content: center;
      text-align: left;
      color: $primary;
      &::before {
        content: "\f04b";
        font-family: "Font Awesome 5 Free";
        font-weight: 900;
        font-size: 1.4rem;
        position: relative;
        right: 0.5rem;
        color: $primary;
      }
    }
  }
</style>

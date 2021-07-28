<template>
  <div class="padding-20">
    <div class="pin" v-if="process_details">
      <div class="pin-text is-pointer" @click="$router.go(-1)">
        <i class="fas fa-chevron-left mr-10"></i>
        {{ process_details.name && process_details.name.split("$$")[1] }}
      </div>
      <div class="pin-icon is-disabled">
        <i class="fas fa-thumbtack"></i>
      </div>
    </div>
    <div class="columns">
      <div class="column is-3" v-if="process_details">
        <details-skeleton v-if="is_loading"></details-skeleton>
        <details-sidecard v-else>
          <template slot="header">
            <div @click="update_processing_state">
              <info-block
                :truncate_value="20"
                :info="{
                  name: process_details.name.split('$$')[1],
                  bottom: processing_action,
                  bottom_class: `processing-action ${processing_action} is-pointer`,
                  type: 'projectManagement',
                }"
              ></info-block>
            </div>
          </template>

          <template slot="main">
            <div class="details-card__content">
              <div class="details-card__content-heading is-regular-00-17 has-text-theme-black">
                Description
              </div>
              <p
                class="details-card__content-description"
                :class="{
                  'is-reggular-14-00-20 has-text-theme-grey': !process_details.description,
                }"
              >
                {{ process_details ? process_details.description : "*No description found" }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
                Created on
              </div>
              <p class="details-card__content-descriptio is-uppercase is-regular-14-00-17 has-text-theme-black">
                {{ process_details.created_at | dateFormat }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading is-regular-14-00-17 has-text-light-grey">
                Status
              </div>
              <p class="details-card__content-descriptio is-medium-16-500-19 is-flex">
                <sh-icon :name="process_details.status + '-colored'" class="is-20x20"></sh-icon>
                <span class="processing">{{ process_details && process_details.status }}</span>
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading is-paddingless is-regular-14-00-17 has-text-light-grey">
                Group
              </div>

              <p class="details-card__content-descriptio is-medium-16-500-19">
                <primary-tag
                  :tags="[
                    {
                      name: process_details.name.split('$$')[0],
                      uid: process_details.group_id,
                    },
                  ]"
                  :no_access="true"
                  :type="'group'"
                ></primary-tag>
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading is-paddingless mb-7 is-regular-14-00-17 has-text-light-grey">
                Project Type
              </div>
              <p class="details-card__content-descriptio is-medium-16-500-19 is-capitalized">
                {{ process_details.project_type }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading is-paddingless mb-7 is-regular-14-00-17 has-text-light-grey">
                Images
              </div>
              <p class="details-card__content-descriptio is-medium-16-500-19">
                {{ process_details.no_of_images }}
              </p>
            </div>
            <div class="details-card__content">
              <div class="details-card__content-heading is-paddingless mb-7 is-regular-14-00-17 has-text-light-grey">
                Report Status
              </div>
              <p
                class="details-card__content-descriptio"
                :class="[
                  process_details.reports && process_details.reports.status ? 'is-medium-16-500-19' : 'is-regular-14-00-17 has-text-light-grey',
                ]"
              >
                {{ process_details.reports && process_details.reports.status ? process_details.reports.status : "*Not available" }}
              </p>
            </div>
          </template>
          <template slot="footer">
            <info-block
              v-if="$store.getters.state_users[process_details.owner.uid]"
              :info="{
                name: `${$store.getters.state_users[process_details.owner.uid].first_name} ${
                  $store.getters.state_users[process_details.owner.uid].last_name
                }`,
                top: 'Created by',
                image: $store.getters.state_users[process_details.owner.uid].display_picture,
                type: 'userManagement',
              }"
            ></info-block>
            <info-block
              v-else-if="process_details.owner && process_details.owner.uid"
              :unknown="true"
              :info="{
                name: process_details.owner.email.includes('@sensehawk') ? 'Sensehawk' : 'Unknown',
                top: 'Created by',
                type: 'userManagement',
              }"
            ></info-block>
          </template>
        </details-sidecard>
      </div>
      <div class="column">
        <div class="mb-40 mt-10">
          <processing-results v-if="process_details" :process="process_details.status" :project_id="process_details.project_id"></processing-results>
        </div>
        <div class="sh-tabs">
          <ul>
            <li class="is-medium-18-500-22">
              <router-link exact-active-class="is-active" :to="{ name: 'processing-config' }">Processing</router-link>
            </li>
            <li class="is-medium-18-500-22">
              <router-link active-class="is-active" :to="{ name: 'processing-images' }">Images</router-link>
            </li>
            <li class="is-medium-18-500-22">
              <router-link active-class="is-active" :to="{ name: 'processing-gcp' }">GCP</router-link>
            </li>
            <li class="is-medium-18-500-22 is-relative ml-auto">
              <router-link active-class="is-active" :to="{ name: 'processing-events' }">Events</router-link>
            </li>
          </ul>

          <router-view
            ref="view"
            v-if="process_details"
            :process="process_details"
            :no_of_images="process_details.no_of_images"
            :project_type="process_details.project_type"
            :project_id="process_details.project_id"
            :process_status="process_details.status"
            :gcp_status="process_details.gcp_status"
            :is_resume="process_details.resume"
            @start-processing="openPopup"
            @start="start_processing()"
            @resume-processing="update_processing_state"
            @images_saved="getDetails(false)"
            :starting_processing="starting_processing"
          ></router-view>
        </div>
        <confirmation-popup
          ref="confirmation"
          :project_name="process_details.name"
          v-if="process_details"
          :project_type="process_details.project_type"
          @start="start_processing"
          :images_length="(process_details.images || []).length"
        ></confirmation-popup>
        <resume-popup ref="resume" :process="process_details.stage" :process_id="process_details.uid" v-if="process_details"></resume-popup>
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="process_details.uid"
      :resourceName="process_details.name"
      :resourceType="'processing'"
      :resourceService="processingService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        $router.push({
          name: 'group-details-processing',
          params: { id: process_details.group_id },
        });
        getData();
      "
    />
  </div>
</template>

<script>
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { processingService, userService } from "@/desktop/shared/services/";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import ProcessingResults from "./processing-results";
  import ConfirmationPopup from "./confirmation-popup";
  import ResumePopup from "./resume-popup";
  import DetailsSkeleton from "@/desktop/shared/components/skeleton/details-skeleton.vue";
  import { mapState } from "vuex";

  export default {
    data() {
      return {
        starting_processing: 0,

        processingService: processingService,
        selected_images_length: 0,

        showDeleteModal: false,
        is_loading: false,
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      InfoBlock,
      PrimaryTag,
      ProcessingResults,
      ConfirmationPopup,
      ResumePopup,
      DetailsSkeleton,
    },
    created() {
      this.getDetails();
    },
    computed: {
      ...mapState("processing", ["selected_images"]),
      process_details: {
        get() {
          return this.$store.state.processing.process_details;
        },
        set(val) {
          this.$store.commit("processing/SET_PROCESS_DETAILS", val);
        },
      },
      src() {
        return require(`@/assets/icons/sprite.svg`);
      },
      processing_action() {
        let action = null;
        if ((this.process_details.status == "failed" || this.process_details.status == "finished") && this.process_details.resume) {
          action = "resume process";
        } else if (this.process_details.status == "pending") {
          action = "configure process";
        } else if (this.process_details.status == "in_progress") {
          action = "stop process";
        } else {
          action = this.process_details.status;
        }
        return action;
      },
    },
    methods: {
      openPopup(images_length) {
        this.selected_images_length = images_length;
        this.$refs.confirmation.openConfirmationPopUp();
      },
      async getDetails(loading = true) {
        try {
          this.is_loading = loading;

          this.process_details = await processingService.get({
            id: this.$route.params.id,
            query: "users=true",
          });
          this.is_loading = false;

          let selected_images = [];
          if (this.process_details.images) {
            selected_images = this.process_details.images.map((el) => el.key);
          }
          this.$store.commit("processing/SET_SELECTED_IMAGES", selected_images);
        } catch (err) {
          this.handleErrors(err);
          this.is_loading = false;
        }
      },
      async edit_resource() {
        this.$router.push({ name: "asset-edit" });
      },
      // async start_processing() {
      //   if (
      //     this.process_details.status &&
      //     (this.process_details.status == "pending" ||
      //       ((this.process_details.status == "finished" ||
      //         this.process_details.status == "failed") &&
      //         this.process_details.resume == true))
      //   ) {
      //     if (
      //       this.process_details.images &&
      //       this.process_details.images.length < 4
      //     ) {
      //       this.$toast.show(
      //         "Please select images and save",
      //         "",
      //         this.$store.state.izitoast_options.appWarning
      //       );
      //       return;
      //     }

      //     await processingService
      //       .start({
      //         id: this.$route.params.id,
      //         body: {
      //           asset_id: this.process_details.asset_id,
      //         },
      //       })
      //       .catch((err) => this.handleErrors(err));
      //     this.$toast.show(
      //       "Processing started",
      //       "",
      //       this.$store.state.izitoast_options.appSuccess
      //     );
      //   } else {
      //     this.$buefy.toast.open(
      //       `Can not start process in ${this.process_details.status} state`
      //     );
      //   }
      //   // this.$emit("update_process_details");
      // },
      update_processing_state() {
        if ((this.process_details.status == "failed" || this.process_details.status == "finished") && this.process_details.resume) {
          this.$refs.resume.openResumePopUp();
          return;
        } else if (this.process_details.status == "pending") {
          this.$route.name == "processing-config"
            ? this.$toast.show(`You're already on the processing configuration page`)
            : this.$router.push({ name: "processing-config" });
        } else if (this.process_details.status == "in_progress") {
          this.stop_processing();
        } else {
          this.$toast.show(this.process_details.status);
        }
      },
      stop_processing() {
        this.$buefy.dialog.confirm({
          message: "Are you sure you want to stop the processing?",
          type: "is-danger",
          onConfirm: async () => {
            await processingService.stop({ id: this.process_details.uid }).catch((err) => {
              this.handleErrors(err);
            });
            this.$toast.show("Processing termination initiated ", "");
          },
        });
      },
    },
  };
</script>

<style lang="scss">
  .processing-action {
    border: 1px solid;
    border-radius: 0.5rem;
    padding: 0.5rem;
    border-color: $primary;
    color: $primary;
    text-transform: capitalize;
    width: 141px;
    height: 30px;
    font-family: Barlow-SemiBold;
    font-size: 14px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: center;
    border-radius: 6px;
    &.configure {
      border-color: $completed-status;
      color: $completed-status;
    }
    &.resume {
      box-shadow: 0 2px 5px 0 rgba(245, 124, 14, 0.2);
      background-color: #ffffff;
      border-color: $resume;
      color: $resume;
      text-align: center;
    }
    &.stop {
      border-color: $red;
      color: $red;
    }
  }
</style>

<style lang="scss">
  .dialog {
    .media-content {
      padding: 4rem 2rem !important;
    }
  }
</style>

<template>
  <!-- temporary desin -->
  <div class="details--section">
    <top-section
      :page="'project'"
      :details="details"
      :view_type="view_type"
      @show_pin_modal="showPinModal = true"
      @toggle_view_type="toggle_view_type"
    >
    </top-section>

    <router-view v-if="details" :details="details"></router-view>
    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'project'" @closed="showPinModal = false" />
  </div>
</template>

<script>
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { projectService, processingService } from "@/desktop/shared/services/";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import ProjectImages from "./components/project-images/project-images";
  import ProjectReport from "./components/project-report/project-report";
  import TopSection from "@/desktop/core/shared/components/details-top-section/details-top-section";
  import PinModal from "@/desktop/shared/components/pin-modal";

  export default {
    data() {
      return {
        details: null,

        showDeleteModal: false,
        showPinModal: false,
        view_type: "resource",
        activeView: "tickets",
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      InfoBlock,
      ProjectImages,
      ProjectReport,
      TopSection,
      PinModal,
    },
    created() {
      this.$eventHub.$on("update_element_data", this.update_element_data);

      this.getDetails();
      this.$eventHub.$on("refresh-project-details", this.getDetails);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-project-details", this.getDetails);
      this.$eventHub.$off("update_element_data", this.update_element_data);
    },
    methods: {
      update_element_data(element) {
        this.details.element = element;
        this.details = Object.assign(this.details);
      },
      async getDetails() {
        this.details = await projectService
          .get({
            group_id: this.$route.params.group_id,
            id: this.$route.params.id,
          })
          .catch((err) => {
            this.handleErrors(err);
          });
      },
      async edit_resource() {
        this.$router.push({
          name: "project-edit",
          params: {
            group_id: this.$route.params.group_id,
            id: this.$route.params.id,
          },
        });
      },

      async create_process(project) {
        let body = {
          name: project.group.name + "$$" + project.name,
          images: [],
          project_id: project.uid,
          group_id: this.$route.params.group_id,
          project_type: "general",
          organization: _.pick(this.$store.state.current_organization, ["uid", "name"]) || null,
          asset_id: project.asset_id,
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
</style>

<template>
  <div class="details--section">
    <top-section
      :page="'container'"
      class="px-20"
      :details="details"
      :view_type="view_type"
      @show_pin_modal="showPinModal = true"
      @toggle_view_type="toggle_view_type"
    >
    </top-section>

    <router-view @update="getDetails(false)" :details="details" :isloading="is_loading"></router-view>

    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details.name"
      :resourceType="'container'"
      :resourceService="containerService"
      @closed="showDeleteModal = false"
      @deleted="
        show_success('Resource successfully deleted');
        $router.push({ name: 'container-list' });
        getData();
      "
    />
    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'container'" @closed="showPinModal = false" />
  </div>
</template>

<script>
  import { containerService, userService, metricsService } from "@/desktop/shared/services/";
  import PinModal from "@/desktop/shared/components/pin-modal";
  import TopSection from "@/desktop/core/shared/components/details-top-section/details-top-section";

  export default {
    data() {
      return {
        details: null,
        showDeleteModal: false,
        showPinModal: false,
        resource_metrics: null,
        view_type: "resource",
        activeView: "tickets",
        is_loading: false,
      };
    },
    components: {
      PinModal,
      TopSection,
    },
    created() {
      this.$eventHub.$on("update_element_data", this.update_element_data);

      this.getDetails();
      this.$eventHub.$on("refresh-container-details", () => {
        this.getDetails(false);
      });
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-container-details");
      this.$eventHub.$off("update_element_data", this.update_element_data);
    },
    methods: {
      update_element_data (element) {
        this.details.element = element;
        this.details = Object.assign(this.details);
      },
      async getDetails(loading = true) {
        this.is_loading = loading;
        this.details = await containerService.get({ id: this.$route.params.id, query: "users=true" }).catch((err) => {
          this.handleErrors(err);
          this.is_loading = false;
        });

        this.get_resource_metrics("containers", this.details.uid);
        setTimeout(() => {
          this.is_loading = false;
        }, 0);
      },
      async get_resource_metrics(attribute, resource_id) {
        this.resource_metrics = await metricsService.get_resource_metrics({
          attribute: attribute,
          id: resource_id,
        });
      },
      async edit_resource() {
        this.$router.push({ name: "container-edit" });
      },
      toggle_view_type() {
        if (this.view_type === "ebs") {
          this.view_type = "resource";
        } else {
          this.view_type = "ebs";
        }
      },
    },
  };
</script>

<style></style>

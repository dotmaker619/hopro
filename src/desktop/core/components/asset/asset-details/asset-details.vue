<template>
  <div class="details--section">
    <top-section
      :page="'asset'"
      class="px-20"
      :details="details"
      :view_type="view_type"
      @show_pin_modal="showPinModal = true"
      @toggle_view_type="toggle_view_type"
    >
    </top-section>

    <router-view @update="getDetails(false)" :details="details" :resource_metrics="resource_metrics" :isloading="is_loading"></router-view>
    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'asset'" @closed="showPinModal = false" />
  </div>
</template>

<script>
  import { assetService, userService, metricsService } from "@/desktop/shared/services/";
  import PinModal from "@/desktop/shared/components/pin-modal";
  
  import TopSection from "@/desktop/core/shared/components/details-top-section/details-top-section";

  export default {
    data() {
      return {
        view_type: "resource",
        activeView: "tickets",
        details: null,
        showPinModal: false,
        resource_metrics: null,
      };
    },
    components: {
      PinModal,
      TopSection,
    },
    created() {
      this.$eventHub.$on("update_element_data", this.update_element_data);

      this.getDetails();
      this.$eventHub.$on("refresh-asset-details", this.getDetails);
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-asset-details", this.getDetails);
      this.$eventHub.$off("update_element_data", this.update_element_data);
    },

    methods: {
      update_element_data (element) {
        this.details.element = element;
        this.details = Object.assign(this.details);
      },
      async getDetails(loading = true) {
        this.is_loading = loading;
        this.details = await assetService.get({ id: this.$route.params.id, query: "users=true" }).catch((err) => {
          this.handleErrors(err);
          this.is_loading = false;
        });

        this.is_loading = false;
        this.get_resource_metrics("assets", this.details.uid);
      },
      async get_resource_metrics(attribute, resource_id) {
        this.resource_metrics = await metricsService.get_resource_metrics({
          attribute: attribute,
          id: resource_id,
        });
      },
      async edit_resource() {
        this.$router.push({ name: "asset-edit" });
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

<style lang="scss">
  .is-borderless {
    border: none !important;
  }

  .is-21x21 {
    height: 2.1rem;
    width: 2.1rem;
  }
  .pinned-resource {
    &-buttons {
      width: 212px;
      height: 40px;
      border-radius: 6px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.16);
      background-color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      font-family: Barlow-SemiBold;
      font-size: 14px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 17px;
      letter-spacing: normal;
      text-align: left;
    }
  }

  .resource-view {
    width: 12rem;
    height: 3rem;
    border-radius: 4px;
    padding: 0.5rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    &.is-button {
      background-color: $primary;
      color: white;
    }
  }
  .details--section {
    padding: 2rem 2.2rem;
  }
</style>

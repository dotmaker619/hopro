<template>
  <div class="details--section">
    <top-section
      :page="'group'"
      class="px-20"
      :details="details"
      :view_type="view_type"
      @show_pin_modal="showPinModal = true"
      @toggle_view_type="toggle_view_type"
    >
    </top-section>

    <router-view @update="getDetails(false)" v-if="details" :details="details" :isloading="is_loading"></router-view>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="details.uid"
      :resourceName="details.name"
      :resourceType="'group'"
      :resourceService="groupService"
      @closed="showDeleteModal = false"
      @deleted="show_success('Resource successfully deleted');
      $router.push({ name: 'group-list'});getDetails()"
    />
    <pin-modal v-if="showPinModal" :resourceName="details ? details.name : ''" :resourceType="'group'" @closed="showPinModal = false" />
  </div>
</template>

<script>
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import detailsSidecard from "@/desktop/core/shared/components/details-sidecard.vue";
  import { groupService, userService } from "@/desktop/shared/services/";
  import InfoBlock from "@/desktop/shared/components/info-block";
  import PinModal from "@/desktop/shared/components/pin-modal";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import TopSection from "@/desktop/core/shared/components/details-top-section/details-top-section";

  export default {
    data() {
      return {
        details: null,

        groupUsers: [],
        groupService: groupService,
        showDeleteModal: false,
        showPinModal: false,
        view_type: "resource",
        activeView: "tickets",
        is_loading: false,
      };
    },
    components: {
      shDropdown,
      detailsSidecard,
      InfoBlock,
      UserTag,
      PinModal,
      PrimaryTag,
      TopSection,
    },
    created() {
      this.$eventHub.$on("update_element_data", this.update_element_data);

      this.getDetails();
      this.$eventHub.$on("refresh-group-details", () => {
        this.getDetails(false);
      });
    },
    beforeDestroy() {
      this.$eventHub.$off("refresh-group-details");
      this.$eventHub.$off("update_element_data", this.update_element_data);
    },
    methods: {
      update_element_data (element) {
        this.details.element = element;
        this.details = Object.assign(this.details);
      },
      async getDetails(loading = true) {
        console.log('Inside Get Details');
        this.is_loading = loading;
        this.details = await groupService.get({ id: this.$route.params.id }).catch((err) => {
          this.handleErrors(err);
          this.is_loading = false;
        });

        setTimeout(() => {
          this.is_loading = false;
        }, 0);
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

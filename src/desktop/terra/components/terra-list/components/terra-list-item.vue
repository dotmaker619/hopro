<template>
  <div class="">
    <div class="columns is-flex align-center">
      <div class="column " :class="[$route.name.includes('asset-details') ? 'is-3' : 'is-4']">
        <router-link :to="{ name: 'terra-viewer', params: { id: item.uid } }" @click.native="append_recently_accessed_resource('terra', item.uid)">
          <info-block
            :info="{
              'name': item.name,
              'name_class': 'is-semiBold-16-600-22 name-highlights-on-hover',
              'bottom': item.description ? item.description : '*No description found',
              'bottom_class': 'is-regular-14-500-17 has-opacity-7 has-text-theme-black',
              type: 'projectManagement',
            }"
            :truncate_value="35"
            :hideImage="hideInfoBlockImage"
          ></info-block>
        </router-link>
      </div>
      <div class="column is-2">
        <div class="is-flex is-vcenter">
          <user-avatar :user="item.owner" :pxsize="30" :custom_class="'tiny-user-avatar'" class="mr-5"></user-avatar>
          <p
            class="ml-5 is-medium-14-500-17 has-text-weight-semibold has-text-lightgrey is-capitalized"
            v-if="item.owner"
            v-username="item.owner"
          ></p>
        </div>
      </div>
      <div class="column is-3">
        <user-tag
          :custom_size="30"
          :custom_class="'tiny-user-avatar'"
          :users="[...item.readUsers, ...item.writeUsers].map((user) => $store.getters.state_users[user.uid])"
          :tagsCountToShow="$route.name == 'asset-details' || $route.name == 'asset-details-groups' || $route.name == 'asset-details-reports' ? 1 : 2"
        ></user-tag>
      </div>
      <div class="column " :class="[$route.name.includes('asset-details') ? 'is-3' : 'is-2']">
        <div class="is-medium-14-500-17 no-whitespace-wrap">{{ item.updated | prettyDate }}</div>
      </div>
      <div class="column is-1 sh-list__item--icon is-flex">
        <div @click="$emit('edit', item)" class="is-pointer mr-10">
          <sh-icon :name="'pen'" class="is-16x16"></sh-icon>
        </div>
        <div
          @click="
            showDeleteModal = true;
            currentTerra = item;
          "
          class="is-pointer"
        >
          <sh-icon :name="'trash'" class="is-16x16"></sh-icon>
        </div>
        <router-link :to="{ name: 'terra-details', params: { id: item.uid } }" class="is-pointer ml-30">
          <sh-icon :name="'group-right-arrow'" class="is-15x15"></sh-icon>
        </router-link>
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="item.uid"
      :resourceName="item.name"
      :resourceType="'terra'"
      :resourceService="item.isContainer ? containerService : terraService"
      @closed="showDeleteModal = false"
      @deleted="$emit('deleted-item')"
    />
  </div>
</template>
<script>
  import InfoBlock from "@/desktop/shared/components/info-block";
  import UserTag from "@/desktop/shared/components/tags/user-tag-new";
  import TerraFormComponent from "@/desktop/terra/components/terra-form.component.vue";
  import { terraService, containerService } from "@/desktop/shared/services/";

  export default {
    props: ["item"],
    components: {
      InfoBlock,
      UserTag,
    },
    data() {
      return {
        showDeleteModal: false,
        terraService: terraService,
        containerService: containerService,
      };
    },
    computed: {
      hideInfoBlockImage() {
        return this.$route.name == "asset-list" ? false : true;
      },
    },
    methods: {
      terra_form(edit_item) {
        let info = {};
        info.heading2 = edit_item ? "Edit Terra View for" : "Create Terra View for";
        info.heading3 = this.$store.state.current_organization && this.$store.state.current_organization.name;
        this.$modal.show(
          TerraFormComponent,
          {
            details: edit_item,
            info,
            on_complete: () => {
              this.getData();
            },
          },
          {
            width: "45%",
            classes: ["has-background-transparent"],
            scrollable: false,
            height: "auto",
          },
          {
            name: "terra-view-form",
          }
        );
      },
    },
  };
</script>

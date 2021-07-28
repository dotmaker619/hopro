<template>
  <div class="sh-form" @keyup.enter="save"
  v-if="(details && resourceReceived)|| !details">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/group.svg" />
      <form-top :info="info"></form-top>
      <input
        v-focus
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'New Group'"
        :class="{ 'sh-form__content__input--error' : validationError.name }"
      />
      <input
        v-model="form.description"
        class="sh-form__content__input"
        type="text"
        :placeholder="'Description'"
      />
      <select-input
        :selected="form.asset"
        :selectText="'Select Asset'"
        :selectOptions="assets"
        @inputChange="assetChange"
        :disabled="assetsDisabled"
        class="mt-30"
        :showIcon="true"
        :validationError="validationError.asset"
      />
      <!-- <select-input
        v-if="$route.name === 'container-group-create'"
        :selected="form.container"
        :selectText="'Select Container'"
        :selectOptions="containers"
        @inputChange="containerChange"
        :disabled="containersDisabled"
        class="mt-30"
        :showIcon="true"
        :validationError="validationError.container"
      />-->
      <select-input
        v-if="$store.getters.is_internal_user"
        :selected="form.owner"
        :selectText="'Select Owner'"
        :selectOptions="users"
        @inputChange="ownerChange"
        class="mt-30"
        :showIcon="true"
        :validationError="validationError.owner"
      />
      <div
        @click="showAdvanced = !showAdvanced;"
        class="sh-form__content__advanced"
      >
        <span class="sh-form__content__advanced__icon">
          <i v-if="showAdvanced" class="fas fa-chevron-down"></i>
          <i v-else class="fas fa-chevron-right"></i>
        </span>
        <span class="sh-form__content__advanced__text">Advanced Option</span>
      </div>
      <advanced-option
        v-show="showAdvanced"
        ref="advanced"
        :type="'group'"
        :tags="form.tags"
        :propertyIcon="form.properties && form.properties.icon"
        :propertyColor="form.properties && form.properties.color"
      />
      <div
        class="mt-10 is-medium-16-500-50 has-text-centered has-text-danger"
        v-if="errors"
      >Something went wrong</div>
      <div v-if="awaitingResponse" class="sh-form__content__button">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="save" class="sh-form__content__button">Save Changes</div>
  </div>
</div>
</template>

<script>
import SelectInput from "@/desktop/shared/components/form/components/select-input";
import {
  assetService,
  groupService,
  containerService,
  userService
} from "@/desktop/shared/services/";
import AdvancedOption from "@/desktop/shared/components/form/components/advanced-option";
import FormTop from "@/desktop/shared/components/form/form-top"
import FormMixin from "@/desktop/shared/mixins/form.mixin"

export default {
  props: ["details", "on_complete", "info"],
  components: {
    SelectInput,
    AdvancedOption,
    FormTop
  },
  mixins: [FormMixin],
  data() {
    return {
      service: groupService,
      assets: [],
      containers: [],
      users: [],
      assetsDisabled: false,
      // containersDisabled: false,
    };
  },
  async created() {
    if (this.details) await this.getDetails();
    else {
      if (!this.$store.getters.is_internal_user)
        this.form.owner = { uid: this.$store.state.claims.user_id };
      this.form.organization = this.$store.state.current_organization;
    }
    this.getUsers();
    this.getAssets();
  },
  methods: {
    async getAssets() {
      let result = await assetService
        .getAll({
          query: `organization=${this.form.organization.uid}`
        })
        .catch(err => this.handleErrors(err));
      this.assets = result.results.map(asset =>
        (({ uid, name, owner }) => ({ uid, name ,owner}))(asset)
      );
      this.handleFormContext();
    },
    async handleFormContext() {
      if (this.info.asset_id) {
        this.assetChange(this.assets.find(f => f.uid === this.info.asset_id));
        if(!this.details){
          let owner  = this.assets.find(f => f.uid === this.info.asset_id).owner;
          owner = this.$store.getters.state_users[owner.uid] || owner;
          this.ownerChange({uid: owner.uid,name:(owner.first_name||owner.last_name)? owner.first_name + " " + owner.last_name: owner.email});
        }
        this.assetsDisabled = true;
      } else if (this.info.container_id) {
        let result = await containerService
          .get({ id: this.info.container_id, query: "users=true" })
          .catch(err => {
            this.handleErrors(err);
          });
        this.containerChange({ uid: result.uid, name: result.name });
        this.assetChange(this.assets.find(f => f.uid === result.asset.uid));
        // this.containersDisabled = true;
        this.assetsDisabled = true;
      }
    },
    async assetChange(val = {}) {
      this.form.asset = val;
      this.form = { ...this.form };
      await this.getContainers(val.uid);
    },
    async getContainers(assetUid) {
      let result = await containerService
        .getAll({
          query: `organization=${this.form.organization.uid}&asset=${assetUid}`
        })
        .catch(err => this.handleErrors(err));
      this.containers = [
        ...result.results.map(container =>
          (({ uid, name, properties }) => ({ uid, name, properties }))(
            container
          )
        )
      ];
    },
    containerChange(val = {}) {
      this.form.container = val;
      // this.form = { ...this.form };
    },
    validate_form() {
      this.validationError = {};
      let returnVal = true;
      if (!this.form.name) {
        this.validationError.name = true;
        returnVal = false;
      }
      // if (!this.form.asset) {
      //   this.validationError.asset = true;
      //   returnVal = false;
      // }
      if (!this.form.owner) {
        this.validationError.owner = true;
        returnVal = false;
      }
      this.validationError = { ...this.validationError };
      return returnVal;
    }
  }
};
</script>
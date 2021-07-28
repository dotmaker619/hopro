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
        :class="{ 'sh-form__content__input--error' : validationError.name }"
        type="text"
        :placeholder="'New Container'"
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
        :disabled="assetsDisabled"
        :showIcon="true"
        @inputChange="assetChange"
        class="mt-30"
        :validationError="validationError.asset"
      />
      <select-input
        v-if="$store.getters.is_internal_user"
        :selected="form.owner"
        :selectText="'Select Owner'"
        :selectOptions="users"
        @inputChange="ownerChange"
        :showIcon="true"
        class="mt-30"
        :validationError="validationError.owner"
      />
    <div @click="showAdvanced = !showAdvanced;"
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
        :type="'container'"
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
  containerService,
  assetService,
  // groupService,
  userService
} from "@/desktop/shared/services/";
import AdvancedOption from "@/desktop/shared/components/form/components/advanced-option";
import FormTop from "@/desktop/shared/components/form/form-top"
import FormMixin from "@/desktop/shared/mixins/form.mixin"

export default {
  props: [
    "details",
    "on_complete",
    "info"
  ],
  mixins: [FormMixin],
  components: {
    SelectInput,
    AdvancedOption,
    FormTop
  },
  data() {
    return {
      service:containerService,
      form: {
        organization: null,
        owner: null,
        asset: null,
        properties: {
            icon: '',
            cover_image: '',
            color: ''
          }
      },
      assets: [],
      // groups: [],
      users: [],
      sliceLength: 8,
      removeItemUid: null,
      // closeGroupDropdown: null,
      assetsDisabled: false,
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
        (({ uid, name, owner }) => ({ uid, name, owner }))(asset)
      );
      this.handleFormContext();
    },
    handleFormContext() {
      if (this.info.asset_uid) {
        if(!this.details){
          let owner  = this.assets.find(f => f.uid === this.info.asset_uid).owner;

          owner = this.$store.getters.state_users[owner.uid] || owner;


          this.ownerChange({uid: owner.uid,name:(owner.first_name||owner.last_name)? owner.first_name + " " + owner.last_name: owner.email});
        }
        this.assetChange(this.assets.find(f => f.uid === this.info.asset_uid));
        this.assetsDisabled = true;
      }
      if(this.info.has_group){
        this.assets = [this.assets.find(f => f.uid === this.info.asset_uid)];
      }
    },
    async assetChange(value = {}) {
      this.form.asset = value;
      // await this.getGroups(value.uid);
    },
    validate_form() {
      this.validationError = {};
      let returnVal = true;
      if (!this.form.name) {
        this.validationError.name = true;
        returnVal = false;
      }
      if (!this.form.asset) {
        this.validationError.asset = true;
        returnVal = false;
      }
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

<style lang="scss" scoped>
.add-groups {
  margin-top: 3rem;
  width: 100%;
  align-content: left;
  &__text {
    line-height: 4rem;
    font-weight: 500;
    font-size: 1.7rem;
  }
  &__container {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    &__button {
      margin: 0.25rem 0.5rem;
      padding: 0.5rem 0.8rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      border: 1px solid;
      border-radius: 20px;
      &__icon {
        width: 2.25rem;
        height: 2.25rem;
        line-height: 2.25rem;
        text-transform: capitalize;
        font-size: 1.4rem;
        font-weight: 600;
        margin-right: 0.75rem;
        color: $white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        user-select: none;
      }
      &__text {
        font-size: 1.6rem;
        font-weight: 500;
        user-select: none;
        text-transform: capitalize;
      }
      &__close {
        margin-left: 0.75rem;
        color: #5b607e;
        font-size: 1.25rem;
        cursor: pointer;
      }
    }
  }
}
</style>
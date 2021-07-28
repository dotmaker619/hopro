<template>
  <div class="sh-form" @keyup.enter="save" v-if="(details && resourceReceived) || !details">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/asset.svg" />
      <form-top :info="info"></form-top>
      <input
        v-focus
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'New Asset'"
        :class="{ 'sh-form__content__input--error': validationError.name }"
      />
      <input v-model="form.description" class="sh-form__content__input" type="text" :placeholder="'Description'" />
      <select-input
        :selectText="'Select Asset Type'"
        :selected="{ uid: form.asset_type, name: form.asset_type }"
        :selectOptions="assetTypes"
        @inputChange="assetTypeChange"
        class="mt-30"
        :validationError="validationError.asset_type"
      />
      <select-input
        :selected="form.entity"
        :selectText="'Select Entity'"
        :selectOptions="entities"
        @inputChange="entityChange"
        class="mt-30"
        :showIcon="true"
        :validationError="validationError.entity"
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
      <div @click="showAdvanced = !showAdvanced" class="sh-form__content__advanced">
        <span class="sh-form__content__advanced__icon">
          <i v-if="showAdvanced" class="fas fa-chevron-down"></i>
          <i v-else class="fas fa-chevron-right"></i>
        </span>
        <span class="sh-form__content__advanced__text">Advanced Option</span>
      </div>
      <advanced-option
        v-if="showAdvanced"
        ref="advanced"
        :type="'asset'"
        :tags="form.tags"
        :propertyIcon="form.properties.icon && form.properties.icon"
        :propertyColor="form.properties.color && form.properties.color"
        :propertyCover="form.properties.cover_image && form.properties.cover_image"
        :propertyCRS="form.properties.selected_coordinate_system"
      />
      <div class="mt-10 is-medium-16-500-50 has-text-centered has-text-danger" v-if="errors">Something went wrong</div>
      <div v-if="awaitingResponse" class="sh-form__content__button">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="save" class="sh-form__content__button">Save Changes</div>
    </div>
  </div>
</template>

<script>
  import { assetService, entityService, userService } from "@/desktop/shared/services/";
  import SelectInput from "@/desktop/shared/components/form/components/select-input";
  import AdvancedOption from "@/desktop/shared/components/form/components/advanced-option";
  import FormTop from "@/desktop/shared/components/form/form-top";
  import FormMixin from "@/desktop/shared/mixins/form.mixin.vue";
  export default {
    mixins: [FormMixin],
    props: ["details", "on_complete", "info"],
    components: {
      SelectInput,
      AdvancedOption,
      FormTop,
    },
    data() {
      return {
        service: assetService,
        entities: null,
        users: [],
        assetTypes: [
          { uid: "solar", name: "solar" },
          { uid: "wind", name: "wind" },
          { uid: "roads", name: "roads" },
          { uid: "mining", name: "mining" },
          { uid: "construction", name: "construction" },
        ],
      };
    },
    async created() {
      if (this.details) await this.getDetails();
      else if (!this.$store.getters.is_internal_user) this.form.owner = { uid: this.$store.state.claims.user_id };
      this.getUsers();
      this.getEntities();
    },
    methods: {
      async getEntities() {
        let result = await entityService
          .getAll({
            query: `organization=${this.$store.state.current_organization.uid}`,
          })
          .catch((err) => this.handleErrors(err));
        this.entities = result.results.map((entity) => (({ uid, name }) => ({ uid, name }))(entity));
      },
      entityChange(val = {}) {
        this.form.entity = val;
      },
      assetTypeChange(val = {}) {
        this.form.asset_type = val.name;
      },
      validate_form() {
        this.validationError = {};
        let returnVal = true;
        if (!this.form.name) {
          this.validationError.name = true;
          returnVal = false;
        }
        if (!this.form.asset_type) {
          this.validationError.asset_type = true;
          returnVal = false;
        }
        if (!this.form.entity) {
          this.validationError.entity = true;
          returnVal = false;
        }
        if (!this.form.owner) {
          this.validationError.owner = true;
          returnVal = false;
        }
        this.validationError = { ...this.validationError };
        return returnVal;
      },
    },
  };
</script>

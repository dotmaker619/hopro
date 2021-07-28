<template>
  <div class="sh-form" @keyup.enter="save">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/entity.svg" />
      <div class="sh-form__content__subtitle is-regular-16-00-19">
        {{ info.header }}
      </div>
      <input
        v-focus
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'Entity Name'"
        :class="{ 'sh-form__content__input--error': validationError.name }"
      />
      <select-input
        v-model="form.organization"
        :selectText="'Organization'"
        :selectOptions="organizations"
        :selected="form.organization"
        @inputChange="organizationChange"
        class="mt-30"
        :validationError="validationError.organization"
      />
      <select-input
        :selectText="'Owner'"
        :selectOptions="users"
        :selected="form.owner"
        @inputChange="ownerChange"
        class="mt-30"
        :validationError="validationError.owner"
      />
      <div
        @click="showAdvanced = !showAdvanced"
        class="sh-form__content__advanced"
      >
        <span class="sh-form__content__advanced__icon">
          <i v-if="showAdvanced" class="fas fa-chevron-down"></i>
          <i v-else class="fas fa-chevron-right"></i>
        </span>
        <span class="sh-form__content__advanced__text">Advanced Option</span>
      </div>
      <advanced-option
        v-if="showAdvanced"
        ref="advanced"
        :type="'entity'"
        v-show="showAdvanced"
        :hideTags="true"
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
      <div v-else @click="save" class="sh-form__content__button is-semiBold-16-600-00">
        {{ details ? "Save Changes" : "Create Entity" }}
      </div>
    </div>
  </div>
</template>
<script>
import {
  organizationService,
  entityService,
  userService,
} from "@/desktop/shared/services/";
// import FormModal from "@/desktop/shared/components/form/form";
import AdvancedOption from "@/desktop/shared/components/form/components/advanced-option";
import SelectInput from "@/desktop/shared/components/form/components/select-input";
import FormMixin from "@/desktop/shared/mixins/form.mixin.vue";

export default {
  mixins: [FormMixin],
  props: ["details", "on_complete", "info"],
  components: {
    AdvancedOption,
    SelectInput,
  },
  data() {
    return {
      service: entityService,
      organizations: null,
      users: [],
    };
  },
  created() {
    if (this.details) this.getEntity();
    this.getOrganizations();
  },
  methods: {
    async getEntity() {
      this.form = await entityService
        .get({ id: this.details.uid })
        .catch((err) => this.handleErrors(err));
      this.getUsers();
      let result = await userService
        .get({ id: this.form.owner.uid })
        .catch((err) => this.handleErrors(err));

      this.form.owner = {
        uid: result.uid,
        name: result.first_name + " " + result.last_name,
      };
      this.resourceReceived = true;
    },
    async getUsers() {
      let result = await userService
        .getAll({
          query: `active=true&include_internal=false&organization=${this.form.organization.uid}`,
          from_server: true,
        })
        .catch((err) => this.handleErrors(err));
      if (result)
        this.users = result.results.map((m) => ({
          uid: m.uid,
          name: m.first_name + " " + m.last_name,
        }));
    },
    async getOrganizations() {
      let result = await organizationService
        .getAll({ query: "no_org" })
        .catch((err) => this.handleErrors(err));
      if (result)
        this.organizations = result.results.map((m) => ({
          uid: m.uid,
          name: m.name,
        }));
    },
    ownerChange(val) {
      this.form.owner = val;
    },
    async organizationChange(val) {
      this.form.organization = val;
      this.form.owner = null;
      this.form = { ...this.form };
      await this.getUsers();
    },
    validate_form() {
      this.validationError = {};
      let returnVal = true;
      if (!this.form.name) {
        this.validationError.name = true;
        returnVal = false;
      }
      if (!this.form.organization) {
        this.validationError.organization = true;
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

<style></style>

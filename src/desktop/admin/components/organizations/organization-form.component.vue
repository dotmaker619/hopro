<template>
  <div class="sh-form" @keyup.enter="save">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/organization.svg" />
      <div class="sh-form__content__subtitle is-regular-16-00-19">{{info.header}}</div>
      <input
        v-focus
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'Organization Name'"
        :class="{ 'sh-form__content__input--error' : validationError && validationError.name }"
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
        v-if="showAdvanced"
        ref="advanced"
        :type="'role'"
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
      <div v-else @click="save" class="sh-form__content__button">
        {{details ? 'Save Changes' : 'Create Organization'}}
      </div>
    </div>
  </div>
</template>
<script>
import { organizationService, userService } from "@/desktop/shared/services/";
import AdvancedOption from "@/desktop/shared/components/form/components/advanced-option";
import FormMixin from "@/desktop/shared/mixins/form.mixin.vue";

export default {
  mixins: [FormMixin],
  props: ["details", "on_complete", "info"],
  data(){
    return {
      service:organizationService
    }
  },
  components: {
    AdvancedOption,
  },
  created() {
    if (this.details) this.getDetails();
  },
  methods: {
    validate_form() {
      this.validationError = {};
      let returnVal = true;
      if (!this.form.name) {
        this.validationError.name = true;
        returnVal = false;
      }
      this.validationError = { ...this.validationError };
      return returnVal;
    }
  },
};
</script>

<style></style>

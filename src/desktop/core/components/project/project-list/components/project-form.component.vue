<template>
  <div class="sh-form" @keyup.enter="save">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/team.svg" />
      <form-top :info="info"></form-top>
      <input
        v-focus
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'New Project'"
        :class="{ 'sh-form__content__input--error' : validationError && validationError.name }"
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
import { projectService, groupService } from "@/desktop/shared/services/";

import FormTop from "@/desktop/shared/components/form/form-top";
import SelectInput from "@/desktop/shared/components/form/components/select-input";
// import FormMixin from "@/desktop/shared/mixins/form.mixin";
export default {
  // mixins: [FormMixin],
  components: {
    FormTop,
    SelectInput
  },
  props: ["details", "on_complete", "info"],
  data() {
    return {
      validationError:{},
      service: projectService,
      form: {},
      awaitingResponse: false,
      group_name: null,
      resourceReceived: false
    };
  },
  async created() {
    if (this.details) {
      await this.getProject();
      this.group_name = this.form.group.name;
    } else {
      let { name } = await groupService
        .get({ id: this.info.group_id })
        .catch(err => this.handleErrors(err));
      this.group_name = name;
    }
  },
  methods: {
    async save() {
      if (this.validate_form()) {
        this.awaitingResponse = true;
        let promise;
        if (this.details) {
          promise = projectService.put({
            group_id: this.details.group.uid,
            id: this.details.uid,
            body: this.form
          });
        } else {
          promise = projectService.post({group_id: this.info.group_id, body: this.form });
        }
        await promise
          .then(() => {
            this.$emit("close");
            this.on_complete();
          })
          .catch(err => this.handleErrors(err));
        this.awaitingResponse = false;
      }
    },
    async getProject() {
      this.form = await projectService
        .get({
          group_id: this.details.group.uid,
          id: this.details.uid
        })
        .catch(err => this.handleErrors(err));
      this.resourceReceived = true;
    },
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
  }
};
</script>
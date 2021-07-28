<template>
<div class="sh-form" @keyup.enter="save">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/mission.svg" />
      <form-top :info="info"></form-top>
      <input
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'Mission Name'"
        :class="{ 'sh-form__content__input--error' : validationError.name }"
      />
      <select-input
        :selectText="'Select Group'"
        :selectOptions="groups"
        :selected="form.group"
        @inputChange="groupChange"
        :disabled="groupDisabled"
        class="mt-30 mb-50"
        :validationError="validationError && validationError.group"
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
import { missionService, groupService } from "@/desktop/shared/services/";
import FormTop from "@/desktop/shared/components/form/form-top";
import SelectInput from "@/desktop/shared/components/form/components/select-input";

export default {
  components: {
    FormTop,
    SelectInput
  },
  props: [
    "details",
    "on_complete",
    "info",
  ],
  data() {
    return {
      form: {},
      groups: null,
      groupDisabled: false,
      awaitingResponse: false,
      resourceReceived: false,
      validationError: {}
    };
  },
  created() {
    if (this.details) this.populate_for_edit();
    else this.form.organization = this.$store.state.current_organization.uid;
    this.getGroups();
  },
  methods: {
    async populate_for_edit() {
      this.form = await missionService
        .get({ id: this.details.uid })
        .catch(err => this.handleErrors(err));
      this.form.group = await groupService
        .get({ id: this.form.groupUid })
        .catch(err => this.handleErrors(err));
      this.form = { ...this.form };
      this.resourceReceived = true;
    },
    async save() {
      this.formatForm();
      if(this.validate_form()){
        this.awaitingResponse = true;
        let promise;
        if (this.details) {
          promise = missionService.patch({ id: this.details.uid, body: this.form })
        } else {
          promise = missionService.post({ body: this.form })
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
    async getGroups() {
      let result = await groupService
        .getAll()
        .catch(err => this.handleErrors(err));
      if (result)
        this.groups = result.results.map(group =>
          (({ uid, name }) => ({ uid, name }))(group)
        );
      this.handleFormContext();
    },
    handleFormContext() {
      if (this.info.group_id) {
        this.groupChange(
          this.groups.find(f => f.uid === this.info.group_id)
        );
        this.groupDisabled = true;
      }
    },
    groupChange(val) {
      this.form.group = val;
    },
    formatForm() {
      this.form.groupUid = this.form.group.uid;
      // delete this.form.group;
    },
    validate_form() {
      this.validationError = {};
      let returnVal = true;
      if (!this.form.name) {
        this.validationError.name = true;
        returnVal = false;
      }
      if(!this.form.groupUid){
        this.validationError.group = true;
        returnVal = false;
      }
      this.validationError = { ...this.validationError };
      return returnVal;
    }
  }
};
</script>

<style>
</style>
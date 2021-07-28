<template>
  <div class="sh-form" @keyup.enter="save"
  v-if="(details && resourceReceived)|| !details">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/team.svg" />
      <form-top :info="info"></form-top>
      <input
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'New Team'"
        :class="{ 'sh-form__content__input--error' : validationError.name }"
      />
      <select-input
        :selectText="'Select Parent Team'"
        :selectOptions="parentTeams"
        :selected="form.label"
        @inputChange="parentTeamChange"
        class="mt-30"
      />
      <div @click="showAdvanced = !showAdvanced;" class="sh-form__content__advanced">
        <span class="sh-form__content__advanced__icon">
          <i v-if="showAdvanced" class="fas fa-chevron-down"></i>
          <i v-else class="fas fa-chevron-right"></i>
        </span>
        <span class="sh-form__content__advanced__text">Advanced Option</span>
      </div>
      <advanced-option
        ref="advanced"
        :type="'team'"
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
      <div v-else @click="save" class="sh-form__content__button">Save Changes</div>
    </div>
  </div>
</template>

<script>
import SelectInput from "@/desktop/shared/components/form/components/select-input";
import { teamService } from "@/desktop/shared/services/";
import AdvancedOption from "@/desktop/shared/components/form/components/advanced-option";
import FormTop from "@/desktop/shared/components/form/form-top";
import FormMixin from "@/desktop/shared/mixins/form.mixin";

export default {
  components: {
    SelectInput,
    AdvancedOption,
    FormTop
  },
  props: ["details", "on_complete", "info"],
  mixins: [FormMixin],
  data() {
    return {
      service: teamService,
      parentTeams: null,
    };
  },
  async created() {
    if (this.details) await this.getDetails();
    else this.form.organization = this.$store.state.current_organization;
    this.getParentTeams();
  },
  methods: {
    async save() {
      if (this.validate_form()) {
        this.awaitingResponse = true;
        this.get_advanced();
        let promise;

        let payload = {
          body: this.form
        };
        if (this.info.group_id) payload.group_id = this.info.group_id;
        if (this.details) {
          payload.id = this.details.uid;
          promise = teamService.put(payload);
        } else {
          promise = teamService.post(payload);
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
    async getParentTeams() {
      let result = await teamService
        .getAll({
          query: `organization=${this.form.organization.uid}`
        })
        .catch(err => this.handleErrors(err));
      this.parentTeams = result.results
        .filter(team => team.uid !== this.$route.params.id)
        .map(team => (({ uid, name }) => ({ uid, name }))(team));
    },
    parentTeamChange(val) {
      this.form.label = val;
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
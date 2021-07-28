<template>
  <div>
    <modal
      name="resume"
      transition="nice-modal-fade"
      classes="demo-modal-class"
      :min-width="100"
      :min-height="100"
      :adaptive="true"
      :scrollable="true"
      :reset="true"
      width="30%"
      height="auto"
    >
      <div class="sh-form">
        <div class="sh-form__header is-small">
          <h2 class="sh-form__header__title">Settings</h2>
          <i @click="$modal.hide('resume')" class="fa fa-times sh-form__header__close" aria-hidden="true"></i>
        </div>
        <div class="sh-form__content">
          <p class="sh-medium-header">Steps</p>

          <div class="columns">
            <div class="column" v-for="step in steps" :key="step">
              <div class="field is-flex is-vcenter">
                <input
                  type="checkbox"
                  :class="{ 'is-disabled': step == 'calib' }"
                  class="sh-custom-checkbox"
                  name="step"
                  :id="step"
                  v-model="selected_steps"
                  @change="update_steps(step)"
                  :value="step"
                />
                <label class="is-capitalized ml-10 sh-text-normal-16" :for="step">{{ step }}</label>
              </div>
            </div>
          </div>
          <div class="padding-10" @click="resume" :class="{ 'is-disabled': selected_steps.length < 2 }">
            <div class="sh-button">Resume now</div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
  import { processingService } from "@/desktop/shared/services/";

  export default {
    props: ["process_id", "process"],
    data() {
      return {
        steps: ["calib", "dense", "ortho"],
        selected_steps: [],
      };
    },
    created() {
      this.selected_steps.push("calib");
    },

    methods: {
      update_steps(step) {
        if (step == "ortho" && !_.includes(this.selected_steps, "dense")) {
          this.selected_steps.push("dense");
        } else if (step == "dense" && _.includes(this.selected_steps, "ortho")) {
          _.pull(this.selected_steps, "ortho");
        }
      },
      openResumePopUp() {
        this.$modal.show("resume");
      },
      async resume() {
        let stepsRemaining = this.process == "dense" ? _.without(this.selected_steps, this.process) : this.selected_steps;
        let stepsToDo = _.without(stepsRemaining, "calib");
        await processingService
          .resume({
            id: this.process_id,
            body: { steps: stepsToDo },
          })
          .catch((err) => {
            this.handleErrors(err);
          });
        this.$modal.hide("resume");
      },
    },
  };
</script>

<style lang="scss">
  .sh-form__settings {
    padding: 0 12rem;
  }
</style>

<template>
  <div v-if="access('core', 'create_teams')">
    <div
      v-if="!is_input"
      @click="is_input = true"
      class="add-teams-modal-add mt-20 ml-15 mb-10 is-pointer"
    >
      <img src="@/assets/icons/add-feature-type.svg" />
      <span class="ml-15 is-medium-16-500-19">New Team </span>
    </div>
    <div v-else class="is-flex align-center ml-15 mt-20 mb-10">
      <i
        @click="is_input = false"
        class="fa fa-times add-item__content__top__row__cancel mr-10"
      />

      <input
        placeholder="New Team Name"
        style="
          outline: none;
          border: 0;
          border-bottom: 1px dotted darkgrey;
          width: 100%;
          padding: 7px 0;
        "
        @keyup.enter="save()"
        type="text"
        v-model="form.name"
        :disabled="creating"
        v-click-outside="() => (is_input = false)"
      />
        <div v-if="creating" class="sh-button is-medium-16-500-19 ml-40 has-text-white is-flex align-center" style="width: 74px; height: 34px">
          <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
        </div>
        <div v-else @click="save()" class="sh-button is-medium-16-500-19 ml-40 has-text-white is-flex align-center" style="width: 74px; height: 34px">
          Save
        </div>
    </div>
  </div>
</template>

<script>
import { teamService } from "@/desktop/shared/services/";
export default {
  props: ["asset_id"],
  data() {
    return {
      creating: false,
      is_input: false,
      form: {
        asset_id: this.asset_id,
        name: "",
        organization: this.$store.state.current_organization,
      },
    };
  },
  methods: {
    save() {
      if (this.form.name && !this.creating) {
        this.creating = true;
        teamService.post({ body: this.form }).then((res) => {
          this.creating = false;
          console.log("Team Added");
          this.form.name = "";
          this.$store.commit("ADD_NEW_TEAM", res);
        });
      }
    },
  },
};
</script>

<style>
.add-teams-modal-add {
  font-family: Barlow-Medium;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.19;
  color: #2585d3;
}
</style>
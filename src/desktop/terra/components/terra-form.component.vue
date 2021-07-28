<template>
  <div class="sh-form" @keyup.enter="save" v-if="(details && resourceReceived) || !details">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/group.svg" />
      <form-top :info="info"></form-top>
      <input
        v-model="form.name"
        class="sh-form__content__input"
        type="text"
        :placeholder="'New terra'"
        :class="{ 'sh-form__content__input--error': validationError.name }"
      />

      <div class="add-groups" v-click-outside="clicked_outside_groups">
        <div class="add-groups__text">Add Groups</div>
        <div class="add-groups__terra">
          <div class="add-groups__terra__button" v-for="(group, i) in form.groups" :key="i">
            <div class="add-groups__terra__button__icon">{{ group.name ? group.name[0] : "0" }}</div>
            <div class="add-groups__terra__button__text">
              {{ group.name ? group.name : "" | truncate(8) }}
            </div>
            <i @click="removeItemUid = group.uid" class="fa fa-times add-groups__terra__button__close" aria-hidden="true" />
          </div>
        </div>
        <select-input
          ref="selectGroupInput"
          :selected="form.groups"
          :selectText="'Search Groups'"
          :selectOptions="groups"
          :multi="true"
          :showIcon="true"
          :removeItem="removeItemUid"
          :closeDropdown="closeGroupDropdown"
          @inputChange="groupsChange"
          class="ml-10"
          :validationError="validationError.groupUid"
        />
      </div>
      <div @click="showAdvanced = !showAdvanced" class="sh-form__content__advanced">
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
      <div class="mt-10 is-medium-16-500-50 has-text-centered has-text-danger" v-if="errors">Something went wrong</div>
      <div v-if="awaitingResponse" class="sh-form__content__button">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="save" class="sh-form__content__button">{{ details ? "Save Changes" : "Create terra view" }}</div>
    </div>
  </div>
</template>

<script>
  import SelectInput from "@/desktop/shared/components/form/components/select-input";
  import { terraService, groupService } from "@/desktop/shared/services/";
  import AdvancedOption from "@/desktop/shared/components/form/components/advanced-option";
  import FormTop from "@/desktop/shared/components/form/form-top";
  import FormMixin from "@/desktop/shared/mixins/form.mixin.vue";

  export default {
    components: {
      SelectInput,
      AdvancedOption,
      FormTop,
    },
    mixins: [FormMixin],
    props: ["details", "on_complete", "info"],
    data() {
      return {
        service: terraService,
        form: {
          organization: null,
          owner: null,
          groups: [],
          tags: [],
          properties: {
            icon: "",
            cover_image: "",
            color: "",
          },
        },
        groups: null,
        removeItemUid: null,
        closeGroupDropdown: null,
      };
    },
    async created() {
      if (this.details) await this.getDetails();
      else {
        this.form.organization = this.$store.state.current_organization.uid;
        this.form.owner = { uid: this.$store.state.claims.user_id };
      }
      this.getGroups();
    },
    methods: {
      async save() {
        if (this.validate_form()) {
          this.awaitingResponse = true;
          this.format_form();
          this.get_advanced();
          let promise;
          if (this.details) {
            promise = this.service.put({
              id: this.details.uid,
              body: this.form,
            });
          } else {
            promise = this.service.create_view({ body: this.form });
          }
          await promise
            .then(() => {
              this.$emit("close");
              this.on_complete();
            })
            .catch((err) => this.handleErrors(err, true));
          this.awaitingResponse = false;
        }
      },
      async getGroups() {
        let result = await terraService
          .get_groups({
            query: `organization=${this.form.organization}`,
          })
          .catch((err) => this.handleErrors(err, true));
        if (result) this.groups = result.map((group) => (({ uid, name }) => ({ uid, name }))(group));
      },
      groupsChange(value) {
        this.form.groups = value;
        this.removeItemUid = null;
      },
      clicked_outside_groups() {
        this.$refs.selectGroupInput.dropdown = false;
      },
      format_form() {
        this.form.groups = this.form.groups.map((g) => g.uid);
      },
      validate_form() {
        this.validationError = {};
        let returnVal = true;
        if (!this.form.name) {
          this.validationError.name = true;
          returnVal = false;
        }
        if (!this.form.groups.length > 0) {
          this.validationError.groupUid = true;
          returnVal = false;
        }
        this.validationError = { ...this.validationError };
        return returnVal;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .add-groups {
    margin-top: 3rem;
    margin-bottom: 4rem;
    width: 100%;
    align-content: left;
    &__text {
      line-height: 4rem;
      font-weight: 500;
      font-size: 1.7rem;
    }
    &__terra {
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
        border: 1px solid grey; // change color from api
        border-radius: 20px;
        &__icon {
          width: 2.25rem;
          height: 2.25rem;
          font-size: 1.4rem;
          font-weight: 600;
          margin-right: 0.75rem;
          background-color: grey; //  change color from api
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
        }
        &__close {
          margin-left: 0.75rem;
          color: #5b607e;
          font-size: 1.25rem;
          cursor: pointer;
        }
      }
    }
    &__multiselect {
    }
  }
</style>

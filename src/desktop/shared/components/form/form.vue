<template>
  <!-- do we need classes in modal attribute, if yes explore how to use'em better -->
  <modal
    :name="$route.name"
    transition="nice-modal-fade"
    classes="demo-modal-class"
    :min-width="200"
    :min-height="200"
    :adaptive="true"
    :scrollable="true"
    :reset="true"
    :pivot-y="0.5"
    width="45%"
    height="auto"
    @before-close="emit_to_refresh"
    @closed="change_route"
  >
    <div
      class="sh-form"
      @keyup.enter="
        closedAfterAction = true;
        $emit(formType, $route.name);
      "
      tabindex="0"
    >
      <div class="sh-form__header">
        <h1 class="sh-form__header__title">{{ formType }} {{ formType === "create" ? "new" : "" }} {{ type }}</h1>
        <i @click="$modal.hide($route.name)" class="fa fa-times sh-form__header__close" aria-hidden="true"></i>
      </div>
      <div class="sh-form__content">
        <img :src="iconPath" />
        <div v-if="!hideOrganizationContent">
          <p class="sh-form__content__subtitle">{{ formType[0].toUpperCase() + formType.slice(1) }} {{ type }} for</p>
          <div class="sh-form__content__organization">
            <div class="sh-form__content__organization__icon" :style="`background-color: ${hashed_color(organizationName, 'projectManagement')}`">
              {{ organizationName && organizationName.charAt(0) }}
            </div>
            <div class="sh-form__content__organization__name">{{ organizationName }}</div>
          </div>
        </div>
        <slot name="basic"></slot>
        <div
          v-show="!hideAdvanced"
          @click="
            advanced = !advanced;
            $emit('toggle_advanced');
          "
          class="sh-form__content__advanced"
        >
          <span class="sh-form__content__advanced__icon">
            <i v-if="advanced" class="fas fa-chevron-down"></i>
            <i v-else class="fas fa-chevron-right"></i>
          </span>
          <span class="sh-form__content__advanced__text">Advanced Option</span>
        </div>
        <slot name="advanced"></slot>
        <div v-if="awaitingResponse" class="sh-form__content__button">
          <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
        </div>
        <div
          v-else
          @click="
            closedAfterAction = true;
            $emit(formType, $route.name);
          "
          class="sh-form__content__button"
        >
          {{ formType === "edit" ? "Save Changes" : `${formType} ${type}` }}
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
  import Vue from "vue";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    props: {
      type: {
        validator(value) {
          // The value must match one of these strings
          return (
            ["organization", "entity", "user", "role", "team", "asset", "group", "container", "mission", "terra", "project"].indexOf(value) !== -1
          );
        },
      },
      icon: String,
      service: Object,
      hideAdvanced: Boolean,
      group_name: String,
      hideOrganizationContent: Boolean,
      awaitingResponse: Boolean,
    },
    mounted() {
      this.$modal.show(this.$route.name);
    },
    computed: {
      iconPath() {
        return require("@/assets/icons/form/" + this.icon);
      },
      formType() {
        let routeNameArray = this.$route.name.split("-");
        return routeNameArray[routeNameArray.length - 1];
      },
      organizationName() {
        if (this.$route.name == "group-project-create") {
          return this.group_name;
        }
        return this.$store.state.current_organization.name;
      },
      isUserForm() {
        if (this.$route.name === "user-create" || this.$route.name === "user-edit") return true;
        return false;
      },
      isEntityForm() {
        if (this.$route.name === "entity-create" || this.$route.name === "entity-edit") return true;
        return false;
      },
    },

    data() {
      return {
        advanced: false,
        pageType: null,
        isContextForm: false,
        contextObj: {},
        closedAfterAction: false,
      };
    },
    created() {
      let routeNameArray = this.$route.name.split("-");
      this.isContextForm = routeNameArray.length === 3 ? true : false;
      this.pageType = routeNameArray[routeNameArray.length - 1];

      if (this.isContextForm) {
        this.contextObj.detailName = routeNameArray[0];
        this.contextObj.listName = routeNameArray[1];
      }
    },
    methods: {
      emit_to_refresh() {
        if (this.closedAfterAction)
          if (this.pageType === "create") {
            if (this.isContextForm) this.$eventHub.$emit(`refresh-${this.contextObj.detailName}-details`);
            this.$eventHub.$emit(`refresh-${this.type}-list`);
          } else if (this.pageType === "edit") {
            this.$eventHub.$emit(`refresh-${this.type}-details`);
            this.$eventHub.$emit(`refresh-${this.type}-list`);
          }
      },
      change_route() {
        if (this.pageType === "create")
          if (this.isContextForm)
            this.$router.push({
              name: `${this.contextObj.detailName}-details-${this.contextObj.listName}s`,
              params: { id: this.$route.params.id },
            });
          else
            this.$router.push({
              name: `${this.isUserForm ? "admin-user" : this.type}-list`,
            });
        else if (this.pageType === "edit")
          this.$router.push({
            name: `${this.isUserForm ? "admin-user-list" : this.isEntityForm ? "entity-list" : `${this.type}-details`}`,
            params: { id: this.$route.params.id },
          });
        this.$emit("close-form");
      },
    },
  };
</script>

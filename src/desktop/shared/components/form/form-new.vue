<template>
  <div class="sh-form" @keyup.enter="$emit('save')" tabindex="0">
    <div class="sh-form__content">
      <img :src="iconPath" />
      <div v-if="!hideOrganizationContent">
        <p class="sh-form__content__subtitle is-regular-16-00-19">{{ heading2 }}</p>
        <div class="sh-form__content__organization">
          <div class="sh-form__content__organization__icon" :style="`background-color: ${hashed_color(heading3, 'projectManagement')}`">
            {{ heading3 && heading3.charAt(0) }}
          </div>
          <div class="sh-form__content__organization__name">{{ heading3 }}</div>
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
      <div v-else @click="$emit('save')" class="sh-form__content__button">Save Changes</div>
    </div>
  </div>
</template>

<script>
  import Vue from "vue";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    props: {
      icon: String,
      hideAdvanced: Boolean,
      hideOrganizationContent: Boolean,
      awaitingResponse: Boolean,

      heading1: String,
      heading2: String,
      heading3: String,
    },
    data() {
      return {
        advanced: false,
      };
    },
    computed: {
      iconPath() {
        return require("@/assets/icons/form/" + this.icon);
      },
    },
  };
</script>

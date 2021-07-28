<template>
  <div>
    <p class="sh-form__content__subtitle is-regular-16-00-19">{{ info.header }}</p>
    <div class="sh-form__content__organization">
      <div class="sh-form__content__organization__icon" :style="`background-color: ${hashed_color(info.subheader, 'projectManagement')}`">
        {{ info.subheader && info.subheader.charAt(0) }}
      </div>
      <div class="sh-form__content__organization__name">{{ info.subheader }}</div>
    </div>
  </div>
</template>

<script>
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    props: {
      info: Object,
    },
    data() {
      return {};
    },
  };
</script>

<style></style>

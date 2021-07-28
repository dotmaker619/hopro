<template>
  <div class="is-flex align-center" style="flex-direction: column">
    <sh-icon :name="'search'" class="is-30x30 mb-15 has-opacity-7" />
    <div class="is-regular-14-00-22 has-primary-text has-opacity-7">
      No results for
    </div>
    <div v-if="search" class="is-medium-16-500-22 has-primary-text is-flex">
      <div class="truncate-text">&#8220;{{ search }}&#8221;</div>
    </div>
    <div
      v-if="!is_valid_email"
      class="is-regular-14-00-22 has-primary-text has-opacity-7 has-text-centered"
    >
      You may want to try using different keywords.
    </div>
  </div>
</template>

<script>
export default {
  props: ["search"],
};
</script>
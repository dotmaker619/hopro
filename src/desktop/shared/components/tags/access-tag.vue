<template>
  <div>
    <span v-if="access == 'read' || access == 'write'" style="margin-right: 1.5rem">
      <span class="sh-access-tag sh-access-tag--read">
        <i class="fa fa-check" aria-hidden="true"></i>
      </span>
      <span class="sh-access-tag__text">Read</span>
    </span>
    <span v-if="access == 'write'">
      <span class="sh-access-tag sh-access-tag--write">
        <i class="fa fa-check" aria-hidden="true"></i>
      </span>
      <span class="sh-access-tag__text">Write</span>
    </span>
  </div>
</template>

<script>
export default {
  props: ["access"]
};
</script>
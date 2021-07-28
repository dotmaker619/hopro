<template>
  <div
    class="sh-comment-replies is-flex align-center mt-5"
  >
    <div
      @click="$emit('clicked')"
      class="sh-comment-replies__button is-pointer mr-20"
    >
      {{ comment.reply_count }} replies > 
    </div>
    <div
      class="is-regular-14-00-17 has-text-theme-black has-opacity-6 sh-created-at"
    >
       <!-- Last updated {{ new Date(comment.updated_at).toISOString() | prettyDate }} -->
    </div>
  </div>
</template>
<script>
export default {
  props: ["ticket","comment"]
} 
</script>  
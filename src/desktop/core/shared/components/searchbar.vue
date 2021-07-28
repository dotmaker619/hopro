<template>
  <div>
    <p class="searchbar control has-icons-left">
      <input
        v-focus
        @keyup="search"
        v-model="search_keyword"
        class="searchbar__input input"
        placeholder="Search "
        autocomplete="off"
      />
      <span class="icon is-large is-left">
        <sh-icon :name="'search'" :file="'helper_sprite'" class="is-20x20"></sh-icon>
      </span>
    </p>
  </div>
</template>
<script>
import SearchbarMixin from "@/desktop/core/shared/components/searchbar.mixin.vue"
export default {
  mixins: [SearchbarMixin]
};
</script>
<style lang="scss">
.searchbar {
  width: 38rem;
  height: 4rem;
  &__input {
    height: 4rem;
    border: none;
    border-radius: 0.5rem;
    box-shadow: 2px 2px 2px 0px rgba(23, 30, 72, 0.164);
    :placeholder {
      font-size: 1rem;
    }
    &:focus {
      box-shadow: 2px 2px 4px 0px rgba(23, 30, 72, 0.164);
    }
  }
}
</style>
<template>
  <div>
    <div @click="openKeyDropdown = !openKeyDropdown" class="filter-key is">
      {{ selected | truncate(12) }}
      <svg viewBox="0 0 100 100" class="image is-16x16">
        <use
          v-if="openKeyDropdown"
          xlink:href="@/assets/icons/sprite.svg#expand"
        />
        <use v-else xlink:href="@/assets/icons/sprite.svg#collapse" />
      </svg>
    </div>
    <div
      v-if="openKeyDropdown"
      class="filter-row has-slimscroll"
      v-click-outside="() => (openKeyDropdown = false)"
    >
      <div
        v-for="(filter_item, index) in key_filter_value"
        :key="index"
        class="filter-row__item is-bottom-border"
        @click="
          selected = filter_item;
          key_filter();
        "
      >
        {{ filter_item }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      openKeyDropdown: false,
      selected: "Select",
      key_filter_value: {
        assignee: "Assignee",
        due_date: "Due Date",
      },
    };
  },
  methods: {
    key_filter() {
      this.$eventHub.$emit("filter_assignee", this.selected);
      this.openKeyDropdown = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>

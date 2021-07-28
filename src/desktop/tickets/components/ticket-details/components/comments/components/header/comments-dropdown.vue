<template>
  <div>
    <div class="sh-dropdown" v-click-outside="() => (active = false)">
      <div v-if="active" @click="active = false" class="backdrop"></div>
      <div @click.prevent.stop="active = !active" class="is-semiBold-14-600-17 is-flex is-pointer mr-40 ml-5">
        <p class="is-flex is-vcenter">
          <span>{{ value }}</span>
          <sh-icon :name="'chevron-down'" class="is-10x10 ml-5"></sh-icon>
        </p>
        <!-- {{ value }} -->
        <!-- <img class="ml-5" src="@/assets/icons/chevron-down.svg" alt /> -->
      </div>
      <ul class="sh-dropdown-content" v-if="active" @click.stop>
        <li
          v-for="(item, i) in items"
          :key="item"
          class="sh-dropdown-content__item"
          @click="
            $emit('input', item);
            $emit('clicked', i);
            active = false;
          "
        >
          <div class="sh-dropdown-content__item--text is-medium-16-500-19 is-capitalized">
            {{ item }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["items", "value"],
    data() {
      return {
        active: false,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .sh-dropdown-content {
    right: 0%;
  }
</style>

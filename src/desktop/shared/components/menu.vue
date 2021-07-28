<template>
  <div>
    <div class="sh-dropdown">
      <div @mousedown="changeLayout">
        <slot></slot>
      </div>
      <div v-if="active" v-touch:start.stop @click="$emit('clicked-outside')" class="backdrop"></div>
      <div
        v-click-outside="() => $emit('clicked-outside')"
        :style="`width:${width};${offsetY};${offsetX}`"
        class="sh-dropdown-content"
        v-if="active"
      >
        <slot name="prepend"></slot>
        <ul class="sh-dropdown-content__Box has-slimscroll-xs">
          <li class="is-flex is-between sh-dropdown-content__list">
            <p
              v-for="icon in icons"
              :key="icon"
              :class="{'is-disabled':icon.is_disabled}"
              v-tooltip="icon.tooltip"
              class="actions-dropdown-content__list--item"
              @click.stop="$emit('icon-clicked', icon.action)"
            >
              <slot name="image-heading" :icons="icon">
                <sh-icon :name="icon.icon" class="is-18x18" />
              </slot>
            </p>
          </li>
          <li
            v-for="item in items"
            :key="item"
            :class="{'is-disabled':item.is_disabled}"
            class="sh-dropdown-content__item"
            @click.stop="$emit('item-clicked', item.action)"
            :item="item"
          >
            <slot name="item" :item="item">
              <sh-icon :name="item.icon" class="is-22x22 sh-dropdown-content__item--icon" />
              <span
                class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black"
              >{{ typeof(item.text) === 'function'?item.text(data):item.text }}</span>
            </slot>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["icons", "items", "active", "width", "data"],
  methods: {
    changeLayout(e) {
      this.offsetX =
        window.innerWidth - e.x < window.innerWidth / 2
          ? "left:unset;right:0rem"
          : "left:2rem;right:unset";
      this.offsetY =
        window.innerHeight - e.y < window.innerHeight / 2
          ? "bottom:2rem;top:unset"
          : "top:2rem;bottom:unset";
    },
  },
};
</script>

<style lang="scss" scoped>
.sh-dropdown-content {
  box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
  border: solid 1px rgba(23, 30, 72, 0.15);
  left: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  &__item {
    padding: 0.75rem 1.5rem;
  }
}

.sh-dropdown-content__item--icon {
  height: 2rem;
  width: 2rem;
}
.sh-dropdown-content__item--text {
  padding: 0.7rem 0rem;
  span {
    white-space: nowrap;
    line-height: 50px;
  }
}

.sh-dropdown-content__Box {
  overflow-y: auto;
  max-height: 29rem;
}

.sh-dropdown-content__list {
  margin: 0rem 2rem;
  &--item {
    padding: 1rem;
    border-radius: 2rem;

    &:hover {
      background-color: $primary-background;
      cursor: pointer;
    }
  }
}

.is-24x24 {
  height: 2.4rem;
  width: 2.4rem;
}
</style>

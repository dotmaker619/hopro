<template>
  <div class="dropdown">
    <div class="dropdown__trigger" @click.stop="active=!active" v-click-outside="onClickOutside">
      <button
        class="level is-mobile"
        :class="[[triggerIsIcon ? 'dropdown__trigger--icon' :'dropdown__trigger--button  pl-20 pr-20' ], { 'dropdown__trigger--button-active' :active  }, {'is-selection-square' : selectionIsSquare}]"
      >
        <div class="level-left">
          <slot name="selection"></slot>
        </div>
        <div class="level-right">
          <sh-icon v-if="icon == 'expand'" :name="`${active?'expand':'collapse'}`" class="is-16x16"></sh-icon>
          <div v-else-if="icon=='none'"></div>
          <sh-icon v-else :name="'3-dots-menu'" class="is-20x20"></sh-icon>
        </div>
      </button>
    </div>
    <div
      class="dropdown__content"
      :class="[
        [triggerIsIcon || selectionIsSquare ? 'dropdown__content--squared' :'dropdown__content--rounded pl-5 pr-5' ],
    
    {'is-hidden' : !active}]"
    >
      <div class="dropdown__content--size">
        <div @click.stop="active=true">
          <slot name="search"></slot>
        </div>
        <div class="dropdown__height has-slimscroll">
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["selection", "triggerIsIcon", "icon", "selectionIsSquare"],
  data() {
    return {
      active: false,
    };
  },
  methods: {
    onClickOutside() {
      this.active = false;
    }
  }
};
</script>
<style lang="scss" >
.dropdown {
  position: relative;

  &__trigger {
    :focus {
      outline: transparent auto 0px;
    }
    &--button {
      cursor: pointer;
      margin: auto;
      width: 26rem;
      height: 4.5rem;
      border-radius: 2rem;

      background-color: $primary-background;
      border: none;
      font-size: 1.4rem;
      font-weight: 500;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

      :focus {
        outline: transparent auto 0px;
      }

      &.is-selection-square {
        border-radius: 0.5rem;
        background-color: $white;
        width: max-content;
      }
      &-active {
        border-top-right-radius: 2rem;
        border-top-left-radius: 2rem;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
        background-color: $white;
        box-shadow: 0px 5px 12px 2px $shadow-color;
      }
    }
    &--icon {
      all: unset;
      padding: 0.5rem;
      cursor: pointer;
    }
  }
  &__content {
    position: absolute;
    top: 4.4rem;
    background: $white;
    overflow: hidden;
    font-size: 1.4rem;
    z-index: 10;

    &--rounded {
      box-shadow: 0px 8px 10px 0px $shadow-color;
      border-bottom-right-radius: 2rem;
      border-bottom-left-radius: 2rem;
      width: 26rem;
    }
    &--squared {
      box-shadow: 0px 2px 4px 0px $shadow-color;
      border-radius: 0.5rem;
      min-width: 20rem;
      right: 0;

      p {
        font-weight: 600;
        text-transform: capitalize;
      }
      p:not(:last-of-type) {
        border-bottom: 1px solid $simple-tag;
      }
    }
    &--size {
      div:not(:first-child) {
        font-weight: 700;

        p {
          display: flex;
          height: 5rem;
          padding: 1.5rem;
          cursor: pointer;
          align-items: center;
          &:hover {
            background-color: $primary-background;
            color: $primary;
          }
        }
      }
    }
  }
}
.dropdown__height {
  max-height: 20rem;
  overflow: auto;
}
</style>
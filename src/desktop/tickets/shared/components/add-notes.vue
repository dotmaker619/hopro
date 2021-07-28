<template>
  <div class="notes">
    <div @click="$emit('close')" v-if="isMobile && active" class="notes-backdrop"></div>
    <div v-if="active" :class="{editing}" class="notes-box">
      <div v-if="isMobile" class="is-flex notes-box--heading">
        <div v-if="editing">Add notes</div>
        <div v-else>Notes</div>
        <div @click="$emit('close')">
          <sh-icon name="close" class="is-16x16 is-pointer" />
        </div>
      </div>
      <div @click="!editing&&isMobile?edit=true:''" class="is-flex notes-box--top">
        <textarea
          v-if="editing"
          class="has-slimscroll-xs"
          placeholder="Add notes here"
          v-focus
          v-model="value"
        ></textarea>
        <div v-else class="has-slimscroll-xs notes-box--top__text" v-html="value.replace(/(?:\r\n|\r|\n)/g, '<br>')"></div>
        <div v-if="!isMobile&&editing" @click="$emit('close')">
          <sh-icon name="close" class="is-10x10 is-pointer" />
        </div>
      </div>
      <div class="is-flex notes-box--bottom" v-if="editing">
        <div class="notes-box--bottom__delete" @click="value='';$emit('delete')">
          <sh-icon name="delete-blue" class="is-16x16 is-pointer" />
        </div>
        <div class="notes-box--bottom__submit" @click="$emit('submit',value)"></div>
      </div>
    </div>
    <span @click="edit=false;">
      <slot class="notes-icon"></slot>
    </span>
  </div>
</template>

<script>
export default {
  props: ["notes", "isEditing", "active"],
  data() {
    return {
      value: null,
      edit: false,
      isMobile: false,
    };
  },
  computed: {
    editing: function () {
      return this.edit || this.isEditing;
    },
  },
  mounted() {
    this.isMobile = this.$route.meta.screen === "mobile";
    this.value = this.notes;
  },
};
</script>
<style lang="scss" scoped>
.notes {
  position: relative;
  &-backdrop {
    position: fixed;
    background: #000;
    opacity: 0.5;
    width: 100vw;
    height: 100vh;
    bottom: 0;
    left: 0;
    z-index: 100;
  }
  &-box {
    position: absolute;
    z-index: 2;
    bottom: 35px;
    left: -25px;
    width: max-content;
    min-width: 70px;
    max-width: 280px;
    &.editing {
      width: 280px;
    }
    padding: 10px;
    display: flex;
    flex-flow: column;
    border-radius: 10px;
    box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    border: solid 1px rgba(23, 30, 72, 0.15);
    background-color: white;
    @include for-size(portrait-tablets) {
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 101;
      width: 100%;
      &.editing {
        width: 100%;
      }
      max-width: 100%;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      padding: 0px;
      font-size: 16px;
      border: 0;
    }
    &::before {
      @include for-size(portrait-tablets) {
        display: none;
      }
      position: absolute;
      content: " ";
      background: white;
      width: 20px;
      height: 20px;
      bottom: -4px;
      transform: rotate(45deg);
      left: 28px;
    }
    &--heading {
      font-size: 16px;
      padding: 15px;
      justify-content: space-between;
      border-bottom: 1px solid #e6e6e6;
    }
    &--top {
      width: 100%;
      flex: 1;
      z-index: 1;
      &__text {
        @include for-size(portrait-tablets) {
          font-size: 16px;
          padding: 15px;
        }
        max-height: 400px;
        overflow: auto;
        word-break: break-word;
      }
      textarea {
        @include for-size(portrait-tablets) {
          font-size: 16px;
          padding: 15px;
        }
        height: 100px !important;
        z-index: 1;
        border: none;
        overflow: auto;
        outline: none;
        width: 100% !important;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
        resize: none; /*remove the resize handle on the bottom right*/
      }
    }
    &--bottom {
      @include for-size(portrait-tablets) {
        padding: 0px 15px 15px 0px;
      }
      align-items: center;
      justify-content: flex-end;
      margin-top: 5px;
      &__delete {
        margin-right: 15px;
      }
      &__submit {
        background: #2585d3;
        width: 30px;
        height: 30px;
        border-radius: 200px;
        color: white;
        cursor: pointer;
        &:after {
          content: "";
          display: block;
          position: relative;
          top:8px;
          left:12px;
          width: 6px;
          height: 12px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }
    }
  }
}
</style>

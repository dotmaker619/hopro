<template>
  <div :class="{ selected }" @mouseover="hover = true" @mouseout="hover = false" class="form-submission--forms__user is-flex is-vcenter padding-15">
    <input :class="{ hover }" type="checkbox" name="create" class="sleek-checkbox mr-10" />
    <user-avatar :user="'unknown'" :pxsize="36" class="mr-10"></user-avatar>
    <div class="form-submission--forms__user-name">
      <div class="is-medium-14-500-24">{{ $store.state.claims.firstname + " " + $store.state.claims.lastname }}</div>
      <div class="is-regular-14-00-24 has-text-grey">
        <span> #F231S</span><span style="border-left:1px solid #ccc" class="ml-10 pl-10">4m ago</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["selected"],
    data() {
      return {
        hover: false,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .form-submission {
    &--forms {
      &__user {
        position: relative;
        &.selected::before {
          width: 3px;
          height: 100%;
          content: "";
          background: $primary;
          position: absolute;
          left: 0;
          top: 0;
        }
        & > input {
          opacity: 0;
          pointer-events: none;
          &.hover {
            opacity: 1;
            pointer-events: all;
          }
        }
        background: white;
        border-bottom: 2px solid #f4f7fc;
      }
    }
  }
</style>

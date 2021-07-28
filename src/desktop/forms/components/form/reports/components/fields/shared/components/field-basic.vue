<template>
  <div class="form-field--container">
    <div class="form-field">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["field", "fieldType", "section"],
    data() {
      return {
        showTemplate: false,
      };
    },
    methods: {
      ...mapActions("forms", ["add_field"]),
      duplicateField(field) {
        let obj = {
          ...field,
          section: this.section.uid,
          previousField: field.uid,
          uid: undefined,
        };
        this.add_field({ body: obj });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .form-field {
    background: white;
    border: 2px solid transparent;
    &-options {
      display: flex;
      width: 100%;
      min-height: 80px;
      justify-content: flex-end;
      padding: 15px;
      &.hover {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
    }
    &--create {
      z-index: 41;
    }
    &.hover {
      box-shadow: 0px 0px 10px #2585d380;
      border: 2px solid #6dace1;
    }
    &--container {
      position: relative;
      &__move {
        position: absolute;
        cursor: move;
        left: -30px;
        top: 3px;
      }
    }
    &--heading {
      background: #2585d3 0% 0% no-repeat padding-box;
      border-radius: 4px 4px 0px 0px;
      width: 96px;
      height: 26px;
      font-size: 14px;
      padding: 6px;
      color: #fefefe;
      display: flex;
      align-items: center;
    }

    &-title {
      border-bottom: 1px solid transparent;
      padding: 30px;
      padding-top: 24px;
      padding-bottom: 10px;
      display: flex;
      &--left {
        flex: 1;
      }
      &--right {
        width: 170px;
        display: flex;
        position: relative;
        justify-content: flex-end;
        align-items: center;
      }
      &--text {
        display: block;
        border: 0;
        width: 100%;
      }
      &--description {
        display: block;
        width: 100%;
        border: 0;
      }
      &--options {
        width: 138px;
        height: 44px;
        box-shadow: 0px 3px 6px #2585d34d;
        border: 2px solid #2585d3;
        border-radius: 4px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        position: relative;
        padding: 10px 0px;
        > .image {
          cursor: pointer;
        }
        .form-divide {
          height: 100%;
          width: 0px;
          border-left: 1px solid #e6e6e6;
        }
        &__more {
          position: absolute;
          z-index: 40;
          top: 50px;
          left: 85px;
          background: #ffffff 0% 0% no-repeat padding-box;
          box-shadow: 0px 5px 20px #171e481a;
          border-radius: 6px;
          width: 200px;
          height: 81px;
          display: flex;
          flex-flow: column;
          padding: 0px 20px;
          justify-content: space-around;
          &-items {
            cursor: pointer;
          }
        }
      }
    }
  }
</style>

<template>
  <div class="form-section--container" @mouseleave="option = false">
    <div class="form-section--heading"></div>
    <div class="form-section">
      <div class="form-section-title">
        <div class="form-section-title--left">
          <div class="is-medium-14-500-17 mb-5">Section {{ number }} of {{ sectionLength }}</div>
          <div class="form-section-title--text">{{ section.name }}</div>
          <div class="form-section-title--description has-text-grey mt-10 is-medium-13-500-16" v-text="section.description"></div>
        </div>
      </div>
      <div class="form-section-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["section", "number", "sectionLength"],
    data() {
      return {
        option: false,
        showTemplate: false,
        isSave: false,
      };
    },
    computed: {
      ...mapGetters("forms", ["selectedForm"]),
    },
    methods: {
      ...mapActions("forms", ["delete_section", "update_section", "add_section_template", "load_section_template"]),
      async duplicateSection(section) {
        let template = await this.add_section_template({ body: { name: section.name, uid: section.uid } });
        this.load_section_template({
          body: {
            name: template.data.name,
            uid: template.data.uid,
            form: this.selectedForm.uid,
            "previousSection": section.uid,
          },
        });
      },
      updateSection() {
        this.update_section({
          id: this.section.uid,
          body: this.section,
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .form-section {
    background: white;
    border: 2px solid transparent;
    &.hover {
      box-shadow: 0px 0px 10px #2585d380;
      border: 2px solid #6dace1;
    }
    &--container {
      position: relative;
      margin: 3rem 0;
      box-shadow: 0px 2px 5px #171e480d;
      border-radius: 6px;
      &__move {
        position: absolute;
        cursor: move;
        left: -30px;
        top: 3px;
      }
    }
    &--heading {
      background: #2585d3 0% 0% no-repeat padding-box;
      width: 100%;
      height: 6px;
      opacity: 0.5;
      box-shadow: 0px 2px 5px #171e480d;
      border-radius: 3px 3px 0px 0px;
    }

    &-title {
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
      }
      &--text {
        display: block;
        border: 0;
        width: 100%;
        font-family: Barlow-SemiBold;
        font-size: 22px;
        font-weight: 600;
        line-height: 26px;
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
          height: 122px;
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

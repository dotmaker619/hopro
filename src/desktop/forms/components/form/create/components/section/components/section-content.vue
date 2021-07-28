<template>
  <div
    class="form-section--container"
    @mouseover="hover = true"
    @mouseleave="
      hover = false;
      option = false;
    "
  >
    <div v-show="hover" class="form-section--container__move">
      <sh-icon :name="'drag-move'" class="is-20x20 mr-10 handle" />
    </div>
    <div class="form-section--heading">
      <sh-icon :file="'forms-sprite'" :name="'table-icon'" class="image is-12x12 mr-5"></sh-icon>
      Section {{ number }}
    </div>
    <div class="form-section" :class="{ hover }">
      <div class="form-section-title">
        <div class="form-section-title--left">
          <input placeholder="Untitled Section" class="form-section-title--text is-semiBold-18-600-22" @blur="updateSection" v-model="section.name" />
          <input
            @blur="updateSection"
            placeholder="Description (Optional)"
            class="form-section-title--description has-text-grey mt-15 is-medium-13-500-16"
            v-model="section.description"
          />
        </div>
        <div v-click-outside="() => (showTemplate = false)" class="form-section-title--right">
          <div v-click-outside="() => (option = false)" v-show="hover" class="form-section-title--options">
            <sh-icon
              @click.native="duplicateSection(section)"
              v-tooltip="'Duplicate'"
              :file="'forms-sprite'"
              :name="'duplicate'"
              class="image is-16x16"
            ></sh-icon>
            <sh-icon
              @click.native="delete_section({ id: section.uid })"
              v-tooltip="'Remove'"
              :file="'forms-sprite'"
              :name="'trash'"
              class="image is-16x16"
            ></sh-icon>
            <div class="form-divide"></div>
            <sh-icon @click.native="option = !option" :name="'3dots-menu-horizontal'" class="image is-16x16"></sh-icon>
            <div v-show="option" class="form-section-title--options__more is-medium-16-500-19">
              <div class="form-section-title--options__more-items">Include Subtitle</div>
              <div
                @click="
                  showTemplate = true;
                  isSave = true;
                "
                class="form-section-title--options__more-items"
              >
                Save as Template
              </div>
              <div
                @click="
                  showTemplate = true;
                  isSave = false;
                "
                class="form-section-title--options__more-items"
              >
                Load From Template
              </div>
            </div>
          </div>
          <sections-template :id="section.uid" @close="showTemplate = false" v-show="showTemplate && !isSave"></sections-template>
          <save-section-template :id="section.uid" @close="showTemplate = false" v-show="showTemplate && isSave"></save-section-template>
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
  import sectionsTemplate from "./sections-template";
  import saveSectionTemplate from "./save-section-template";

  export default {
    components: { sectionsTemplate, saveSectionTemplate },
    props: ["section", "number"],
    data() {
      return {
        hover: false,
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
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 30px;
      padding-top: 24px;
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
        border-bottom: 2px dashed #ccc;
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

<template>
  <div
    class="form-field--container"
    @mouseover.prevent.stop="hover = true"
    @mouseleave.prevent.stop="
      hover = false;
      option = false;
    "
  >
    <div v-show="hover" class="form-field--container__move">
      <sh-icon :name="'drag-move'" class="is-20x20 mr-10 handle" />
    </div>
    <div v-if="hover" class="form-field--create">
      <field-basic-create :field="field" :section="section" @add-field="$emit('add-field', $event)"></field-basic-create>
    </div>
    <div class="form-field" :class="{ hover }">
      <div class="form-field-title">
        <div class="form-field-title--left">
          <input placeholder="Untitled Section" class="form-field-title--text is-semiBold-18-600-22" v-model="field.name" />
        </div>
        <div class="form-field-title--right is-medium-14-500-17">
          <sh-icon :file="'forms-sprite'" :name="`fields-${field.properties.type}`" class="image is-16x16 mr-10"></sh-icon>
          {{ fieldType[field.properties.type] ? fieldType[field.properties.type].name : "" }}
        </div>
      </div>
      <slot></slot>
      <div v-click-outside="() => (option = false)" class="form-field-options" :class="{ hover }">
        <div v-show="hover" class="form-field-title--options">
          <sh-icon
            @click.native="duplicateField(field)"
            v-tooltip="'Duplicate'"
            :file="'forms-sprite'"
            :name="'duplicate'"
            class="image is-16x16"
          ></sh-icon>
          <sh-icon
            @click.native="$emit('delete-field', field.uid)"
            v-tooltip="'Remove'"
            :file="'forms-sprite'"
            :name="'trash'"
            class="image is-16x16"
          ></sh-icon>
          <div class="form-divide"></div>
          <sh-icon @click.native="option = !option" :name="'3dots-menu-horizontal'" class="image is-16x16"></sh-icon>
          <div v-show="option" class="form-field-title--options__more is-medium-16-500-19">
            <div class="form-field-title--options__more-items">Include Subtitle</div>
            <div @click="showTemplate = true" class="form-field-title--options__more-items">Save as Template</div>
          </div>
        </div>
      </div>
      <save-field-template :id="field.uid" @close="showTemplate = false" v-show="showTemplate"></save-field-template>
    </div>
  </div>
</template>

<script>
  import fieldBasicCreate from "./field-basic-create.vue";
  import saveFieldTemplate from "./save-field-template.vue";
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["field", "fieldType", "section"],
    components: { fieldBasicCreate, saveFieldTemplate },
    data() {
      return {
        hover: false,
        option: false,
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
        width: 54%;
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

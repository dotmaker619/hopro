<template>
  <div
    class="fields-table--list mb-20"
    @mouseover.prevent.stop="hover = true"
    @mouseleave.prevent.stop="
      hover = false;
      option = false;
    "
  >
    <div v-show="hover" class="fields-table--list__move"><sh-icon :name="'drag-move'" class="is-20x20 mr-10 handle" /></div>
    <div class="fields-table--list__input mr-30">
      <input class="pl-10" :placeholder="field.name" v-model="field.value" />
    </div>
    <div class="fields-table--list__icon mr-30">
      <sh-icon :file="'forms-sprite'" :name="`fields-${field.properties ? field.properties.type : ''}`" class="image is-16x16 mr-10"></sh-icon>
      {{ fieldType[field.properties.type] ? fieldType[field.properties.type].name : "" }}
    </div>
    <div v-show="hover" class="fields-table--list__settings mr-30">
      <sh-icon :file="'forms-sprite'" :name="`field-table-config`" class="image is-40x40 mr-10"></sh-icon>
    </div>
    <div v-show="hover" @click="deleteField" class="fields-table--list__close">
      <sh-icon :file="'forms-sprite'" :name="`field-table-close`" class="image is-12x12 mr-10"></sh-icon>
    </div>
  </div>
</template>

<script>
  import { mapActions } from "vuex";

  export default {
    props: ["field", "fieldType"],
    data() {
      return {
        hover: false,
        option: false,
      };
    },
    methods: {
      ...mapActions("forms", ["delete_field"]),
      deleteField() {
        this.delete_field({ id: this.field.uid });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .fields-table--list {
    display: flex;
    align-items: center;
    position: relative;
    input {
      width: 280px;
      height: 44px;
      background: #ffffff 0% 0% no-repeat padding-box;
      border: 1px solid #171e4833;
      border-radius: 4px;
    }
    &__icon {
      display: flex;
      width: 150px;
      align-items: center;
    }
    &__move {
      position: absolute;
      cursor: move;
      left: -25px;
    }
    &__settting,
    &__close {
      cursor: pointer;
    }
  }
</style>

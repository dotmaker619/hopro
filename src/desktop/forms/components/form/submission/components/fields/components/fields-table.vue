<template>
  <div class="fields-table is-medium-14-500-17 has-slimscroll">
    <table class="fields-table--container">
      <tr>
        <th v-for="field in fields" :key="field.name">
          {{ field.name }}
        </th>
      </tr>
      <tr v-for="value in values" :key="value">
        <td v-for="field in fields" :key="field.name">
          <slot
            :field="field"
            :table="true"
            :component="`${fieldType[field.properties.type] ? fieldType[field.properties.type].component : ''}`"
          ></slot>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
  import draggable from "vuedraggable";
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    components: { draggable },
    data() {
      return {
        values: [{}, {}, {}, {}],
      };
    },
    props: ["fields", "section"],
    computed: {
      ...mapGetters("forms", ["fieldType"]),
    },
    methods: {
      ...mapActions("forms", ["update_field"]),
      updateField(field) {
        this.update_field({
          id: field.uid,
          body: field,
        });
      },
      checkMove(data) {
        if (data.moved.newIndex - 1 >= 0) {
          this.fields[data.moved.newIndex].previousField = this.fields[data.moved.newIndex - 1].uid;
        } else {
          this.fields[data.moved.newIndex].previousField = null;
        }
        this.updateField(this.fields[data.moved.newIndex]);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .fields-table {
    overflow: auto;
    height: 350px;
    &--container {
      display: table;
      position: relative;
      text-align: center;
      th {
        background: #f5f7fc 0% 0% no-repeat padding-box;
        padding-top: 12px;
        padding-bottom: 12px;
        font-weight: normal;
        position: sticky;
        top: 0; /* Don't forget this, required for the stickiness */
        z-index: 40;
      }
      td {
        min-width: 150px;
      }
    }
  }
</style>

<template>
  <div ref="comp" v-click-outside="() => (show = false)" class="fields-create is-medium-14-500-17">
    <div @click="show = true">
      <slot></slot>
    </div>
    <div ref="modal" class="fields-create--dropdown__modal" v-show="show">
      <div class="search-field ml-5 my-5">
        <p class="control has-icons-left d-flex align-items-center">
          <input
            :value="search_keyword"
            @input="search_keyword = $event.target.value"
            class="input fieldsNTemplates"
            placeholder="Select Fields or Templates"
          />
          <span class="icon is-small is-left">
            <sh-icon :name="'search'" class="is-16x16" />
          </span>
        </p>
      </div>
      <ul class="fields-list has-slimscroll">
        <li @click="createFields(field)" v-for="field in fields" :key="field.name">
          <sh-icon :file="'forms-sprite'" :name="`fields-${field.type}`" class="image is-16x16 mr-10"></sh-icon>
          {{ field.name }}
        </li>
      </ul>
      <div @click="showTemplate = true" class="fields-create--template">
        <div>
          Choose from templates
        </div>
        <i class="fa fa-chevron-right"></i>
      </div>
    </div>
    <div ref="template" v-show="showTemplate" class="fields-create--template__list is-medium-14-500-17">
      <div class="has-text-grey empty" v-if="field_template.length === 0">
        <div class="mb-15">Templates are yet to be created</div>
        <div>Start by saving templates</div>
      </div>
      <ul v-else class="px-5 has-slimscroll">
        <li @click="loadTemplate(template)" v-for="template in field_template" :key="template" class="padding-10">
          {{ template.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["section", "field"],
    data() {
      return {
        show: false,
        showTemplate: false,
        search_keyword: "",
      };
    },
    computed: {
      ...mapState("forms", ["fields"]),
      ...mapGetters("forms", ["selectedForm"]),
      ...mapState("forms", ["field_template"]),
    },
    watch: {
      show(val) {
        let pos = this.$refs.comp.getBoundingClientRect();
        if (pos.y > 350) {
          this.$refs.modal.style.top = "unset";
          this.$refs.modal.style.bottom = "3rem";
          this.$refs.template.style.top = "unset";
          this.$refs.template.style.bottom = "3rem";
        } else {
          this.$refs.modal.style.bottom = "unset";
          this.$refs.modal.style.top = "3rem";
          this.$refs.template.style.top = "17rem";
          this.$refs.template.style.bottom = "unset";
        }
        if (!val) this.showTemplate = false;
      },
    },
    methods: {
      ...mapActions("forms", ["add_section", "load_field_template"]),
      createFields(fields) {
        fields.previousField = this.field ? this.field.uid : undefined;
        this.$emit("create-field", fields);
        this.show = false;
      },
      loadTemplate(template) {
        this.load_field_template({
          body: {
            name: template.name,
            uid: template.uid,
            section: this.section.uid,
            previousField: this.field ? this.field.uid : undefined,
          },
        });
        this.show = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .fields-create {
    position: relative;
    &--template {
      width: 236px;
      height: 46px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff 0% 0% no-repeat padding-box;
      border-top: 1px solid #d0d2da;
      padding: 0 15px;
      border-radius: 0px 0px 4px 4px;
      cursor: pointer;
      &__list {
        .empty {
          height: 196px;
          width: 100%;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex-flow: column;
        }
        ul {
          overflow: auto;
          height: 196px;
        }
        position: absolute;
        z-index: 41;
        top: 17rem;
        left: 246px;
        width: 236px;
        background: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
        background: #ffffff 0% 0% no-repeat padding-box;
        border: 1px solid #171e481a;
        border-radius: 6px;
      }
    }
    &--dropdown {
      position: relative;
      z-index: 40;
      &__modal {
        position: absolute;
        z-index: 41;
        text-align: left;
        background: white;
        box-shadow: 0px 5px 20px #171e481a;
        border: 1px solid #171e481a;
        border-radius: 6px;
        top: 3rem;
        left: 0;
        width: 236px;
        .fieldsNTemplates {
          border: 0 !important;
          box-shadow: none;
          font-size: 14px;
        }
        ul {
          height: 250px;
          overflow: auto;
          li {
            height: 40px;
            width: 100%;
            padding-left: 15px;
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }
</style>

<template>
  <div class="sections-template">
    <div class="sections-template--title">
      <div class="is-semiBold-20-600-000">Load From Template</div>
      <sh-icon @click.native="$emit('close')" name="close-2" class="image is-20x20"></sh-icon>
    </div>
    <div class="sections-template--content mt-20">
      <div class="is-medium-12-500-00 has-text-grey has-opacity-7">Template Name</div>
      <div>
        <input
          @focus="focus = true"
          @blur="focus = false"
          :value="search_keyword"
          @input="search_keyword = $event.target.value"
          class="input"
          placeholder="Electrical Maintenance"
        />
      </div>
      <div v-show="focus && search_results.length > 0" class="sections-template--content__values">
        <div
          @mousedown="
            selected_template = template;
            search_keyword = template.name;
          "
          v-for="template in search_results"
          :key="template.uid"
        >
          {{ template.name }}
        </div>
      </div>
    </div>
    <div class="sections-template--options mt-15">
      <div class="is-medium-14-500-17 mb-10">Duplicates</div>
      <div class="mobile-radio">
        <b-radio class="radio" type="is-info" v-model="duplicate" native-value="overwrite">
          <span class="is-regular-16-00-19 mr-20">Overwrite</span>
        </b-radio>
        <b-radio class="radio" type="is-info" v-model="duplicate" native-value="append">
          <span class="is-regular-16-00-19 mr-20">Append</span>
        </b-radio>
      </div>
    </div>
    <div class="sections-template--button mt-25">
      <div @click="add_template" class="sh-button" :class="[selected_template ? null : 'is-disabled has-no-access']">Load</div>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["id"],
    data() {
      return { search_keyword: "", duplicate: false, selected_template: null, focus: false };
    },
    computed: {
      ...mapState("forms", ["section_template"]),
      ...mapGetters("forms", ["selectedForm"]),
      search_results() {
        if (this.section_template) {
          return this.section_template.filter((template) => _.includes(template.name.toLowerCase(), this.search_keyword.toLowerCase()));
        }
      },
    },
    methods: {
      ...mapActions("forms", ["load_section_template"]),
      add_template() {
        this.load_section_template({
          body: {
            name: this.selected_template.name,
            uid: this.selected_template.uid,
            form: this.selectedForm.uid,
            "previousSection": this.id,
          },
        });
        this.$emit("close");
      },
    },
  };
</script>

<style lang="scss" scoped>
  .sections-template {
    position: absolute;
    top: 50px;
    right: 55px;
    z-index: 41;
    width: 328px;
    height: 266px;
    padding: 15px 30px 20px 30px;
    background: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
    background: #ffffff 0% 0% no-repeat padding-box;
    box-shadow: 0px 5px 20px #171e481a;
    border-radius: 6px;
    &--content {
      position: relative;
      &__values {
        width: 328px;
        max-height: 200px;
        padding: 15px 30px 20px 30px;
        > div {
          cursor: pointer;
        }
        overflow: auto;
        position: absolute;
        background: #ffffff 0% 0% no-repeat padding-box;
        box-shadow: 0px 5px 20px #171e481a;
        border-radius: 6px;
        z-index: 41;
      }
    }
    &--title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      > .image {
        cursor: pointer;
      }
    }
    &--button {
      display: flex;
      justify-content: flex-end;
      > .sh-button {
        width: 96px;
        padding: 1rem 2rem;
      }
    }
  }
</style>

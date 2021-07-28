<template>
  <div ref="comp" v-click-outside="() => (show = false)" class="form-section--dropdown" :class="{show}">
    <div @click="show = true">
      <slot></slot>
    </div>
    <ul ref="modal" class="form-section--dropdown__modal" v-show="show">
      <li @click="createSection(section)" v-for="section in types" :key="section.name">
        <sh-icon :file="'forms-sprite'" :name="`${section.name}-section`" class="image is-16x16 mr-10"></sh-icon>
        {{ section.name }}
      </li>
    </ul>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["section"],
    data() {
      return {
        show: false,
        types: [
          { name: "Basic", type: "default" },
          { name: "Checklist", type: "checklist" },
          { name: "Table", type: "table" },
          { name: "Attachments", type: "attachments" },
        ],
      };
    },
    computed: {
      ...mapGetters("forms", ["selectedForm"]),
    },
    watch: {
      show(val) {
        let pos = this.$refs.comp.getBoundingClientRect();
        if (pos.y > 450) {
          this.$refs.modal.style.top = "unset";
          this.$refs.modal.style.bottom = "3rem";
        } else {
          this.$refs.modal.style.bottom = "unset";
          this.$refs.modal.style.top = "3rem";
        }
      },
    },
    methods: {
      ...mapActions("forms", ["add_section"]),
      createSection(section) {
        this.show = false;
        let obj = {
          "name": section.name + "-section",
          "form": this.selectedForm.uid,
          "type": section.type,
          "previousSection": this.section ? this.section.uid : null,
        };
        this.add_section({ body: obj });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .form-section--dropdown {
    position: relative;
    &.show {
      z-index: 12;
    }
    &__modal {
      position: absolute;
      text-align: left;
      background: white;
      box-shadow: 0px 5px 20px #171e481a;
      border: 1px solid #171e481a;
      border-radius: 6px;
      top: 3rem;
      padding: 0px 15px;
      left: 0;
      width: 156px;
      li {
        height: 40px;
        width: 100%;
        display: flex;
        align-items: center;
      }
    }
  }
</style>

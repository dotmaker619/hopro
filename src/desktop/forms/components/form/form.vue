<template>
  <div class="form-builder">
    <div class="form-builder--heading">
      <div class="form-builder--heading__options">
        <div class="form-builder--heading__options-left">
          <sh-icon
            @click.native="$router.push('/forms')"
            :file="'terra_sprite'"
            :name="'terra-back-arrow'"
            style="width:14px;"
            class="is-12x12 mr-15"
          ></sh-icon>
          <div class="is-semiBold-18-600-22 mr-10">{{ selectedForm ? selectedForm.name : "" }}</div>
          <sh-icon :name="'bookmark'" class="is-14x14" />
          <div class="is-regular-14-00-17 has-text-grey has-opacity-7 ml-30">All changes saved at 3:45pm</div>
        </div>
        <div class="form-builder--heading__options-right">
          <div>
            <div class="is-regular-14-00-17 has-text-grey has-opacity-7 has-text-right">Asset Location</div>
            <div class="has-text-right is-medium-14-500-24">SBEnergy > Block1 > Invention-2Ab</div>
          </div>
          <div class="mx-20 seperator"></div>
          <router-link active-class="is-active" :to="{ name: 'formPreview' }">
            <sh-icon v-tooltip="'Preview'" :file="'forms-sprite'" :name="'view'" class="image is-36x36"></sh-icon>
          </router-link>
          <div style="padding:1rem 2rem" class="sh-button is-pulled-right is-semiBold-14-600-17 ml-15 mr-15">Publish</div>
          <sh-icon @click.native="active = !active" :name="'3dots-menu'" class="is-16x16 ml-10" />
        </div>
      </div>
      <div class="form-builder--heading__tabs">
        <div class="sh-tabs">
          <ul style="border-bottom:none;position:relative;bottom:-1px;">
            <li>
              <router-link active-class="is-active" :to="{ name: 'formCreate' }">Form</router-link>
            </li>
            <li>
              <router-link active-class="is-active" :to="{ name: 'formSubmission' }">Submissions</router-link>
            </li>
            <li>
              <router-link active-class="is-active" :to="{ name: 'formReport' }">Reports</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <router-view v-if="selectedForm"></router-view>
  </div>
</template>

<script>
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    props: ["form"],
    created() {
      this.SET_FORMID(this.$route.params.form);
    },
    computed: {
      ...mapGetters("forms", ["selectedForm"]),
    },
    watch: {
      selectedForm: function(val) {
        if (!val) {
          this.$router.push("/forms");
        }
      },
    },
    methods: {
      ...mapMutations("forms", ["SET_FORMID"]),
    },
  };
</script>

<style lang="scss" scoped>
  .form-builder {
    &--heading {
      padding: 0px 30px;
      background: white;
      border-top: 1px solid #f6f6f6;
      box-shadow: 0px 1px 0px #0000000d;
      &__options {
        margin-top: 15px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .seperator {
          border-left: 1px solid #ccc;
          width: 1px;
          height: 24px;
        }
        &-left,
        &-right {
          display: flex;
          align-items: center;
        }
      }
      &__tabs {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>

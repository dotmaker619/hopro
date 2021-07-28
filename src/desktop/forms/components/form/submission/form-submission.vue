<template>
  <div class="form-submission">
    <div class="form-submission--forms">
      <div class="is-semiBold-18-600-22">Submitted Forms (56)</div>
      <div class="is-flex is-vcenter mt-10">
        <p class="searchbar control has-icons-left">
          <input v-focus v-model="search_keyword" class="searchbar__input input" placeholder="Search " autocomplete="off" />
          <span class="icon is-large is-left">
            <sh-icon :name="'search'" :file="'helper_sprite'" class="is-20x20"></sh-icon>
          </span>
        </p>
        <div class="filter__btn">
          <i class="fas fa-filter"></i>
        </div>
      </div>
      <div class="mt-20">
        <form-user-select :selected="user === 1" v-for="user in users" :key="user"></form-user-select>
      </div>
    </div>
    <div class="form-submission--content">
      <form-title></form-title>
      <form-section :sections="sections"
        ><template slot-scope="sectionScope">
          <form-fields :section="sectionScope.type">
            <template slot-scope="fieldScope">
              <field-values :field="fieldScope.field" :component="fieldScope.component"> </field-values>
            </template>
          </form-fields>
        </template>
      </form-section>
    </div>
  </div>
</template>

<script>
  import formTitle from "./components/form-title";
  import formUserSelect from "./components/form-user-select";
  import formSection from "./components/section/form-section";
  import formFields from "./components/fields/form-fields";
  import fieldValues from "./components/fieldValues/field-values";

  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    components: { formTitle, formSection, formFields, fieldValues, formUserSelect },
    data() {
      return {
        isEmpty: true,
        search_keyword: "",
        users: [1, 2, 3, 4, 5],
      };
    },
    computed: {
      ...mapGetters("forms", ["selectedForm"]),
      sections() {
        console.log(this.selectedForm);
        return this.selectedForm ? this.selectedForm.sections : [];
      },
    },
    methods: {
      ...mapActions("forms", ["add_form"]),
      createForm() {
        this.add_form({
          body: {
            "name": "Untitled Form",
            "targetElement": {
              "asset": null,
              "type": "organization",
              "uid": "ERWXfHvgDU",
              "stage": "CORE",
            },
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .form-submission {
    margin: 30px auto;
    width: 1200px;
    display: flex;
    &--forms {
      width: 340px;
    }
    &--content {
      width: 800px;
      margin: 30px;
    }
  }

  .searchbar {
    width: 100%;
    height: 4rem;
    &__input {
      height: 4rem;
      border: none;
      border-radius: 0.5rem;
      box-shadow: 2px 2px 2px 0px rgba(23, 30, 72, 0.164);
      :placeholder {
        font-size: 1rem;
      }
      &:focus {
        box-shadow: 2px 2px 4px 0px rgba(23, 30, 72, 0.164);
      }
    }
  }

  .filter__btn {
    cursor: pointer;
    height: 4rem;
    min-width: 4rem;
    box-shadow: 2px 2px 4px 0px rgba(23, 30, 72, 0.164);
    border: none;
    border-radius: 0.5rem;
    margin: 0 0 0 1.5rem;
    background: white;
    i {
      color: $grey-text;
      margin: auto;
      position: relative;
      top: 1rem;
      left: 1.3rem;
    }
    &.is-active {
      i {
        color: $primary;
        margin: auto;
      }
    }
  }
</style>

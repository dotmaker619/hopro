<template>
  <div class="sh-form form" @keyup.enter="save">
    <div class="form__content">
      <div class="form__content-header">
        <img claas="form__content-header-icon" src="@/assets/icons/form/therm-new.svg" />
      </div>
      <form-top :info="info"></form-top>
      <div class="form__content-elements">
        <div class="form__content-elements-item has-text-centered">
          <input
            style="width:96%"
            v-model="form.name"
            class="sh-form__content__input"
            type="text"
            placeholder="Enter Name"
          />
        </div>
        <div class="form__content-elements-item">
          <treeselect
            :valueFormat="'object'"
            v-model="form.projects"
            :multiple="true"
            :normalizer="projects_normalizer"
            :options="projects_options"
            :valueConsistsOf="'LEAF_PRIORITY'"
          ></treeselect>
        </div>
        <div class="form__content-elements-item pl-10">
          <b-checkbox type="is-info">ASSET ?</b-checkbox>
        </div>
        <div class="form__content-elements-item">
          <treeselect
            :valueFormat="'object'"
            v-model="form.issueTypes"
            :multiple="true"
            :normalizer="issue_type_normalizer"
            :options="issue_types_options"
          ></treeselect>
        </div>

        <p class="is-medium-16-500-50 mt-20">Temperature Difference</p>
        <div class="mt-60 pl-20 pr-20">
          <vue-slider
            v-if="temperature_difference"
            :bgColor="slider_styles.bgColor"
            :tooltipStyle="slider_styles.tooltipStyle"
            :processStyle="slider_styles.processStyle"
            tooltip="always"
            :min="0"
            :max="100"
            v-model="temperature_difference"
          ></vue-slider>
        </div>
      </div>
      <div
        class="mt-10 is-medium-16-500-50 has-text-centered has-text-danger"
        v-if="errors"
      >Something went wrong</div>
      <div
        @click="save"
        class="form__content-button"
      >{{details? 'Save Changes': 'Create thermal New'}}</div>
    </div>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
// import the styles
import { viewService } from "@/desktop/shared/services/";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import FormTop from "@/desktop/shared/components/form/form-top";

const slider_styles = {
  bgStyle: {
    backgroundColor: "#d6dffb",
    height: "5px"
  },
  tooltipStyle: {
    backgroundColor: "#fff",
    borderColor: "#344257",
    color: "#171e48",
    fontFamily: "Barlow",
    paddingTop: "8px",
    fontSize: "13px",
    fontWeight: "600",
    width: "30px",
    height: "27px",
    boxShadow: "0 4px 6px 0 rgba(60, 80, 100, 0.2)",
    border: "solid 1.5px #3c5064",
    borderRadius: "6px"
  },
  processStyle: {
    backgroundColor: "#3c5064",
    borderRadius: "255px",
    boxShadow: "0px 2px 10px 0px rgba(60, 80, 100, 0.2)"
  }
};
export default {
  components: {
    Treeselect,
    VueSlider,
    FormTop
  },
  props: ["info", "details", "on_complete"],
  data() {
    return {
      slider_styles,
      // define the default value
      value: null,
      // define options
      issue_types_options: [],
      projects_options: [],
      temperature_difference: null,
      form: {
        name: "",
        is_asset: false,
        projects: [],
        organization: this.$store.state.current_organization.uid,
        issueTypes: [],
        temperatureMin: 0,
        temperatureMax: 100
      }
    };
  },
  async created() {
    this.projects_options = await viewService.get_projects({});
    this.issue_types_options = await viewService.get_issue_types({});
    if (this.details) await this.getDetails();
    else {
      this.temperature_difference = [0, 100];
    }
  },

  methods: {
    async getDetails() {
      let details = await viewService
        .get({
          id: this.details.uid,
          query: "users=true&metrics=true&complete=true&projects=true"
        })
        .catch(this.handleErrors);
      this.form.name = details.name;
      this.form.is_asset = details.is_asset;
      let projects = [];
      details.groups.forEach(group => {
        projects.push(...group.projects);
      });
      this.form.projects = projects;
      this.form.issueTypes = details.issueTypes.map(e => {
        return this.issue_types_options.find(f => f.class_name == e);
      });
      this.temperature_difference = [
        details.temperatureMin || 0,
        details.temperatureMax || 50
      ];
    },
    issue_type_normalizer(node) {
      return {
        id: node.class_name,
        label: node.display_name
      };
    },
    projects_normalizer(node) {
      return {
        id: node.uid,
        label: node.name,
        children: node.projects
      };
    },
    async save() {
      try {
        let body = { ...this.form };
        body.projects = body.projects.map(p => p.uid);
        body.issueTypes = body.issueTypes.map(p => p.class_name);
        body.organization = this.$store.state.current_organization.uid;
        let promise;
        if (this.details) {
          promise = viewService.update({
            body: { uid: this.details.uid, ...body }
          });
          // .catch(this.handleErrors);
        } else {
          promise = viewService.create({ body });
          // .catch(this.handleErrors);
        }
        await promise;

        this.on_complete();
        this.$emit("close");
      } catch (err) {
        console.log(err);
        this.handleErrors(err);
      }
    }
  }
};
</script>

<style lang="scss">
.vue-treeselect {
  .vue-treeselect__control {
    border: 0;
    background: transparent;
    border-radius: 0;
    border-bottom: 1px solid rgba(23, 30, 72, 0.1);
  }
  &__multi-value-item {
    font-weight: 500;
    background: white;
    border: 1px solid black;
    border-radius: 4px;
    padding: 5px;
    color: black;
  }
  &__value-remove {
    border-left: 0;
    color: black;
  }
}
.form {
  margin-top: 21px;
  margin-bottom: 21px;
  border-radius: 10px;
  box-shadow: 0 10px 30px 0 rgba(50, 60, 70, 0.3);
  background-color: #fafcff;
  color: #171e48;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 23px 39px;
    background-color: #ffffff;
    box-shadow: 0 2px 1px 0 rgba(50, 60, 70, 0.05);
    font-size: 2rem;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    &-title {
      font-weight: 600;
      text-transform: capitalize;
    }
    &-close {
      cursor: pointer;
    }
  }
  &__content {
    padding: 4rem 12rem;
    &-header {
      text-align: center;
      &-subtitle {
        margin: 0;
      }
      &-organization {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        &-icon {
          display: inline-block;
          font-weight: 600;
          width: 3.25rem;
          height: 3.25rem;
          border-radius: 50%;
          text-align: center;
          align-items: center;
          color: #feffff;
          background-color: $primary;
          margin-right: 1rem;
        }
        &-name {
          font-weight: 500;
          color: #171e48;
        }
      }
    }
    &-elements {
      margin-top: 30px;
      &-item {
        margin-bottom: 1.5rem;
        color: #171e48;
        font-size: 1.6rem;
        &-input {
          padding: 1rem;
          width: 100%;
          border: 0;
          border-bottom: 1px solid rgba(23, 30, 72, 0.1);
          &:focus {
            outline: none;
          }
          &::placeholder {
            color: rgba(23, 30, 72, 0.4);
          }
        }
      }
    }
    &-button {
      cursor: pointer;
      margin-top: 3rem;
      border-radius: 6px;
      background-color: $primary;
      width: 100%;
      color: #fff;
      font-size: 1.6rem;
      font-weight: 600;
      text-align: center;
      padding: 1.5rem 0;
    }
  }
}
.vue-slider-component {
  margin: 0 auto;
}
.vue-slider-component .vue-slider-dot .vue-slider-dot-handle {
  width: 18px;
  height: 18px;
  object-fit: contain;
  box-shadow: 0 5px 10px 0 rgba(60, 80, 100, 0.2);
  border: solid 3px #3c5064;
  background-color: #ffffff;
  margin-top: -2px;
}
.temperature-slider {
  font-family: Barlow-Regular;

  .heading-secondary.temperature-slider__label {
    color: #171e48;
    margin-top: 0.7rem;
    text-transform: capitalize;
    font-weight: bold;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  margin-top: 4rem;
}
</style>
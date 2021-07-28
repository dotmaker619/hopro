<template>
  <div class="list-card card-drop-shadow">    
    <div
      class="list-card__header svg-on-hover"
      @click="active == -1 ? (active = index) : (active = -1)"
    >
      <span
        class="is-flex is-vcenter"
        :class="{ 'active-selection is-semiBold-16-600-19': active == index }"
      >
        <span class="is-medium-16-500-19 ml-15">{{ group.name }}</span>
      </span>
      <span class="is-flex">
        <svg
          @click.stop="delete_group(group.name)"
          viewBox="0 0 100 100"
          class="image is-19x19 mr-20 is-pointer"
        >
          <use xlink:href="@/assets/icons/helper_sprite.svg#delete" />
        </svg>
        <span class="list-card__header--icon is-pointer">
          <i
            class="fas"
            :class="[
              active == index
                ? 'fa-chevron-up active-selection'
                : 'fa-chevron-down has-text-grey',
            ]"
          ></i>
        </span>
      </span>
    </div>
    <div class="" v-if="active == index">
      <div class="feature-type-card__body has-slimscroll-xs">
        <draggable
        :list="group.featureTypes"
        draggable=".featuretypeDrag"
        @end="onMove"
      >
        <transition-group type="transition" :name="'flip-list'">
          <FeatureType
            class="featuretypeDrag"
            @onDeleteFeature="$emit('feature_type_added')"
            @feature_type_updated="$emit('feature_type_added')"
            v-for="feature_type in group.featureTypes"
            :key="feature_type.uid"
            :feature_type="feature_type"
            :color_list="color_list"
          />
        </transition-group>
      </draggable>
      </div>
      <div class="list-card__body--item">
        <div class="list-card__body--item-text pt-10 mb-10 create-feature-type">
          <a
            v-if="!is_create"
            @click="
              is_create = true;
              is_color_list = true;
            "
          >
          <span class="ml-15 mr-10"><img src="@/assets/icons/add-feature-type.svg" alt=""></span>
            <!-- <i class="fa fa-plus mr-10"></i>  -->
            <span class="is-semiBold-14-600-17 new-feature-type">New Feature Type</span>
          </a>
          <div
            v-if="is_create"
            class="field has-addons"
            style="position:relative;"
          >
            <div class="control has-icons-left has-icons-right create-feature-type__input">
              <input
                @click="is_color_list = !is_color_list"
                class="input is-fullwidth no-outline is-pointer "
                @keyup.esc="is_create = false"
                type="text"
                :autofocus="is_create"
                v-model="form.name"
                v-focus
                placeholder="Enter Feature Type"
              />
              <span class="icon is-left is-pointer">
                <i
                  :style="{ color: form.properties.color }"
                  class="fas fa-circle is-size-5"
                ></i>
              </span>
              <div
                v-if="is_color_list"
                class="color-list has-text-centered"
              >
                <i
                  v-for="(color, i) in color_list"
                  :key="i"
                  class="fa fa-circle is-size-4 is-pointer"
                  :style="{ color: color.color }"
                  @click="set_color(color.color)"
                ></i>
              </div>
            </div>
            <div class="control">
              <sh-icon @click.native="save" :name="'tick'" :file="'helper_sprite'" class="is-32x32 ml-20 is-pointer"></sh-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card">
        <section class="modal-card-body">
          <div class="modal-card-body__title">
            <div class="is-flex is-center is-60x60">
              <img src="@/assets/icons/prompt/delete.svg" alt="">
              <div class="ml-10">
                <div class="is-semiBold-16-600-19 mt-5">{{delete_modal_title}}</div>
                <div class="is-medium-12-500-00 modal-card-body__subtitle">
                  Are you sure you want to delete this Feature Type Group?
                </div>
                <div class="mt-20">
                  <button class="button mr-10 btn btn-cancel"
                    @click="showDeleteModal = !showDeleteModal"><span>Cancel</span></button>
                  <button class="button btn btn-delete" @click="confirm_delete()">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
<script>
import FeatureType from "./feature-type";
import draggable from "vuedraggable";
import {
  featureTypeService,
  featureTypeGroupService,
} from "@/desktop/shared/services/";

const color_list = [
  {
    color: "rgb(184, 37, 95)",
  },
  {
    color: "rgb(219, 64, 53)",
  },
  {
    color: "rgb(255, 153, 51)",
  },
  {
    color: "rgb(250, 208, 0)",
  },
  {
    color: "rgb(175, 184, 59)",
  },
  {
    color: "rgb(126, 204, 73)",
  },
  {
    color: "rgb(41, 148, 56)",
  },
  {
    color: "rgb(106, 204, 188)",
  },
  {
    color: "rgb(21, 143, 173)",
  },
  {
    color: "rgb(20, 170, 245)",
  },
  {
    color: "rgb(150, 195, 235)",
  },
  {
    color: "rgb(64, 115, 255)",
  },
  {
    color: "rgb(136, 77, 255)",
  },
  {
    color: "rgb(175, 56, 235)",
  },
  {
    color: "rgb(235, 150, 235)",
  },
  {
    color: "rgb(224, 81, 148)",
  },
  {
    color: "rgb(255, 141, 133)",
  },
  {
    color: "rgb(128, 128, 128)",
  },
  {
    color: "rgb(184, 184, 184)",
  },
  {
    color: "rgb(204, 172, 147)",
  },
];
export default {
  props: ["group", "index"],
  components: {
    FeatureType,
    draggable,
  },
  created() {
    // this.active = 0;
    if(this.index==0){
      this.active = 0
    }else{
      this.active = -1
    }
  },
  data() {
    return {
      color_list: color_list,
      is_color_list: false,
      delete_modal_title:'',
      form: {
        name: "",
        properties: { color: null },
      },
      is_create: false,
      active: -1,
      showDeleteModal: false,
    };
  },
  methods: {
    async save() {
      if (!this.form.properties.color) {
        this.$buefy.toast.open("Please select the color.");
        return;
      }
      if (this.is_edit) {
        this.is_edit = false;
        await featureTypeService
          .patch({
            uid: this.form.uid,
            body: {
              name: this.form.name,
              properties: this.form.properties,
            },
          })
          .then((res) => {
            this.$emit("feature_type_added");
          });
      } else if (this.is_create) {
        this.is_create = false;
        await featureTypeService.post({
          body: {
            ...this.form,
            featureTypeGroup: this.group.uid,
          },
        });
        (this.form = {
          name: "",
          properties: { color: null },
        }),
          // this.reset_form();
          this.$emit("feature_type_added");
      }
    },
    delete_group(group_name) {
      this.showDeleteModal = true
      this.delete_modal_title = group_name
    },
    async confirm_delete() {
        this.showDeleteModal = false
        await featureTypeGroupService.unassign_from_view({
          body: {
            featureTypeGroups: [this.group.uid]
          },
          id: this.$route.params.id,
        });
        this.$emit("feature_type_added");
        this.$buefy.toast.open("Deleted successfully!");
    },
    set_color(color) {
      this.form.properties.color = color;

      this.is_color_list = false;
    },
    async onMove() {
      let body = {
        featureTypeUids: [],
      };
      body.featureTypeUids = this.group.featureTypes.map(
        (element) => element.uid
      );
      await featureTypeService.move({ body });
    },
  },
};
</script>

<style lang="scss">
.flip-list-move {
  transition: transform 0.15s;
}
.no-move {
  transition: transform 0s;
}
.color-input {
  display: flex;
  align-items: center;
}

.active-selection {
  color: $primary;
}
.color-list {
  display: flex;
  flex-wrap: wrap;
  background: white;
  position: absolute;
  width: 100%;
  z-index: 1;
  height: auto;
  border-radius: 0.5rem;
  border: solid 0.5px rgba(23, 30, 72, 0.2) !important;
  left: 0;
  top: 4.0rem;
  box-shadow: 0 3px 6px 0 rgba(92, 126, 247, 0.3) !important;
  margin-top: 0.5rem;
  padding: 1rem;
  // grid: repeat(2, 3rem) / auto-flow 3.2rem;
  .fa {
    display: block;
    cursor: pointer;
    margin: 1rem;
  }
}

.svg-on-hover {
  svg {
    display: none;
  }
  &:hover {
    svg {
      display: block;
    }
  }
}
.new-feature-type {
  color: $primary;
}

.card-drop-shadow {
  box-shadow: 0 3px 6px 0 rgba(92, 126, 247, 0.3) !important;
}

.create-feature-type {
  border-top: solid 1px rgba(23, 30, 72, 0.1) !important;
  width: -webkit-fill-available;
  &__input{
    width: 100%;
  }
}

.feature-type-card__body{
  max-height: 24rem;
  overflow: auto;
}
.modal-card{
  max-width: 370px !important;
  border-radius: 1rem;
  // color: #171e48 !important;
  
  &-body{
    padding: 0;
    background-color: #fafcff !important;

    &__title{
      padding: 3rem !important;
    }

    &__subtitle {
      max-width: 175px;
    }
  }
}
.modal-footer{
  padding: 3rem;
  border-top: 1px solid rgba(23, 30, 72, 0.1)
}
.btn{
  font-family: Barlow-SemiBold !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  height: 50px;
  width: 106px;
  padding: 0px 30px !important;

  &-delete {
    border: 0;
    background-color: $primary;
    color: #ffffff;
    &:hover{
      color: #ffffff;
    }
  }
}
.is-60x60 img{
  height: 6rem;
  width:6rem;
}
</style>

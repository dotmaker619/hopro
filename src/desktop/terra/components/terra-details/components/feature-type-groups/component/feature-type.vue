<template>
  <div class="list-card__body--item" v-click-outside="() => (is_edit = -1)">
    <div
     @dblclick="edit_group"
      class="list-card__body--item-text is-flex is-vcenter"
      v-if="is_edit == -1"
      v-tooltip="feature_type.name.length > 35 ? feature_type.name : null"
    >
      <span class="drag-icon mr-10">
        <img src="@/assets/icons/row-drag.svg" />
      </span>
      <div
        class="feature-type-circle"
        :style="{ 'background-color': feature_type.properties.color }"
      ></div>
      <!-- <i class="fas fa-circle mr-10" :style="{'color':feature_type.properties.color}"></i> -->
      <div class="is-regular-16-00-20">{{ feature_type.name | truncate(35) }}</div>
    </div>
    <div
      class="list-card__body--item-text disable-hover control has-icons-left has-icons-right is-flex align-center"
      v-else
    >
      <input
        v-click-outside="() => (is_edit = -1)"
        type="text"
        name="feature type name"
        id="name"
        autofocus
        ref="feature_type_name"
        v-model="feature_group.name"
        :placeholder="feature_type.name"
        @keyup.esc="unsave_changes"
        @keyup.enter="save_group"
        class="input"
        @click="is_color_list = !is_color_list"
      />
      <span class="icon is-small is-left is-pointer color-indicator">
        <div
          class="feature-type-circle"
          :style="{ 'background-color': feature_type.properties.color }"
        ></div>
        <!-- <i :style="{'color':feature_group.properties.color}" class="fas fa-circle is-pointer"></i> -->
      </span>
      <div v-if="is_color_list" class="color-list has-text-centered">
        <i
          v-for="(color, i) in color_list"
          :key="i"
          class="fa fa-circle is-pointer"
          :style="{ color: color.color }"
          @click="
            feature_group.properties.color = color.color;
            $refs.feature_type_name.focus();
          "
        ></i>
      </div>
    </div>
    <div class="list-card__body--item-action is-flex align-center">
      <div class="is-medium-16-500-50">{{ feature_type.feature_count }}</div>

      <div
        class="delete-type is-pointer ml-30 is-18x18"
        @click="deleteFeatureType(feature_type.name)"
      >
        <img src="@/assets/icons/delete-feature-type.svg" alt="" srcset="" />
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
                  Are you sure you want to delete this Feature Type?
                </div>
                <div class="mt-20">
                  <button class="button mr-10 btn btn-cancel"
                    @click="showDeleteModal = !showDeleteModal"><span>Cancel</span></button>
                  <button class="button btn btn-delete" @click="confirm_feature_delete()">Delete</button>
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
import { featureTypeService } from "@/desktop/shared/services/";

export default {
  props: ["feature_type", "color_list"],
  data() {
    return {
      is_edit: -1,
      feature_group: this.feature_type,
      is_color_list: false,
      delete_modal_title:'',
      showDeleteModal: false,
    };
  },
  methods: {
    deleteFeatureType(feature_name) {
      this.showDeleteModal = true
      this.delete_modal_title = feature_name
      // this.$buefy.dialog.confirm({
      //   type: "is-danger",
      //   message: `Are you sure?`,
      //   confirmText: "Yes",
      //   cancelText: "No",
      //   onConfirm: async () => {
      //     await featureTypeService.delete({
      //       id: this.feature_type.uid,
      //     });
      //     this.$emit("onDeleteFeature");
      //     this.$buefy.toast.open("Deleted successfully!");
      //   },
      // });
    },
    async confirm_feature_delete() {
        this.showDeleteModal = false
        await featureTypeService.delete({
          id: this.feature_type.uid,
        });
        this.$emit("onDeleteFeature");
        this.$buefy.toast.open("Deleted successfully!");
    },
    edit_group() {
      this.is_edit = 1;
    },
    unsave_changes() {
      (this.feature_group.name = this.feature_type.name), (this.is_edit = -1);
    },
    async save_group() {
      if (!this.feature_group.properties.color) {
        this.$buefy.toast.open("Please select the color.");
        return;
      }
      if (this.is_edit) {
        this.is_edit = false;
        await featureTypeService
          .patch({
            id: this.feature_group.uid,
            body: {
              name: this.feature_group.name,
              properties: this.feature_group.properties,
            },
          })
          .then((res) => {
            this.is_edit = -1;
            this.$emit("feature_type_updated");
          })
          .catch((err) => this.handleErrors(err));
      }
    },
  },
};
</script>
<style scoped lang="scss">
.feature-type-circle {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  margin-right: 10px;
}
.list-card__body--item {
  cursor: grab;
  position: relative;
  padding: 0 !important;
  &-text {
    width: 100%;
    border-radius: 4px;
    border: solid 1px #fff;
    margin: 0 10px;
    padding: 5px 5px;

    &:hover {
      width: 100%;
      border-radius: 4px;
      border: solid 1px rgba(23, 30, 72, 0.2);
    }
    
  }
}
.disable-hover:hover{
  border: 1px solid #fff !important;
}
.input{
  left: -15px !important;
  &:focus {
    border: 1px solid rgba(23, 30, 72, 0.2) !important;
  }
}
.list-card__body--item:active {
  cursor: grabbing;
}
.list-card__body--item:hover .drag-icon {
  visibility: visible;
  left: -5px;
}

.list-card__body--item:hover .edit-type,
.list-card__body--item:hover .delete-type {
  visibility: visible;
}
.drag-icon {
  visibility: hidden;
  position: absolute;
  color: #737790;
}

.edit-type,
.delete-type {
  visibility: hidden;
}

.is-18x18 {
  height: 1.8rem;
  width: 1.8rem;
}

.color-indicator {
  margin: 0 !important;
  height: 4.5rem !important;
  left: -3px !important;
}
</style>

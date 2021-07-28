<template>
  <div class="terra-card">
    <div class="terra-card__header is-flex has-space-between align-center">
      <p class="is-medium-18-500-22">Feature Types</p>
      <div class="sh-buttons-group">
        <div>
          <button
            v-if="access('terra', 'modify_feature_types')"
            class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17"
            @click="is_create = true"
            :class="{ 'is-disabled': is_loading }"
          >Create New</button>
          <button
            v-else
            @click="no_access_popup('terra', 'modify_feature_types')"
            class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17 is-disabled is-not-allowed"
          >Create New</button>
        </div>
        <div>
          <button
            v-if="access('terra', 'modify_feature_types')"
            @click="is_assign_group = true"
            class="sh-button is-semiBold-14-600-17"
            :class="{ 'is-disabled': is_loading }"
          >Assign Group</button>
          <button
            v-else
            @click="no_access_popup('terra', 'modify_feature_types')"
            class="sh-button is-semiBold-14-600-17 is-disabled is-not-allowed"
          >Assign Group</button>
        </div>
      </div>
      <AssignGroup
        v-click-outside="() => is_assign_group=false"
        @close="is_assign_group=false"
        @groups_added="getData"
        v-if="is_assign_group"
        :details="details"
      />
    </div>
    <div class="terra-card__body mt-10 has-slimscroll-xs scrollbox card-height-750" tabindex="0">
      <div class="terra-card__body--card scrollbox-content">
        <div class="list-card" v-if="is_create">
          <div class="list-card__header" style="align-items: center;">
            <input
              @keyup.enter="save"
              v-model="form.name"
              type="text"
              class="input no-outline"
              ref="search"
              placeholder="Create New"
            />
            <div @click="save" class="mx-10 is-pointer save-icon">
              <i class="fa fa-check"></i>
            </div>
            <div @click="cancelNew" class="is-pointer delete-icon">
              <i class="fas fa-times"></i>
            </div>
          </div>
        </div>
        <div>
          <FeatureTypeGroup
            class="featuretypeDrag"
            @feature_type_added="getData"
            v-for="(group, i) in sort(data)"
            :group="group"
            :index="i"
            :key="group.uid"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FeatureTypeGroup from "./component/feature-type-group";
import AssignGroup from "./component/assign-group-dropdown.vue";
import { featureTypeGroupService } from "@/desktop/shared/services/";
export default {
  components: {
    FeatureTypeGroup,
    AssignGroup
  },
  props: ["details"],
  data() {
    return {
      data: [],
      is_create: false,
      is_assign_group: false,
      form: { name: "" },
      active: false,
      active_project: null,
      is_loading: false
    };
  },
  async created() {
    if (
      this.details &&
      this.details.groups &&
      this.details.groups.length &&
      this.details.groups[0].projects &&
      this.details.groups[0].projects.length
    ) {
      this.active_project = this.details.groups[0].projects[0];
    }
    this.getData(true);
    this.$eventHub.$on("terra_active_project", project => {
      this.active_project = project;
      this.getData(true);
    });
  },
  beforeDestroy () {
    this.$eventHub.$off("terra_active_project");
  },
  methods: {
    async getData(loading = false) {
      this.is_loading = loading;
      this.data = await featureTypeGroupService.get_ftg({
        id: this.$route.params.id,
        query: `project=${this.active_project ? this.active_project.uid : ""}`
      });
      this.is_loading = false;
    },
    cancelNew() {
      this.is_create = false;
      this.form.name = "";
    },
    async save() {
      if (!this.form.name) {
        this.$toast.open("Name is Required");
        return;
      }
      if (this.is_edit) {
        this.is_edit = false;
        featureTypeGroupService
          .patch({
            uid: this.form.uid,
            body: {
              name: this.form.name
            }
          })
          .then(res => {
            this.form.name = "";
            this.getData();
          });
      } else if (this.is_create) {
        this.is_create = false;
        let data = await featureTypeGroupService.post({
          body: { name: this.form.name, org: this.details.organization }
        });
        this.form.name = "";
        this.assign_ftg(data.uid);
      }
    },
    async assign_ftg(uid) {
      await featureTypeGroupService.assign_to_view({
        id: this.$route.params.id,
        body: {
          featureTypeGroups: [uid]
        }
      });
      this.getData();
    },
    sort(data) {
      if (!data) return [];
      return _.sortBy(data, [p => p.name.toLowerCase()]);
    }
  }
};
</script>
<style lang="scss">
.input.no-outline {
  &:focus,
  &:active {
    border: solid 1px rgba(23, 30, 72, 0.2) !important;
    box-shadow: none;
  }
}
.delete-icon {
  margin-left: 1rem;
  color: $error;
}
.save-icon {
  margin: 0 1rem 0 2rem;
  color: $primary;
}
</style>
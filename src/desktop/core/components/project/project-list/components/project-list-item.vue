<template>
  <div>
    <div class="columns is-flex is-vcenter">
      <div class="column is-4 is-flex align-center">
        <div class="b-checkbox mr-15" @click="$emit('add_to_selection', item.uid)" style="margin-top: 2px">
          <input type="checkbox" class="sh-custom-checkbox is-thinner fill" name="project" :id="item.uid" :checked="selected.includes(item.uid)" />
        </div>
        <div>
          <h4
            v-tooltip="item.name"
            :class="selected.includes(item.uid) ? 'has-text-blue' : 'has-text-theme-black'"
            class="is-marginless is-marginless no-whitespace-wrap is-semiBold-16-600-19"
          >
            <router-link class="has-primary-text mr-5" :to="{ name: 'project-details', params: { group_id: item.group.uid, id: item.uid } }">
              {{ item.name | truncate(16) }}
            </router-link>
            <span
              @click="
                group_disabled = !group_disabled;
                update_properties(item);
              "
              v-if="$store.getters.is_internal_user"
            >
              <i v-if="group_disabled" class="fa fa-times is-pointer" aria-hidden="true" style="color: red" />
              <i v-else class="fa fa-check is-pointer" aria-hidden="true" style="color: green" />
            </span>
          </h4>
          <p class="is-marginless is-medium-14-500-17 has-text-theme-black has-opacity-7 is-capitalized pt-5">{{ item.no_of_images }} images</p>
        </div>
      </div>

      <!-- <div class="column" :class="[$route.name == 'group-list' ? 'is-3' : 'is-4']">
        <p class="is-marginless is-medium-16-500-19 no-whitespace-wrap">
          {{ item.created_at | dateFormat }}
        </p>
      </div> -->

      <div
        class="column"
        :class="[$route.name == 'group-list' ? 'is-3' : 'is-4']"
        v-click-outside="() => (cal_active = false)"
        @click="
          cal_active = !cal_active;
          create_cal();
        "
      >
        <p class="is-marginless is-medium-16-500-19 no-whitespace-wrap  is-pointer is-flex is-vcenter" v-if="item.properties && item.properties.date">
          {{ new Date(item.properties.date).toLocaleDateString() }}
          <span class="ml-5" @click.stop="remove_date()" v-if="hover == item.uid">
            <sh-icon :name="'close'" class="is-12x12"></sh-icon>
          </span>
        </p>
        <p v-else class="is-marginless is-regular-14-00-17 has-text-blue-grey is-pointer">
          Set Date
        </p>
        <div v-show="cal_active">
          <div :id="`${'project_list_cal-' + item.uid}`"></div>
        </div>
      </div>

      <div v-if="$route.name == 'group-list'" class="column is-3">
        <div v-if="access('missions')">
          <div class="is-flex align-center">
            <p class="is-marginless is-medium-16-500-19" :class="[item.missions ? null : 'text-inactive']">*No associated missions</p>
          </div>
        </div>
        <div v-else @click="no_access_popup('missions')" class=" is-not-allowed">
          <p class="is-marginless is-medium-16-500-19" :class="[item.missions ? null : 'text-inactive']">*No Access</p>
        </div>
      </div>
      <div class="column is-flex is-between align-center" :class="$route.name == 'group-list' ? 'is-2' : 'is-3'">
        <div v-if="access('processing') && $store.getters.is_qc_internal_user">
          <p
            @click="access('processing') ? create_process(item) : no_access_popup('processing')"
            class="processing"
            style="height:30px"
            :class="[item.process && item.process.status ? 'has-text-dark is-' + item.process.status : 'is-start is-pointer']"
          >
            <sh-icon class="mr-5 is-24x24" v-if="item.process && item.process.status" :name="item.process.status + '-colored'" />
            <sh-icon :name="'start-processing'" class="mr-5 is-16x16" v-else />
            {{ item.process && item.process.status ? item.process.status : "start" }}
          </p>
        </div>
        <div v-else class="is-regular-14-00-17 has-opacity-6 no-whitespace-wrap">
          *No access
        </div>
      </div>

      <div class="column">
        <div class="actions-dropdown" @click="active == item.uid ? (active = -1) : (active = item.uid)">
          <div class="actions-dropdown-selection" :class="[hover == item.uid || active == item.uid ? null : 'is-hidden']">
            <sh-icon :name="'3-dots-menu'" class="is-20x20" />
          </div>
        </div>
      </div>
      <project-dropdown
        :item="item"
        v-if="active == item.uid"
        :active="active"
        @on-edit="$emit('edit', item)"
        @hide-dropdown="active = -1"
        @deleted="project_deleted"
      ></project-dropdown>
    </div>
  </div>
</template>
<script>
  import PromptModal from "@/desktop/shared/components/prompt-modal";
  import ProjectDropdown from "@/desktop/core/components/project/project-list/components/project-dropdown";
  import { projectService, processingService } from "@/desktop/shared/services/";

  export default {
    props: ["item", "hover", "selected", "show_title", "asset_id"],
    components: {
      PromptModal,
      ProjectDropdown,
    },
    data() {
      return {
        showDeleteModal: false,
        showPropertiesModal: false,
        copy_project: -1,
        currentProject: null,
        active: -1,
        group_disabled: null,
        properties: {},
        calendar: null,
        cal_active: false,
      };
    },
    mounted() {
      if (Object.keys(this.item.properties).length) {
        this.properties = this.item.properties;
        this.group_disabled = this.item.properties.is_disabled;
      } else {
        this.properties = {};
        this.group_disabled = false;
      }
      // this.create_cal();
    },

    methods: {
      create_cal() {
        if (!this.calendar) {
          this.calendar = new dhx.Calendar(`${"project_list_cal-" + this.item.uid}`, {
            css: "projects-cal",
            value: this.item && this.item.properties && this.item.properties.date ? new Date(this.item.properties.date) : new Date(),
          });
        }
        this.calendar.events.on("Change", (date) => {
          this.change_duedate(date);
        });
      },
      change_duedate(date) {
        this.properties.date = date;
        this.update_properties(this.item);
        this.cal_active = false;
        this.calendar = null;
      },
      remove_date() {
        this.properties.date = null;
        this.update_properties(this.item);
      },

      async update_properties(project) {
        this.properties.is_disabled = this.group_disabled;
        let result = await projectService
          .patch({
            group_id: project.group.uid,
            id: project.uid,
            body: { properties: this.properties },
          })
          .catch((err) => this.handleErrors(err, true));
        if (result) {
          // this.show_success("Project properties updated.");
          this.cal_active ? (this.cal_active = false) : null;
        }
        this.$eventHub.$emit("refresh-project-list");
      },
      project_deleted() {
        this.$eventHub.$emit("refresh-group-list");
        this.$eventHub.$emit("refresh-project-list");
        this.$buefy.toast.open({
          type: "is-danger",
          message: "Deleted successfully!",
        });
      },
      async get_process(project) {
        let { results } = await processingService.getAll({ query: "&no_org&project_id=" + project.uid }).catch((err) => {
          this.handleErrors(err);
        });
        if (results && results.length) {
          this.$router.push({
            name: "processing-config",
            params: { id: results[0].uid },
          });
        } else {
          this.$toast.show("Process for this project already exists", "", this.$store.state.izitoast_options.appWarning);
        }
      },
      async create_process(project) {
        if (!project.process || !project.process.status) {
          let body = {
            name: project.group.name + "$$" + project.name,
            images: [],
            project_id: project.uid,
            group_id: this.$route.params.id,
            project_type: "general",
            organization: this.$store.state.current_organization || null,
            asset_id: this.asset_id,
          };

          let data = await processingService.post({ body }).catch(async (err) => {
            console.log("Process not Found creating new one...");
            await this.get_process(project);
          });
          if (data) {
            this.$router.push({
              name: "processing-config",
              params: { id: data.uid },
            });
          }
        }
      },
    },
  };
</script>

<style lang="scss">
  .projects-cal {
    box-shadow: 0px 0px 5px 1px #ddd;
    border-radius: 0.5rem;
    position: absolute;
    background: white;
    z-index: 1000;
  }
</style>

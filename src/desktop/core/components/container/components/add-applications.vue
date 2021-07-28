<template>
  <div class="add-item">
    <div class="add-item__header">
      <span class="add-item__header__title">Add Application</span>
      <sh-icon @click.native="hide_modal" :name="'close'" :file="'helper_sprite'" class="is-16x16 is-pointer"></sh-icon>
    </div>
    <div class="add-item__content has-slimscroll">
      <div class="add-item__content__select">
        <img :src="require('@/assets/icons/form-search-icon.svg')" class="mr-10" />
        <input
          v-model="appInput"
          class="add-item__content__select__text"
          type="text"
          placeholder="Search Application"
        />
      </div>
      <div class="add-item__content__heading">
        <div class="ml-50 mr-auto">Apps</div>
      </div>
      <div class="add-item__content__top" style="padding-top: 0.7rem">
        <div v-for="(app, i) in resourceApps" :key="i" class="add-item__content__top__row">
          <sh-icon @click.native="remove_from_resource_app(i)" :name="'close'" :file="'helper_sprite'" class="is-16x16 is-pointer"></sh-icon>
          <div class="add-item__content__top__row__main">
            <div
              class="add-item__content__top__row__main__icon" :style="`background-color: ${hashed_color(app.name, 'tag')}`"
            >{{app.name ? app.name.charAt(0).toUpperCase() : null}}</div>
            <span class="add-item__content__top__row__main__name">{{app.name}}</span>
          </div>
        </div>
      </div>
      <div class="add-item__content__bottom">
        <div v-for="(app, i) in filteredAllApps" :key="i" class="add-item__content__bottom__row">
          <div
            @click="select_app(app)"
            class="add-item__content__bottom__row__checkbox"
            :class="{'add-item__content__bottom__row__checkbox--selected': selectedApps[app.uid] }"
          >
            <i v-if="selectedApps[app.uid]" class="fa fa-check" aria-hidden="true" />
          </div>
          <div class="add-item__content__bottom__row__main">
            <div
              class="add-item__content__bottom__row__main__icon" :style="`background-color: ${hashed_color(app.name, 'tag')}`"
            >{{app.name ? app.name.charAt(0).toUpperCase() : null}}</div>
            <span class="add-item__content__bottom__row__main__name">{{app.name}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="add-item__footer">
      <div v-if="is_saving" class="add-item__footer__button button is-pulled-right">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="add_apps" class="add-item__footer__button is-pulled-right">Save</div>
      <div @click="$emit('close')" class="add-item__footer__button__cancel button is-pulled-right is-medium-16-500-19 mr-10">Cancel</div>
    </div>
  </div>
</template>

<script>
import { containerService, apptypeService } from "@/desktop/shared/services/";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
export default {
  name: "add-applications",
  props: ["apps"],
  mixins: [HashColor],
  data() {
    return {
      appInput: "",
      allApps: null,
      resourceApps: {},
      selectedApps: {},
      is_saving: false
    };
  },

  computed: {
    filteredAllApps() {
      if (this.allApps) {
        let filteredApps = this.allApps.filter(
          f => !Object.keys(this.resourceApps).includes(f.uid.toString())
        );
        return filteredApps.filter(f =>
          this.appInput
            ? f.name.toLowerCase().startsWith(this.appInput.toLowerCase())
            : f.name
        );
      }
      return this.allApps;
    }
  },

  created() {
    this.get_apps();
    this.populate_resource_apps();
  },

  methods: {
    hide_modal() {
      this.$emit("close");
    },
    async get_apps() {
      let result = await apptypeService
        .getAll()
        .catch(err => this.handleErrors(err));
      this.allApps = result.results;
    },
    remove_from_resource_app(uid) {
      delete this.resourceApps[uid];
      this.resourceApps = { ...this.resourceApps };
    },
    select_app(app) {
      if (this.selectedApps[app.uid]) delete this.selectedApps[app.uid];
      else this.selectedApps[app.uid] = app;
      this.selectedApps = { ...this.selectedApps };
    },
    add_apps() {
      this.is_saving = true;
      containerService
        .patch({
          id: this.$route.params.id,
          body: {
            app_types: Object.values(this.selectedApps).concat(
              Object.values(this.resourceApps)
            )
          }
        })
        .then(res => {
          this.show_success(res.message);
          this.$eventHub.$emit("refresh-container-details");
          this.$eventHub.$emit("refresh-container-list");
          this.is_saving = false;
          this.$emit("close");
        })
        .catch(err => this.handleErrors(err));
    },
    populate_resource_apps() {
      for (let i = 0; i < this.apps.length; i++)
        this.resourceApps[this.apps[i].uid] = this.apps[i];
    }
  }
};
</script>
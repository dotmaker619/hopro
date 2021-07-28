<template>
  <div class="add-item">
    <div class="add-item__header">
      <span class="add-item__header__title">Add Groups</span>
      <i @click="hide_modal" class="fa fa-times add-item__header__close" aria-hidden="true" />
    </div>
    <div class="add-item__content has-slimscroll">
      <div class="add-item__content__select">
        <img :src="require('@/assets/icons/form-search-icon.svg')" class="mr-10" />
        <input v-model="groupInput" class="add-item__content__select__text" type="text" placeholder="Search Group Name" />
      </div>
      <div class="add-item__content__heading">
        <div class="ml-50 mr-auto">Groups</div>
      </div>
      <div class="add-item__content__top" style="padding-top: 0.7rem">
        <div v-for="(group, i) in resourceGroups" :key="i" class="add-item__content__top__row">
          <i @click="remove_from_resource_group(i)" class="fa fa-times add-item__content__top__row__cancel" />
          <div class="add-item__content__top__row__main">
            <div class="image is-24x24 mr-10" v-if="group.properties && group.properties.icon">
              <img :src="group.properties.icon" class="image is-24x24 is-rounded" />
            </div>
            <div
              v-else
              class="add-item__content__top__row__main__icon"
              :style="
                `background-color: ${
                  group.properties && group.properties.color ? group.properties.color : hashed_color(group.name, 'projectManagement')
                }`
              "
            >
              {{ group.name.charAt(0).toUpperCase() }}
            </div>
            <span class="add-item__content__top__row__main__name">{{ group.name }}</span>
          </div>
        </div>
      </div>
      <div class="add-item__content__bottom">
        <div v-for="(group, i) in filteredAllGroups" :key="i" class="add-item__content__bottom__row">
          <div
            @click="select_group(group.uid)"
            class="add-item__content__bottom__row__checkbox"
            :class="{ 'add-item__content__bottom__row__checkbox--selected': selectedGroups[group.uid] }"
          >
            <i v-if="selectedGroups[group.uid]" class="fa fa-check" aria-hidden="true" />
          </div>
          <div class="add-item__content__bottom__row__main">
            <div class="image is-24x24 mr-10" v-if="group.properties && group.properties.icon">
              <img :src="group.properties.icon" class="image is-24x24 is-rounded" />
            </div>
            <div
              v-else
              class="add-item__content__bottom__row__main__icon"
              :style="
                `background-color: ${
                  group.properties && group.properties.color ? group.properties.color : hashed_color(group.name, 'projectManagement')
                }`
              "
            >
              {{ group.name.charAt(0).toUpperCase() }}
            </div>
            <span class="add-item__content__bottom__row__main__name">{{ group.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="add-item__footer">
      <div v-if="is_saving" class="add-item__footer__button button is-pulled-right">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="add_groups" class="add-item__footer__button is-pulled-right">Save</div>
      <div @click="$emit('close')" class="add-item__footer__button__cancel button is-pulled-right is-medium-16-500-19 mr-10">Cancel</div>
    </div>
  </div>
</template>

<script>
  import { containerService, groupService } from "@/desktop/shared/services/";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    name: "add-container-groups",
    props: ["groups"],
    mixins: [HashColor],

    data() {
      return {
        groupInput: "",
        allGroups: null,
        resourceGroups: {},
        selectedGroups: {},
        is_saving: false,
      };
    },

    computed: {
      filteredAllGroups() {
        if (this.allGroups) {
          let filteredGroups = this.allGroups.filter((f) => !Object.keys(this.resourceGroups).includes(f.uid));
          return filteredGroups.filter((f) => f.name.toLowerCase().startsWith(this.groupInput.toLowerCase()));
        }
        return this.allGroups;
      },
    },

    created() {
      this.get_groups();
      this.populate_resource_groups();
    },

    methods: {
      hide_modal() {
        this.$emit("close");
      },
      async get_groups() {
        let result = await groupService.getAll({ query: "container=null" }).catch((err) => this.handleErrors(err));
        this.allGroups = result.results;
      },
      remove_from_resource_group(uid) {
        delete this.resourceGroups[uid];
        this.resourceGroups = { ...this.resourceGroups };
      },
      select_group(groupUid) {
        if (this.selectedGroups[groupUid]) delete this.selectedGroups[groupUid];
        else this.selectedGroups[groupUid] = { uid: groupUid };
        this.selectedGroups = { ...this.selectedGroups };
      },
      async add_groups() {
        this.is_saving = true;
        await containerService
          .patch({
            id: this.$route.params.id,
            body: {
              groups: Object.values(this.selectedGroups).concat(Object.values(this.resourceGroups)),
            },
          })
          .then((res) => {
            this.show_success(res.message);
            this.$eventHub.$emit("refresh-container-details");
            this.$eventHub.$emit("refresh-group-list");
            this.is_saving = false;
            this.$emit("close");
          })
          .catch((err) => this.handleErrors(err));
      },
      populate_resource_groups() {
        for (let i = 0; i < this.groups.length; i++) this.resourceGroups[this.groups[i].uid] = this.groups[i];
      },
    },
  };
</script>

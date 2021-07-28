<template>
  <div class="add-item" @click.stop="">
    <div class="add-item__header">
      <span
        class="is-flex is-vcenter add-item__header__title is-medium-18-500-22"
        :class="{ 'is-medium-16-500-19': isMobile }"
      >
        Add Teams
      </span>
      <i
        @click="$emit('close')"
        class="fa fa-times add-item__header__close"
        aria-hidden="true"
      />
    </div>
    <div class="add-item__content__select">
      <img
        :src="require('@/assets/icons/form-search-icon.svg')"
        class="mr-10"
      />
      <input
        v-model="search"
        class="add-item__content__select__text is-medium-16-500-19"
        type="text"
        placeholder="Search teams"
      />
    </div>
    <div class="add-item__content has-slimscroll">
      <div class="add-item__content__heading mb-0">
        <div
          class="mr-auto is-regular-14-00-17"
          :class="`${isMobile ? 'ml-40' : 'ml-45'}`"
        >
          Teams
        </div>
        <template v-if="!remove_access">
          <div class="is-regular-14-00-17">Read</div>
          <div class="is-regular-14-00-17">Write</div>
        </template>
      </div>
      <div
        :class="{ 'add-item__content__top': !isMobile }"
        style="padding-top: 0.7rem"
      >
        <div v-for="(group, i) in grouped_teams" :key="i" class="pt-20">
          <h1
            v-if="group.length"
            class="is-medium-14-500-17 is-flex is-vcenter ml-10"
          >
            <template v-if="group[0].asset_id">
              <img src="@/assets/icons/asset-icon-1.svg" class="mr-7" />
              {{ assets_hash[group[0].asset_id].name }}
            </template>
            <template v-else>
              <sh-icon
                :name="`organizations`"
                :file="'admin_sprite'"
                class="is-20x20 mr-7"
              ></sh-icon>

              {{ $store.state.current_organization.name }}
            </template>
          </h1>
          <h1 v-else class="is-medium-14-500-17 is-flex is-vcenter ml-15">
            <img src="@/assets/icons/asset-icon-1.svg" class="mr-7" />
            {{ assets_hash[asset_id] && assets_hash[asset_id].name }}
          </h1>
          <div
            style="
              height: 0;
              margin: 10px 10px 0;
              opacity: 0.1;
              border: solid 1px #171e48;
            "
          ></div>
          <add-team
            v-if="!isMobile"
            :asset_id="group.length ? group[0].asset_id : asset_id"
          ></add-team>

          <div v-for="(team, i) in sorted(group)" :key="i">
            <div class="add-item__content__top__row">
              <i
                v-if="existing_uids.includes(team.uid)"
                @click="remove_from_existing(team.uid)"
                class="fa fa-times add-item__content__top__row__cancel mr-5"
              />
              <div v-else class="add-item__content__bottom__row__b-checkbox">
                <input
                  type="checkbox"
                  @change="toggle(team)"
                  :checked="selected[team.uid] ? true : false"
                  class="sh-custom-checkbox"
                />
              </div>

              <div class="add-item__content__top__row__main">
                <div
                  class="image is-24x24 mr-10"
                  v-if="
                    $store.getters.state_teams[team.uid] &&
                    $store.getters.state_teams[team.uid].properties &&
                    $store.getters.state_teams[team.uid].properties.icon
                  "
                >
                  <img
                    :src="$store.getters.state_teams[team.uid].properties.icon"
                    class="image is-24x24 is-rounded"
                  />
                </div>
                <div
                  v-else
                  class="add-item__content__top__row__main__icon"
                  :style="`background-color: ${
                    $store.getters.state_teams[team.uid] &&
                    $store.getters.state_teams[team.uid].properties &&
                    $store.getters.state_teams[team.uid].properties.color
                      ? $store.getters.state_teams[team.uid].properties.color
                      : hashed_color(
                          $store.getters.state_teams[team.uid]
                            ? $store.getters.state_teams[team.uid].name
                            : team.uid,
                          'userManagement'
                        )
                  }`"
                >
                  {{
                    $store.getters.state_teams[team.uid]
                      ? $store.getters.state_teams[team.uid].name
                          .charAt(0)
                          .toUpperCase()
                      : team.uid.charAt(0).toUpperCase()
                  }}
                </div>
                <span
                  class="add-item__content__top__row__main__name is-medium-16-500-19"
                  >{{
                    $store.getters.state_teams[team.uid]
                      ? $store.getters.state_teams[team.uid].name
                      : team.uid
                  }}
                  <a
                    v-if="!isMobile"
                    class="ml-15 add-item__content__top__row-add-user-button show-all"
                    @click="
                      is_user_list === team.uid
                        ? (is_user_list = null)
                        : (is_user_list = team.uid)
                    "
                    >Show Users</a
                  >
                </span>
              </div>
              <template v-if="!remove_access">
                <span
                  style="cursor: pointer"
                  :class="{
                    'sh-access-tag--read':
                      selected[team.uid] &&
                      (selected[team.uid].access === 'read' ||
                        selected[team.uid].access === 'write'),
                  }"
                  @click="change_access(team, 'read')"
                  class="sh-access-tag"
                >
                  <i class="fa fa-check" aria-hidden="true" />
                </span>
                <span
                  style="cursor: pointer"
                  @click="change_access(team, 'write')"
                  class="sh-access-tag"
                  :class="{
                    'sh-access-tag--write':
                      selected[team.uid] &&
                      selected[team.uid].access === 'write',
                  }"
                >
                  <i class="fa fa-check" aria-hidden="true" />
                </span>
              </template>
            </div>
            <user-list
              v-if="!isMobile && is_user_list === team.uid"
              :team_id="team.uid"
            ></user-list>
          </div>
        </div>
        <a @click="show_all = !show_all" class="show-all">{{
          show_all ? "Show less" : "Show all"
        }}</a>
      </div>
    </div>
    <div v-if="isMobile" class="add-item__footer mobile-footer">
      <div
        v-if="is_saving"
        class="add-item__footer__full-button button is-pulled-right"
      >
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div
        v-else
        @click="update"
        class="add-item__footer__full-button button has-text-white is-pulled-right is-medium-16-500-19"
      >
        Add Teams
      </div>
    </div>
    <div v-else class="add-item__footer">
      <div
        v-if="is_saving"
        class="add-item__footer__button button is-pulled-right"
      >
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div
        v-else
        @click="update"
        class="add-item__footer__button button has-text-white is-pulled-right is-medium-16-500-19"
      >
        Add Teams
      </div>
      <div
        @click="$emit('close')"
        class="add-item__footer__button__cancel button is-pulled-right is-medium-16-500-19 mr-10"
      >
        Cancel
      </div>
    </div>
  </div>
</template>

<script>
import Mixin from "@/desktop/shared/mixins/add-team-user.mixin.vue";
import TeamFormComponent from "@/desktop/core/components/team/team-list/components/team-form.component";
import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
import { mapState } from "vuex";
import UserList from "./add-teams-modal-user-list";
import AddTeam from "./add-teams-modal-add-team.vue";
export default {
  mixins: [Mixin, FormPopup, HashColor],
  components: {
    UserList,
    AddTeam,
  },
  props: [
    "teams",
    "complete",
    "service",
    "item_uid",
    "hide_access",
    "asset_id",
  ],
  data() {
    return {
      show_all: this.asset_id?false:true,
      is_user_list: null,
      TeamFormComponent: TeamFormComponent,
      items: this.teams,
      search: "",
      type: "labels",
      existing: [],
      selected: {},
    };
  },
  created() {
    this.existing = Object.assign([], this.items);
    this.items.forEach((element) => {
      this.selected[element.uid] = element;
    });
  },
  computed: {
    ...mapState(["assets"]),
    assets_hash() {
      return (this.assets || []).reduce(function (map, obj) {
        map[obj.uid] = obj;
        return map;
      }, {});
    },
    filtered_teams() {
      let data = _.filter(this.$store.state.teams || [], (f) =>
        _.includes(f.name.toLowerCase(), this.search.toLowerCase())
      );
      return data;
    },
    grouped_teams() {
      // if (this.asset_id) {
      let data;
      data = Object.values(_.groupBy(this.filtered_teams, "asset_id"));
      data = data.sort((a, b) => {
        if (
          !a[0].asset_id ||
          !this.assets_hash[a[0].asset_id] ||
          !this.assets_hash[b[0].asset_id]
        )
          return 0;
        if (
          this.assets_hash[a[0].asset_id].name >
          this.assets_hash[b[0].asset_id].name
        ) {
          return -1;
        }
        if (
          this.assets_hash[a[0].asset_id].name <
          this.assets_hash[b[0].asset_id].name
        ) {
          return 1;
        }
        return 0;
      });

      if (this.asset_id) {
        let index = data.findIndex((g) => g[0].asset_id === this.asset_id);
        if (index >= 0) {
          let item = data[index];
          data.splice(index, 1);
          data.unshift(item);
        } else {
          data.unshift([]);
        }
      }

      let index2 = data.findIndex((g) => g.length && !g[0].asset_id);
      if (index2 >= 0) {
        let item = data[index2];
        data.splice(index2, 1);
        data.push(item);
      }
      if (this.show_all) return data;
      else return [data[0]];
    },
    remove_access() {
      return this.team || this.role || this.hide_access;
    },
  },
  methods: {
    remove_from_existing(uid) {
      _.remove(this.existing, (item) => item.uid == uid);
      delete this.selected[uid];
      this.existing = [...this.existing];
      this.selected = Object.assign({}, this.selected);
    },
    toggle(item) {
      if (this.selected[item.uid]) {
        delete this.selected[item.uid];
      } else {
        this.selected[item.uid] = { ...item, access: "read" };
      }
      this.selected = Object.assign({}, this.selected);
    },
    sorted(arr) {
      let non_existing = _.filter(
        arr,
        (f) => !this.existing_uids.includes(f.uid)
      );
      console.log(non_existing);

      non_existing = _.orderBy(non_existing,['created_at'],['desc'])

      let existing = _.filter(arr, (f) => this.existing_uids.includes(f.uid));
      return [...existing, ...non_existing];
    },
  },
};
</script>
<style lang="scss" scoped>
.mobile-footer {
  position: fixed !important;
}
.add-teams-modal-add {
  font-family: Barlow-Medium;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.19;
  color: #2585d3;
}
.add-item__content__top__row {
  
  &-add-user-button {
    visibility: hidden;
  }
  &:hover {
    background-color: rgba(37, 133, 211, 0.1);
    border-radius: 0.6rem;
  }
  &:hover &-add-user-button {
    visibility: visible;
  }
}
.add-item__content__heading {
  grid-template-columns: auto 15% 10%;
}

.add-item__content__top__row,
.add-item__content__bottom__row {
  grid-template-columns: 10% auto 15% 10%;
}
.show-all {
  margin-left: 10px;
  font-family: Barlow-Medium;
  font-size: 16px;
  font-weight: 500;
  color: #2585d3;
}
</style>

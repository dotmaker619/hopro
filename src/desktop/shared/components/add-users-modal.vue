<template>
  <div class="add-item" @click.stop="">
    <div class="add-item__header">
      <span
        class="add-item__header__title is-semiBold-20-600-000"
        :class="{ 'is-medium-16-500-19': isMobile }"
        >Add Users</span
      >
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
        placeholder="Search User Name"
      />
    </div>
    <div class="add-item__content has-slimscroll">
      <template v-if="existing && existing.length">
        <div class="add-item__content__heading">
          <div
            class="mr-auto is-regular-14-00-17"
            :class="`${isMobile ? 'ml-40' : 'ml-50'}`"
          >
            Users
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
          <div
            v-for="(user, i) in existing"
            :key="i"
            class="add-item__content__top__row"
          >
            <i
              @click="include_users.push(existing.splice(i, 1)[0].uid)"
              class="fa fa-times add-item__content__top__row__cancel"
            />

            <div class="add-item__content__top__row__main">
              <user-avatar
                :user="user"
                :custom_class="'tiny-user-avatar'"
                :pxsize="24"
                class="mr-10"
              ></user-avatar>
              <span
                class="add-item__content__top__row__main__name is-medium-16-500-19"
                v-username="user"
              ></span>
            </div>
            <template v-if="!remove_access">
              <span
                class="sh-access-tag"
                style="cursor: pointer"
                :class="{
                  'sh-access-tag--read':
                    user.access === 'read' || user.access === 'write',
                }"
                @click="user.access = 'read'"
              >
                <i class="fa fa-check" aria-hidden="true" />
              </span>
              <span
                class="sh-access-tag"
                style="cursor: pointer"
                :class="{ 'sh-access-tag--write': user.access === 'write' }"
                @click="user.access = 'write'"
              >
                <i class="fa fa-check" aria-hidden="true" />
              </span>
            </template>
          </div>
        </div>
      </template>
      <div :class="{ 'add-item__content__bottom': !isMobile }">
        <div v-if="filtered.length">
          <div
            v-for="(user, i) in filtered"
            :key="i"
            class="add-item__content__bottom__row"
          >
            <div class="add-item__content__bottom__row__b-checkbox">
              <input
                type="checkbox"
                @change="toggle(user)"
                :checked="selected[user.uid] ? true : false"
                class="sh-custom-checkbox"
              />
            </div>
            <div class="add-item__content__bottom__row__main">
              <div v-if="user.display_picture" class="image is-24x24 mr-10">
                <img
                  :src="user.display_picture"
                  class="image is-24x24 is-rounded"
                />
              </div>
              <div
                v-else
                class="add-item__content__bottom__row__main__icon"
                :style="`background-color: ${
                  user.first_name
                    ? hashed_color(
                        user.first_name + ' ' + user.last_name,
                        'userManagement'
                      )
                    : hashed_color(user.email, 'userManagement')
                }`"
              >
                {{
                  user.first_name
                    ? user.first_name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()
                }}
              </div>
              <span
                class="add-item__content__bottom__row__main__name is-medium-16-500-19"
                style="word-break: break-word"
                >{{
                  user.first_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email
                }}</span
              >
              <span
                class="add-item__content__bottom__row__main__name ml-5 has-text-grey"
                >{{
                  user.is_guest
                    ? "(Guest)"
                    : user.is_internal
                    ? "(Internal)"
                    : ""
                }}</span
              >
            </div>
            <template v-if="!remove_access">
              <span
                style="cursor: pointer"
                :class="{
                  'sh-access-tag--read':
                    selected[user.uid] &&
                    (selected[user.uid].access === 'read' ||
                      selected[user.uid].access === 'write'),
                }"
                @click="change_access(user, 'read')"
                class="sh-access-tag"
              >
                <i class="fa fa-check" aria-hidden="true" />
              </span>
              <span
                style="cursor: pointer"
                @click="change_access(user, 'write')"
                class="sh-access-tag"
                :class="{
                  'sh-access-tag--write':
                    selected[user.uid] && selected[user.uid].access === 'write',
                }"
              >
                <i class="fa fa-check" aria-hidden="true" />
              </span>
            </template>
          </div>
        </div>
        <invite-user :search="search" v-else></invite-user>
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
        Add Users
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
        Save
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
import { userService } from "@/desktop/shared/services/";
import InviteUser from "./add-teams-modal-user-list-invite/add-teams-modal-user-list-invite.vue";

import Mixin from "@/desktop/shared/mixins/add-team-user.mixin.vue";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
export default {
  mixins: [Mixin, HashColor],
  components: {
    InviteUser,
  },
  props: [
    "users",
    "complete",
    "service",
    "item_uid",
    "team",
    "role",
    "hide_access",
  ],
  data() {
    return {
      items: this.users,
      search: "",
      type: "users",
      existing: [],
      selected: {},
      include_users: [],
    };
  },

  computed: {
    filtered() {
      if (this.remove_access) {
        return _.filter(
          this.$store.state.users || [],
          (u) =>
            !this.existing_uids.includes(u.uid) &&
            this.include_users.includes(u.uid) &&
            _.includes(
              (u.email + u.first_name).toLowerCase(),
              this.search.toLowerCase()
            )
        );
      } else
        return _.filter(
          this.$store.state.users || [],
          (u) =>
            !this.existing_uids.includes(u.uid) &&
            _.includes(
              (u.email + u.first_name).toLowerCase(),
              this.search.toLowerCase()
            )
        );
    },
    remove_access() {
      return this.team || this.role || this.hide_access;
    },
  },
  async created() {
    this.include_users = Object.assign(
      [],
      this.$store.state.users.map((u) => u.uid)
    );
    try {
      if (this.team) {
        let data = await userService.getAll({
          from_server: true,
          query: "active=true&exclude_label=" + this.item_uid,
        });
        if (data.results) this.include_users = data.results.map((u) => u.uid);
      }
      if (this.role) {
        let data = await userService.getAll({
          from_server: true,
          query: "active=true&team=null",
        });
        if (data.results) this.include_users = data.results.map((u) => u.uid);
      }
    } catch (err) {
      console.log(err);
    }
    this.existing = Object.assign([], this.items);
  },
};
</script>
<style lang="scss" scoped>
.mobile-footer {
  position: fixed !important;
}
</style>

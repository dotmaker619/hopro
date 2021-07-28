<template>
  <div class="is-flex has-direction-column is-vcenter mt-30">
    <div v-if="is_valid_email">
      <div
        v-if="
          search &&
          (access('core', 'invite_users') || access('core', 'add_guest_users'))
        "
        class="has-text-centered is-medium-16-500-22 has-primary-text user-list-info-text truncate-text"
      >
        &#8220;{{ search }}&#8221;
      </div>
      <!--  -->
      <div v-if="invite_user_org">
        <template v-if="access('core', 'add_guest_users')">
          <div class="info-text-invite has-text-centered">
            is available from different organization
          </div>
          <div class="is-flex is-center mt-25">
            <div
              style="width: 24px; height: 24px"
              class="sh-form__content__organization__icon is-24x24"
              :style="`background-color: ${hashed_color(
                invite_user_org.organization.name,
                'projectManagement'
              )}`"
            >
              {{ invite_user_org.organization.name.charAt(0) }}
            </div>
            <span style="color: #171e48" class="is-medium-16-500-19">
              {{ invite_user_org.organization.name }}
            </span>
            <!-- <div class="is-medium-16-500-19"> -->
            <!-- {{ invite_user_org.email }} -->
            <!-- </div> -->
          </div>
        </template>
        <no-results v-else :search="search" />
      </div>
      <template v-else>
        <div
          class="info-text-invite has-text-centered"
          v-if="access('core', 'invite_users')"
        >
          is not available
        </div>
        <no-results v-else :search="search" />
      </template>

      <div
        class="has-text-centered mt-20"
        v-if="
          access('core', 'invite_users') && access('core', 'add_guest_users')
        "
      >
        <a @click="invite_user()" class="button is-large is-info">Invite Now</a>
      </div>
    </div>
    <no-results v-else :search="search" />
  </div>
</template>

<script>
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
import { userService } from "@/desktop/shared/services/";
import NoResults from "./no-results";

export default {
  mixins: [HashColor],
  components: {
    NoResults,
  },
  data() {
    return {
      invite_user_org: null,
    };
  },
  props: ["search"],
  computed: {
    is_valid_email() {
      if (this.search) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(this.search).toLowerCase());
      }
      return false;
    },
  },
  watch: {
    search() {
      this.verify_user();
    },
  },
  methods: {
    invite_user() {
      if (this.invite_user_org) {
        userService
          .invite_guest_users({
            body: [
              {
                uid: this.invite_user_org.uid,
                email: this.invite_user_org.email,
              },
            ],
          })
          .then((res) => {
            console.log(res);
          });
      } else {
        userService
          .invite_users({ body: { users: [{ email: this.search, name: "" }] } })
          .then((res) => {
            console.log(res);
          });
      }
    },
    verify_user() {
      if (this.is_valid_email) {
        userService
          .verify_email({
            body: [{ email: this.search }],
          })
          .then((res) => {
            this.invite_user_org = res[0];
          })
          .catch((err) => {
            this.invite_user_org = null;
            this.handleErrors(err);
          });
      } else {
        this.invite_user_org = null;
      }
    },
  },
};
</script>

<style scoped>
.info-text-invite {
  opacity: 0.7;
  font-family: Barlow-Medium;
  font-size: 14px;
  color: #171e48;
}
</style>
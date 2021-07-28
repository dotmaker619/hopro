<template>
  <div class="invite" @keyup.enter="add_user">
    <div class="invite__header mt-10 columns">
      <div class="is-capitalized is-medium-16-500-19 column">Email Address</div>
      <div class="is-capitalized is-medium-16-500-19 column">Organization</div>
    </div>
    <div class="mb-5 is-flex align-center" v-for="(user, index) in users" :key="index">
      <div class="is-medium-16-500-19 column is-paddingless">{{ user.email }}</div>
      <div class="is-medium-16-500-19 column is-flex align-center is-5">
        <span
          class="sh-form__content__organization__icon"
          :style="`background-color: ${hashed_color(user.org, 'projectManagement')}`"
        >
          {{
          user.org && user.org.charAt(0)
          }}
        </span>
        <span class>{{ user.org || "Not found" }}</span>
      </div>
      <i
        @click="users.splice(index, 1)"
        class="fa fa-times column is-1 fa-2x has-text-grey-light is-pointer"
        aria-hidden="true"
      ></i>
    </div>
    <div class="is-flex mb-20 align-center" v-if="show_form">
      <input
        @keydown="clear_org"
        v-model="form.email"
        @blur="add_user(false)"
        type="email"
        class="sh-form__content__input mr-10"
        placeholder="Type email address and press enter"
        :class="{ 'sh-form__content__input--error': form.email && !is_valid_email }"
      />

      <div class="is-medium-16-500-19 column is-6">{{ form.org }}</div>
    </div>
    <div
      @click="show_form = true"
      style="color: $primary"
      class="is-inline is-pointer mt-10 mb-40 is-medium is-semiBold-14-600-17"
    >
      <i class="fa fa-plus mr-5"></i> Add More
    </div>
    <div class="mt-40">
      <p class="is-medium-16-500-19">Note</p>
      <p
        class="is-regular-16-00-19 mt-20"
      >Users from other organizations will be added as a guest in your organization, you can add them to resources / teams as ususal.</p>
    </div>
    <div class="invite-container__footer">
      <div class="buttons">
        <div
          @click="$emit('back')"
          style="background-color:white;color:#171e48;opacity:0.6"
          class="sh-button is-pulled-right is-semiBold-14-600-17 mr-10"
        >Back</div>
        <div v-if="awaitingResponse" class="sh-button is-pulled-right">
          <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
        </div>
        <div
          v-else
          :class="[!users.length > 0 ? 'is-disabled' : '']"
          @click="save"
          class="is-pulled-right sh-button is-semiBold-14-600-17"
        >{{ "Invite Guest Users" }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from "@/desktop/shared/services/";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
export default {
  mixins: [HashColor],
  data() {
    return {
      users: [],
      form: {
        email: "",
        org: ""
      },
      show_form: true,
      awaitingResponse: false
    };
  },
  computed: {
    is_valid_email() {
      return this.validate(this.form.email);
    }
  },
  methods: {
    async add_user(show = true) {
      try {
        if (!this.is_valid_email) return;
        let result = await this.get_org([{ email: this.form.email }]);
        if (result && result[0].organization && result[0].organization.uid) {
          this.form.org =
            result[0].organization.name || result[0].organization.uid;
          this.form.email = this.form.email.toLowerCase();
          this.users.push({ ...this.form, org_details: result[0] });
          this.form = { email: "", org: "" };
          this.show_form = show;
        } else {
          this.form.org = "Not found organization";
          this.$buefy.toast.open({
            type: "is-danger",
            message: "Not found organization"
          });
        }
      } catch (err) {
        if (err.response && err.response.data)
          this.show_danger(err.response.data.message);
        else this.show_warning("Show went wrong. Pls try again in somtime.");
      }
    },
    clear_org(event) {
      if (event.key == "Delete" || "Backspace") {
        this.form.org = "";
      }
    },
    async get_org(data) {
      let result;
      await userService
        .verify_email({
          body: data
        })
        .then(res => (result = res));
      return result;
    },
    validate(email) {
      if (email) {
        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
      }
    },
    async save() {
      let result = this.users.map(user => user.org_details);
      // let result = await this.get_org(this.users.map(user => ({ email: user.email})));
      // console.log(result);
      
      let userResult = await userService
        .invite_guest_users({
          body: result.map(r => {
            r.active = true;
            return r;
          })
        })
        .catch(err => this.handleErrors(err));
      if (userResult) {
        this.show_success("Users invited successfully.");
        this.$eventHub.$emit("refresh-user-list");
        this.$emit("close");
        return;
      }
      if (this.errors) {
        this.$buefy.toast.open({
          type: "is-danger",
          message: this.errors[0]
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.invite {
  .sh-form__content__input {
    margin-top: 0;
    background-color: #f4f7fc;
  }
}
</style>

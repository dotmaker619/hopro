<template>
  <div class="invite" @keyup.enter="add_user">
    <div class="invite__header mt-10 columns">
      <div class="is-capitalized is-medium-16-500-19 column">Email Address</div>
      <div class="is-capitalized is-medium-16-500-19 column">Name (Optional)</div>
    </div>
    <div class="mb-5 is-flex align-center" v-for="(user,index) in users" :key="index">
      <div class="is-medium-16-500-19 column is-paddingless">{{user.email}}</div>
      <div class="is-medium-16-500-19 column is-5">{{user.name||'None'}}</div>
      <i
        @click="users.splice(index,1)"
        class="fa fa-times column is-1 fa-2x has-text-grey-light is-pointer"
        aria-hidden="true"
      ></i>
    </div>
    <div class="is-flex mb-20 align-center" v-if="show_form">
      <input
        @keyup.enter="add_user"
        v-model="form.email"
        type="email"
        class="sh-form__content__input mr-10"
        placeholder="Type email address and press enter"
        :class="{ 'sh-form__content__input--error' : form.email && !is_valid_email }"
      />
      <input
        @blur="add_user(false)"
        v-model="form.name"
        type="text"
        class="sh-form__content__input"
        placeholder="Type name"
      />
    </div>
    <div
      @click="show_form=true;"
      style="color: $primary"
      class="is-inline is-pointer mt-10 mb-40 is-medium is-semiBold-14-600-17"
    >
      <i class="fa fa-plus mr-5"></i> Add More
    </div>
    <div class="mt-40">
      <p class="is-medium-16-500-19">Note</p>
      <p class="is-regular-16-00-19 mt-20">Users will receive an email to signup your organization.</p>
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
          :class="[!users.length>0?'is-disabled':'']"
          @click="save"
          class="is-pulled-right sh-button is-semiBold-14-600-17"
        >{{'Invite New Users'}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from "@/desktop/shared/services/";
export default {
  data() {
    return {
      users: [],
      form: {
        name: "",
        email: ""
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
  mounted() {},
  methods: {
    add_user(show = true) {
      if (!this.is_valid_email) return;
      this.form.email = this.form.email.toLowerCase();
      this.users.push(this.form);
      this.form = { name: "", email: "" };
      this.show_form = show;
    },
    validate(email) {
      if (email) {
        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
      }
    },
    async save() {
      try {
        this.awaitingResponse = true;
        let userResult = await userService.invite_users({
          body: {
            users: this.users.map(user => ({
              email: user.email,
              name: user.name
            }))
          }
        });
        this.show_success("Users invited successfully.");
        this.$eventHub.$emit("refresh-user-list");
        this.$emit("close");
        this.awaitingResponse = false;

      } catch (err) {
        this.awaitingResponse = false;
        this.show_danger("Somthing went wrong.");
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
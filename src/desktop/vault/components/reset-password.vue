<template>
  <!-- <b-modal class="change-password-modal" :active.sync="active" @close="on_close()" :width="450"> -->
    <div class="card reset-password-card" v-if="item">
      <div class="card-header">
        <p class="card-header-title">
          <svg viewBox="0 0 100 100" class="image is-16x16 mr-5">
            <use xlink:href="@/assets/icons/vault_sprite.svg#reset-password" />
          </svg>
          Reset Password
        </p>
        <p class="card-header-icon" @click="$emit('close')">
          <svg viewBox="0 0 100 100" class="image" style="width:17px;height:17px">
            <use xlink:href="@/assets/icons/vault_sprite.svg#remove" />
          </svg>
        </p>
      </div>
      <div class="card-content">
        <div class="content-header">
          <svg viewBox="0 0 100 100" class="image" style="width:100px;height:100px">
            <use xlink:href="@/assets/icons/vault_sprite.svg#folder-100px-bg" />
          </svg>
          <p class="content-header-title">{{item.name}}</p>
        </div>
        <!-- select users -->
        <div class="field mt-20">
          <div>Old Password</div>
          <input
            @keyup.enter="save"
            type="password"
            v-model="old_password"
            placeholder="Enter Old Password"
            class="sh-form__content__input"
          />
        </div>
        <div class="field">
          <div>New Password</div>
          <input
            @keyup.enter="save"
            type="password"
            v-model="form.password"
            placeholder="New Password"
            class="sh-form__content__input"
          />
        </div>
        <div class="field">
          <input
            @keyup.enter="save"
            type="password"
            v-model="confirm_password"
            placeholder="Confirm Password"
            class="sh-form__content__input"
          />
        </div>
        <!-- select teams -->
        <div v-if="is_error" class="has-text-danger has-text-centered">{{is_error}}</div>
        <div v-if="is_success" class="has-text-success has-text-centered">{{is_success}}</div>
        <div class="submit-button">
          <a
            class="button is-fullwidth is-large is-info mr-30 mb-20"
            :class="{'is-loading':is_loading}"
            @click="save"
          >Change</a>
        </div>
      </div>
    </div>
  <!-- </b-modal> -->
</template>

<script>
import { mapMutations } from "vuex";
import {folderService} from "@/desktop/shared/services/";
export default {
  props: ['folder'],
  data() {
    return {
      is_loading: false,
      is_error: false,
      is_success: false,
      item: null,
      old_password: "",
      confirm_password: "",
      form: {
        password: ""
      }
    };
  },
  created() {
      this.item = this.folder;
      this.form.password = "";
      this.old_password = "";
      this.confirm_password = "";
      this.is_loading = false;
      this.is_error = false;
      this.is_success = false;
  },
  beforeDestroy() {
    this.on_close();
  },
  methods: {
    ...mapMutations(["SET_PASS_KEY"]),
    on_close(){

    },
    save() {
      this.is_error = false;
      if (!this.confirm_password || !this.old_password || !this.form.password) {
        if (!this.old_password)
          this.is_error = "Old password field can not be empty.";
        else if (!this.form.password)
          this.is_error = "New password field can not be empty.";
        else if (!this.confirm_password)
          this.is_error = "Confirm password field can not be empty.";
        return;
      }
      if (this.confirm_password !== this.form.password) {
        this.is_error = "Confirm password did not match.";
        return;
      }
      this.is_loading = true;
      folderService
        .set_password({
          id: this.item.uid,
          body: this.form,
          headers: this.get_password_header(this.old_password)
        })
        .then(res => {
          this.SET_PASS_KEY({ uid: this.item.uid, value: null });

          this.is_success = "Password changed successfully.";
          this.is_loading = false;
          setTimeout(() => {
            this.$emit('close')
          }, 1000);
        })
        .catch(err => {
          this.is_loading = false;
          if (err.response.status === 401) {
            this.is_error = "Incorrect password";
          } else if (err.response.status === 403) {
            this.is_error =
              "You do not have enough permissions to change the password.";
          } else if (err.response.status === 404) {
            this.is_error = "Resource not found.";
          } else {
            this.is_error = "Something went wrong!";
          }
        });
    }
  }
};
</script>

<style lang="scss">
.reset-password-card {
  .sh-form__content__input {
    margin-top: 1rem;
  }
  .submit-button {
    margin-top: 4rem;
    margin-bottom: 2rem;
  }
  .card-header {
    padding: 1rem;
    img {
      border-radius: 4px;
      width: 40px;
      height: 40px;
    }
  }
  .card-content {
    padding: 2rem 6rem;
  }
  .content-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    &-title {
      margin-top: 1rem;
      font-family: Barlow;
      font-size: 18px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.22;
      letter-spacing: normal;
      text-align: left;
      color: #171e48;
    }
  }
}
</style>


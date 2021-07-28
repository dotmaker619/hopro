<template>
  <div class="sh-form" @keyup.enter="details ? edit() : activate()">
    <div class="sh-form__content">
      <img src="@/assets/icons/form/user.svg" />
      <div class="sh-form__content__subtitle is-regular-16-00-19">{{ info.header }}</div>
      <div class="user-form__name">
        <input
          v-focus
          v-model="form.first_name"
          class="sh-form__content__input mr-10"
          type="text"
          :placeholder="'First Name'"
          :class="{
            'sh-form__content__input--error': validationError.first_name,
          }"
        />
        <input
          v-model="form.last_name"
          class="sh-form__content__input"
          type="text"
          :placeholder="'Last Name'"
          :class="{
            'sh-form__content__input--error': validationError.last_name,
          }"
        />
      </div>
      <div class="name-error">
        <div class="is-regular-14-500-17 error-message name-error__item mr-10">
          {{validationError.first_name ? 'Please enter first name': ''}}
        </div>
        <div class="is-regular-14-500-17 error-message name-error__item">
          {{validationError.last_name ? 'Please enter last name': ''}}
        </div>
      </div>
      <input
        v-if="!details"
        v-model="form.email"
        class="sh-form__content__input"
        type="email"
        :placeholder="'Email Address'"
        :class="{ 'sh-form__content__input--error': validationError.email }"
      />
      <div v-if="validationError.email" class="is-regular-14-500-17 error-message">{{email_error}} </div>

      <template v-if="!details">
        <div class="user-form__type">
          <div class="user-form__type__heading">User Type</div>
          <div class="user-form__type__options">
            <div
              @click="
                form.user_type = 'internal';
                form = { ...form };
              "
              class="user-form__type__options__each"
              :class="{
                'user-form__type__options__each--selected':
                  form.user_type === 'internal',
              }"
            >Internal</div>
            <div
              @click="
                form.user_type = 'organization';
                form = { ...form };
              "
              class="user-form__type__options__each"
              :class="{
                'user-form__type__options__each--selected':
                  form.user_type === 'organization',
              }"
            >Organization</div>
          </div>
        </div>

        <select-input
          v-if="form.user_type === 'internal'"
          :selectText="'Role'"
          :selectOptions="internalRoles"
          :selected="form.role"
          @inputChange="internalRoleChange"
          class="mt-30"
          :validationError="validationError.role"
        />
        <div v-if="validationError.role" class="is-regular-14-500-17 error-message">Please select the role</div>
        <div v-if="form.user_type === 'organization'" style="width: 100%">
          <select-input
            :selectText="'Organization'"
            :selectOptions="organizations"
            :selected="form.organization"
            @inputChange="organizationChange"
            class="mt-30"
            :validationError="validationError.organization"
          />
          <div class="block mt-20">
            <b-radio class="radio mr-30" type="is-info" v-model="radio" native-value="owner">
              <span
                class="user-form__organization-user"
                :class="{
                  'user-form__organization-user--selected': radio === 'owner',
                }"
              >Owner</span>
            </b-radio>
            <b-radio class="radio mr-30" type="is-info" v-model="radio" native-value="manager">
              <span
                class="user-form__organization-user"
                :class="{
                  'user-form__organization-user--selected': radio === 'manager',
                }"
              >Manager</span>
            </b-radio>
            <b-radio class="radio" type="is-info" v-model="radio" native-value="user">
              <span
                class="user-form__organization-user"
                :class="{
                  'user-form__organization-user--selected': radio === 'user',
                }"
              >User</span>
            </b-radio>
          </div>
        </div>

        <div class="user-form__type">
          <div class="user-form__type__heading">Password</div>
          <div class="user-form__type__options">
            <div
              @click="
                passwordSetBy = 'admin';
                form.change_password = false;
              "
              class="user-form__type__options__each"
              :class="{
                'user-form__type__options__each--selected':
                  passwordSetBy === 'admin',
              }"
            >Set By Admin</div>
            <div
              @click="passwordSetBy = 'user'"
              class="user-form__type__options__each"
              :class="{
                'user-form__type__options__each--selected':
                  passwordSetBy === 'user',
              }"
            >Set By User</div>
          </div>
        </div>

        <div v-if="passwordSetBy === 'admin'" style="width: 100%; margin-top: -2rem;">
          <input
            v-model="form.password"
            class="sh-form__content__input"
            type="text"
            :placeholder="'Enter Password'"
            :class="{
              'sh-form__content__input--error': validationError.password,
            }"
          />
          <div
            @click="
              form.change_password = !form.change_password;
              form = { ...form };
            "
            class="user-form__change-password"
          >
            <div
              class="user-form__change-password__checkbox"
              :class="{
                'user-form__change-password__checkbox--selected':
                  form.change_password,
              }"
            >
              <i v-if="form.change_password" class="fa fa-check" aria-hidden="true"></i>
            </div>
            <div class="user-form__change-password__text">Change password on first login.</div>
          </div>
        </div>
      </template>
      <div
        class="mt-10 is-medium-16-500-50 has-text-centered has-text-danger"
        v-if="errors"
      >Something went wrong</div>
      <div v-if="awaitingResponse" class="sh-form__content__button">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else-if="details" @click="edit" class="sh-form__content__button">Update User</div>
      <div v-else @click="form.change_password?create():activate()" class="sh-form__content__button">Create User</div>
      <div v-if="show_activate && !form.change_password">
        <section class="activate-content">
          <label class="is-flex">
            <input v-model="send_verification_email" type="checkbox" class="sh-custom-checkbox" />
            <span class="is-regular-14-00-22 ml-10">Send user verification email</span>
          </label>
        </section>

        <footer class="is-flex is-center is-vcenter">
          <div @click="create" class="staged-btn is-semiBold-14-600-17 is-pointer">Leave as staged</div>
          <div
            @click="activateImmediately"
            class="activate-btn is-semiBold-14-600-17 is-pointer"
          >Activate Immediately</div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import {
  internalRoleService,
  organizationService,
  userService
} from "@/desktop/shared/services/";
import SelectInput from "@/desktop/shared/components/form/components/select-input";
import { VueTelInput } from "vue-tel-input";

export default {
  components: {
    SelectInput,
    VueTelInput
  },
  props: ["details", "on_complete", "info"],
  data() {
    return {
      form: {},
      passwordSetBy: "user",
      internalRoles: null,
      organizations: null,
      radio: null,
      awaitingResponse: false,
      validationError: {},
      show_activate: false,
      hasErrorActive: false,
      create_result: null,
      send_verification_email: false,
      sam: false,
      email_error: ""
    };
  },

  created() {
    if (this.details) {
      this.getUser();
    } else {
      this.form.user_type = "internal";
      this.get_internal_roles();
      this.get_organizations();
    }
  },
  methods: {
    async getUser() {
      let { first_name, last_name } = await userService
        .get({ id: this.details.uid, query: "no_org" })
        .catch(err => this.handleErrors(err));
      this.form.first_name = first_name;
      this.form.last_name = last_name;
      this.form = { ...this.form };
    },
    get_internal_roles() {
      internalRoleService
        .getAll({})
        .then(res => (this.internalRoles = res.results))
        .catch(err => this.handleErrors(err));
    },
    get_organizations() {
      organizationService
        .getAll({})
        .then(res => (this.organizations = res.results))
        .catch(err => this.handleErrors(err));
    },
    internalRoleChange(role) {
      this.form.role = role.name;
      this.form = {...this.form}
    },
    organizationChange(organization) {
      this.form.organization = {
        uid: organization.uid,
        name: organization.name
      };
    },
    activate() {
      if (this.validate_form()) {
        this.show_activate = true;
      }
    },

    async create() {
      this.show_activate = false;
      if (this.validate_form()) {
        this.awaitingResponse = true;
        if (this.passwordSetBy === "user") delete this.form.change_password;
        if (this.form.user_type === "internal") delete this.form.organization;
        else {
          delete this.form.role;
          this.form.user_type = "power";
          if (this.radio === "manager") this.form.is_manager = true;
          else if (this.radio === "owner") this.form.is_owner = true;
        }
        this.form.username = this.form.email;
        if (this.validate_password()) {
          this.create_result = await userService
            .post({ body: this.form })
            .catch(err => this.handleErrors(err));
          if (this.create_result && !this.sam) {
            this.show_success("User created successfully.");
            this.$emit("close");
          }
        }
        this.awaitingResponse = false;
        this.$eventHub.$emit("refresh-user-list");
      }
    },
    activateImmediately() {
      this.show_activate = false;
      this.sam = true;
      this.create().then(() => {
        let requestObj = {
          id: this.create_result.uid,
          attribute: "lifecycle/activate",
          query: `sendEmail=${this.send_verification_email}`
        };
        let result = userService
          .put(requestObj)
          .catch(err => this.handleErrors(err));
        if (result) {
          this.show_success("Created and Activated User successfully.");
          this.$emit("close");
        }
        this.$eventHub.$emit("refresh-user-list");
      });
      this.$eventHub.$emit("refresh-user-list");
    },
    async edit() {
      this.awaitingResponse = true;
      if (this.validate_password()) {
        let result = await userService
          .patch({ id: this.details.uid, body: this.form })
          .catch(err => this.handleErrors(err));
        if (result) {
          this.show_success("User updated successfully.");
          this.$emit("close");
        }
      }
      this.awaitingResponse = false;
      this.$eventHub.$emit("refresh-user-list");
    },
    validate_password() {
      if (this.passwordSetBy === "admin") {
        if (!this.form.password) {
          this.show_danger("Password cannot be empty!");
          return false;
        } else if (this.form.password.length < 8) {
          this.show_danger("Password must be at least 8 chararacters long!");
          return false;
        }
        if (this.form.password.search(/[a-z]/) < 0) {
          this.show_danger("Password must contain one lowercase letter!");
          return false;
        }
        if (this.form.password.search(/[A-Z]/) < 0) {
          this.show_danger("Password must contain one uppercase letter!");
          return false;
        }
        if (this.form.password.search(/[0-9]/) < 0) {
          {
            this.show_danger("Password must contain one numeric character!");
            return false;
          }
          if (
            (this.form.email &&
              this.form.password
                .toLowerCase()
                .includes(
                  ((this.form.email || "").split("@")[1] || "")
                    .split(".")[0]
                    .toLowerCase()
                )) ||
            this.form.password
              .toLowerCase()
              .includes(
                ((this.form.email || "").split("@")[0] || "").toLowerCase()
              )
          ) {
            this.show_danger("Password must not contain the username!");
            return false;
          }
        }
        return true;
      }
      return true;
    },
    validate_form() {
      this.validationError = {};
      let returnVal = true;
      if (!this.form.first_name) {
        this.validationError.first_name = true;
        returnVal = false;
      }
      if (!this.form.last_name) {
        this.validationError.last_name = true;
        returnVal = false;
      }
      if (!this.form.email) {
        this.email_error = "Please enter the email"
        this.validationError.email = true;
        returnVal = false;            
      }
      else if (this.form.email && !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.form.email))){
        this.email_error = "Invalid Email"
        this.validationError.email = true;
        returnVal = false;
      }
      if (this.form.user_type === "internal" && !this.form.role) {
        this.validationError.role = true;
        returnVal = false;
      }
      // if (!this.form.organization) {
      //   this.validationError.organization = true;
      //   returnVal = false;
      // }
      // if (!this.form.password) {
      //   this.validationError.password = true;
      //   returnVal = false;
      // }
      this.validationError = { ...this.validationError };
      return returnVal;
    },
  }
};
</script>

<style lang="scss">
.user-form {
  &__name {
    display: flex;
    width: 100%;
  }
  &__type {
    align-self: flex-start;
    margin-top: 4rem;
    &__heading {
      color: #3d4365;
      font-size: 1.4rem;
    }
    &__options {
      display: flex;
      border: 1px solid #d0d2da;
      margin-top: 1rem;
      border-radius: 6px;
      padding: 0.5rem;

      &__each {
        color: #a8abbb;
        font-size: 1.8rem;
        // font-weight: 500;
        border-radius: 6px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        &--selected {
          background-color: $blue-grey;
          color: #ffffff;
        }
      }
    }
  }

  &__organization-user {
    color: #a8abbb;
    font-size: 1.8rem;
    font-weight: 500;
    &--selected {
      color: #32385c;
    }
  }

  &__change-password {
    display: flex;
    align-items: center;
    margin-top: 2rem;
    cursor: pointer;

    &__checkbox {
      width: 2rem;
      height: 2rem;
      margin-right: 2rem;
      border-radius: 2px;
      border: solid 1.5px rgba(23, 30, 72, 0.4);
      &--selected {
        color: $primary;
        border-color: $primary;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-size: 1rem;
      }
    }
    &__text {
      color: #5b607e;
      font-size: 1.6rem;
      font-weight: 500;
    }
  }
}
.activate-content {
  background-color: #fafcff;
  padding: 2rem;
}
.activate-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
  padding: 0 2rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  background-color: $primary;
  color: #fff;
}
.staged-btn {
  margin-right: 2rem;
  color: #171e48;
  opacity: 0.6;
}


.vue-tel-input {
  border: none !important;
  border-bottom: 1px solid #d0d2da !important;

  &:focus-within {
    box-shadow: 0 0px 0px rgba(0, 0, 0, 0.075) !important;
  }
  &:focus {
    box-shadow: 0 0px 0px rgba(0, 0, 0, 0.075) !important;
  }
}

.error-number {
  border-bottom: 1px solid rgba(255, 87, 34, 0.5) !important;
}
.valid-number {
  border-bottom: 1px solid #d0d2da !important;
}
.error-message {
  margin-top: 0.5rem;
  color: $error;
}
.name-error{
  width: 100%;
  display: flex;
  margin-top: 0.5rem;
  &__item {
    width: 50%;
  }
}
</style>

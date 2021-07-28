<template>
  <div class="margin-20">
    <div class="is-flex is-center">
      <b-upload v-model="profileImage" v-on:input="upload_image" accept="image/*" class="is-relative">
        <img class="image is-80x80 is-rounded" v-if="claims && claims.user_dp" :src="claims.user_dp" />
        <sh-icon :name="'user-placeholder'" class="image is-80x80" v-else></sh-icon>
        <m-icon :name="'camera'" class="is-32x32 camera" :file="'core-sprite'"></m-icon>
      </b-upload>
    </div>
    <div class="is-flex has-space-between mb-20 mt-30">
      <div class="">
        <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">First Name</div>
        <input type="text" v-model="firstName" class=" mobile-settings-input is-medium-16-500-19 has-text-theme-black " />
      </div>
      <div class="">
        <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">Last Name</div>
        <input type="text" v-model="lastName" class=" mobile-settings-input is-medium-16-500-19 has-text-theme-black  " />
      </div>
    </div>
    <div class="mb-20 is-disabled">
      <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">Email Address</div>
      <input type="text" v-model="emailAddress" class=" mobile-settings-input is-medium-16-500-19 has-text-theme-black " />
    </div>
    <div class="mb-20">
      <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7 mb-20">Phone Number</div>
      <vue-tel-input @input="onInput" class="sh-form__phone" v-model="phoneNumber" v-bind="bindProps"></vue-tel-input>
    </div>
    <div v-if="awaitingResponse" class="__update">
      <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
    </div>
    <div v-else @click="update_profile" class="sh-button mt-30">
      <span class="is-medium-14-500-17">
        Update Profile
      </span>
    </div>
  </div>
</template>
<script>
  import { VueTelInput } from "vue-tel-input";
  import { mapState } from "vuex";
  import axios from "axios";
  import { userService } from "@/desktop/shared/services/";
  import AuthMixin from "@/auth/shared/auth.mixin";

  export default {
    mixins: [AuthMixin],

    data() {
      return {
        firstName: null,
        lastName: null,
        emailAddress: null,
        phoneNumber: null,
        awaitingResponse: false,
        profileImage: null,
        bindProps: {
          mode: "international",
          defaultCountry: "",
          disabledFetchingCountry: false,
          disabled: false,
          disabledFormatting: false,
          placeholder: "Enter a phone number",
          required: false,
          enabledCountryCode: false,
          enabledFlags: true,
          preferredCountries: [],
          onlyCountries: [],
          ignoredCountries: [],
          autocomplete: "off",
          name: "telephone",
          maxLen: 25,
          wrapperClasses: "",
          inputClasses: "",
          dropdownOptions: {
            disabledDialCode: false,
          },
        },
      };
    },
    created() {
      this.set_user_details();
    },
    components: {
      VueTelInput,
    },
    computed: {
      ...mapState(["claims"]),
    },
    methods: {
      set_user_details() {
        this.firstName = this.claims.firstname;
        this.lastName = this.claims.lastname;
        this.emailAddress = this.claims.email;
        this.phoneNumber = this.claims.phone_number;
      },
      update_profile() {
        let regex = /<.+?>/g;
        if (!this.firstName || this.firstName.match(regex)) {
          return this.$toast.show("Please enter valid first name", "", this.$store.state.izitoast_options.appWarning);
        } else if (!this.lastName || this.lastName.match(regex)) {
          return this.$toast.show("Please enter valid last name", "", this.$store.state.izitoast_options.appWarning);
        } else {
          this.awaitingResponse = true;

          userService
            .patch({
              id: this.claims.user_id,
              body: {
                first_name: this.firstName,
                last_name: this.lastName,
                email: this.emailAddress,
                phone_number: this.phoneNumber,
              },
            })
            .then((res) => {
              this.$toast.show("Profile updated.", "", this.$store.state.izitoast_options.appSuccess);
              this.awaitingResponse = false;
              this.set_claims();
            })
            .catch((err) => {
              this.$toast.show("Could not update.", "", this.$store.state.izitoast_options.appError);
              this.awaitingResponse = false;
            });
        }
      },
      async upload_image() {
        if (!this.profileImage) return;
        try {
          let results = await userService.generate_display_picture_url({
            body: { filename: this.profileImage.name },
          });
          axios.defaults.headers.common = {};
          axios.defaults.headers.put = {};
          axios
            .put(results.data.url, this.profileImage)
            .then((res) => {
              userService
                .upload_display_picture({
                  body: results.data,
                })
                .then((res) => {
                  this.set_claims();
                });
            })
            .catch((err) => {
              this.$toast.show(err, "", this.$store.state.izitoast_options.appError);
            });
        } catch (err) {
          console.log(err);
          return;
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  .user-profile__profile-container {
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 2px 4px 0 $blue-tint-shadow;
    background-color: $white;
    display: flex;

    &__right {
      display: flex;
      flex-direction: column;
      width: 100%;

      &__top {
        width: 100%;
        margin-bottom: 3rem;

        &__organization-container {
          width: 100%;
          border-radius: 10px;
          box-shadow: 0 2px 4px 0 $blue-tint-shadow;
          border: solid 1px $blue-tint-border;
          background-color: $white;
          display: flex;
          flex-direction: column;

          &__top {
            padding: 1.4rem 2rem 1.5rem 3rem;
            border-bottom: solid 2px $ghost-white-border;
            display: flex;
            justify-content: space-between;

            &__left {
              display: flex;
              align-items: center;

              &__icon {
                width: 2.4rem;
                height: 2.4rem;
                border-radius: 50%;
                background-color: $primary;
                display: flex;
                justify-content: center;
                align-content: center;
                font-size: 1.5rem;
                font-family: "Barlow-SemiBold";
                font-weight: 600;
                color: $hover-white-text;
                margin-right: 0.7rem;
                user-select: none;
              }
            }
            &__right {
              &__icon {
                color: $blue-grey;
                cursor: pointer;
              }
            }
          }

          &__bottom {
            padding: 1.7rem 3rem 2.7rem 3rem;
          }
        }
      }
    }
  }

  .is-80x80 {
    height: 8rem;
    width: 8rem;
  }

  .camera {
    position: absolute;
    z-index: 10000;
    bottom: 0;
    right: 0;
  }
</style>

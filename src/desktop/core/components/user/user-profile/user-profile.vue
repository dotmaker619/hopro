<template>
  <div v-if="claims" class="user-profile">
    <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 pb-20">Profile</div>
    <div class="is-medium-16-500-19 has-text-theme-black pt-10 pb-10">My Profile</div>
    <div class="user-profile__profile-container">
      <div class="user-profile__profile-container__left">
        <div class="user-profile__profile-container__left__left">
          <b-upload v-model="profileImage" v-on:input="upload_image" accept="image/*">
            <div class="user-profile__profile-container__left__left__picture">
              <div class="user-profile__profile-container__left__left__picture__overlay">
                <b-icon pack="fa" icon="camera" size="is-large"></b-icon>
              </div>
              <img class="user-profile__profile-container__left__left__picture__image" v-if="claims.user_dp" :src="claims.user_dp" />
              <sh-icon v-else :name="'user-placeholder'" class="user-profile__profile-container__left__left__picture__image"></sh-icon>
            </div>
          </b-upload>

          <div class="is-medium-18-500-22 has-text-theme-black">{{ claims.firstname + " " + claims.lastname }}</div>
        </div>
        <div class="user-profile__profile-container__left__right">
          <div class="user-profile__profile-container__left__right__top">
            <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mb-7">Organization</div>
            <div class="user-profile__profile-container__left__right__top__organization-container">
              <div v-if="organizations.length" class="user-profile__profile-container__left__right__top__organization-container__top">
                <div class="user-profile__profile-container__left__right__top__organization-container__top__left">
                  <div class="user-profile__profile-container__left__right__top__organization-container__top__left__icon">
                    {{ organizations[organizationIndex].name.charAt(0) }}
                  </div>
                  <div class="is-medium-14-500-17 has-text-theme-black">{{ organizations[organizationIndex].name }}</div>
                </div>
                <div class="user-profile__profile-container__left__right__top__organization-container__top__right">
                  <i
                    @click="previous_organization"
                    class="fas fa-chevron-left mr-20 user-profile__profile-container__left__right__top__organization-container__top__right__icon"
                  />
                  <i
                    @click="next_organization"
                    class="fas fa-chevron-right user-profile__profile-container__left__right__top__organization-container__top__right__icon"
                  />
                </div>
              </div>
              <div class="user-profile__profile-container__left__right__top__organization-container__bottom">
                <div class="is-medium-12-500-14 has-text-light-grey">Role</div>
                <div class="is-medium-14-500-17 has-text-theme-black mb-18 is-capitalized">{{ organizations[organizationIndex].role }}</div>
                <div class="is-medium-12-500-14 has-text-light-grey mb-8">Teams</div>
                <primary-tag :tags="organizations[organizationIndex].teams" :type="'team'" />
              </div>
            </div>
          </div>
          <div class="user-profile__profile-container__left__right__bottom">
            <div class="user-profile__profile-container__left__right__bottom__api-heading mb-7">
              <div class="is-medium-14-500-17 has-text-theme-black has-opacity-7 mr-5">API Key</div>
              <img @click="refresh_key" src="@/assets/icons/profile/refresh.svg" class="is-pointer" />
            </div>
            <div class="user-profile__profile-container__left__right__bottom__api-container">
              <div v-if="apiKey" class="is-medium-18-500-22 has-text-theme-black">{{ apiKey }}</div>
              <input
                v-else
                type="password"
                v-model="password"
                placeholder="Type password and press enter"
                class="user-profile__profile-container__left__right__bottom__api-container__input is-medium-16-500-19 has-text-theme-black"
                @keyup.enter="get_token"
                :disabled="awaitingToken"
              />
              <i v-if="awaitingToken" class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: $primary" />
              <img @click="copy_token" v-else-if="apiKey" src="@/assets/icons/profile/duplicate.svg" class="is-pointer" />
            </div>
            <div v-if="apiPasswordError" style="color: red">Incorrect Password!</div>
          </div>
        </div>
      </div>
      <div class="user-profile__profile-container__right">
        <div class="user-profile__profile-container__right__name">
          <div class="user-profile__profile-container__right__name__first mr-15">
            <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">First Name</div>
            <input
              type="text"
              v-model="firstName"
              class="user-profile__profile-container__right__input is-medium-16-500-19 has-text-theme-black mt-17 mb-11"
            />
          </div>
          <div class="user-profile__profile-container__right__name__last ml-15">
            <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">Last Name</div>
            <input
              type="text"
              v-model="lastName"
              class="user-profile__profile-container__right__input is-medium-16-500-19 has-text-theme-black mt-17 mb-11"
            />
          </div>
        </div>
        <div class="user-profile__profile-container__right__email">
          <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">Email Address</div>
          <input
            type="text"
            v-model="emailAddress"
            disabled
            class="user-profile__profile-container__right__input is-medium-16-500-19 has-text-theme-black mt-21 mb-14"
          />
        </div>
        <div class="user-profile__profile-container__right__phone">
          <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7 mb-20">Phone Number</div>
          <vue-tel-input @input="onInput" class="sh-form__phone" v-model="phoneNumber" v-bind="telNumber"></vue-tel-input>
        </div>
        <div v-if="awaitingResponse" class="user-profile__profile-container__right__update">
          <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
        </div>
        <div v-else @click="update_profile" class="user-profile__profile-container__right__update">Update Profile</div>
      </div>
    </div>
    <div class="user-profile__password-and-history mt-30 mb-40">
      <div class="user-profile__password-and-history__password mr-20">
        <div class="is-medium-16-500-19 has-text-theme-black pt-10 pb-10">Change Password</div>
        <div class="user-profile__password-and-history__password-container">
          <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">Current Password</div>
          <input
            v-model="currentPassword"
            type="password"
            class="user-profile__password-and-history__password-container__input is-medium-16-500-19 has-text-theme-black"
            placeholder="Current Password"
          />
          <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">New Password</div>
          <input
            v-model="newPassword"
            type="text"
            class="user-profile__password-and-history__password-container__input is-medium-16-500-19 has-text-theme-black"
            placeholder="New Password"
          />
          <div class="is-medium-12-500-14 has-text-theme-black has-opacity-7">Confirm New Password</div>
          <input
            v-model="rePassword"
            type="password"
            class="user-profile__password-and-history__password-container__input is-medium-16-500-19 has-text-theme-black"
            placeholder="Confirm New Password"
          />
          <div @click="update_password" class="user-profile__password-and-history__password-container__update">Update Password</div>
        </div>
      </div>
      <div class="user-profile__password-and-history__history">
        <div class="user-profile__password-and-history__history__heading">
          <div class="is-medium-16-500-19 has-text-theme-black pt-10 pb-10">My Login History</div>
          <div @click="logout_all_sessions" class="is-semiBold-14-600-17 has-text-blue pb-10 pt-10 is-pointer">Log of other sessions</div>
        </div>
        <!-- showLogoutModal = true -->
        <div class="user-profile__password-and-history__history-container has-slimscroll has-slimscroll--blue-gray">
          <div v-for="(ua, i) in uaInfoList" :key="i" class="user-profile__password-and-history__history-container__item">
            <div class="user-profile__password-and-history__history-container__item__left">
              <img v-if="ua.os.name" :src="require(`@/assets/icons/profile/${ua.os.name.split(' ')[0].toLowerCase()}.svg`)" class="mr-20" />
              <div>
                <div class="is-medium-16-500-19">
                  {{ ua.os.name }}
                  <span class="ml-10 mr-10">·</span>
                  {{ ua.location }}
                </div>
                <div class="mt-5">
                  <span class="is-regular-14-500-17">
                    {{ ua.browser.name }}
                    <span class="ml-10 mr-10">·</span>
                    <span v-if="ua.thisDevice" class="is-semiBold-14-600-17 has-text-green">This Device</span>
                    <span v-else-if="ua.activeNow" class="is-semiBold-14-600-17 has-text-green">Active Now</span>

                    <span v-else>{{ ua.last_active.replace(/\s/g, "T") | prettyDate }}</span>
                  </span>
                </div>
              </div>
            </div>
            <img
              @click="logout_session(ua.jti)"
              src="@/assets/icons/profile/logout.svg"
              class="user-profile__password-and-history__history-container__item__right is-pointer"
              :class="{ 'user-profile__password-and-history__history-container__item__right__hide': ua.thisDevice }"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- <logout-modal
      v-if="showLogoutModal"
      @closed="showLogoutModal=false"
      @refetch-login-history="get_login_history()"
    />-->
  </div>
</template>

<script>
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import { VueTelInput } from "vue-tel-input";
  import { mapState } from "vuex";
  import axios from "axios";
  import { authService, userService } from "@/desktop/shared/services/";
  import UAParser from "ua-parser-js";
  import jwt_decode from "jwt-decode";
  // import LogoutModal from "./components/logout-modal";

  export default {
    components: {
      PrimaryTag,
      VueTelInput,
      // LogoutModal
    },
    data() {
      return {
        firstName: null,
        lastName: null,
        emailAddress: null,
        phoneNumber: null,
        profileImage: null,
        organizationIndex: 0,
        apiKey: null,
        password: null,
        apiPasswordError: false,
        currentPassword: null,
        newPassword: null,
        rePassword: null,
        uaInfoList: [],
        awaitingToken: false,
        awaitingRefreshToken: false,
        phone: {
          number: "",
          valid: false,
          country: undefined,
        },
        awaitingResponse: false,
        telNumber: {
          mode: "international",
          defaultCountry: "IN",
          disabledFetchingCountry: false,
          disabled: false,
          placeholder: "Mobile Number",
          enabledFlags: true,
          autocomplete: "off",
          dropdownOptions: {
            disabledDialCode: false,
          },
          inputOptions: {
            showDialCode: false,
          },
        },
        // showLogoutModal: false
      };
    },
    computed: {
      ...mapState(["claims"]),
      organizations() {
        let orgList = [];
        if (this.claims.user_organization)
          orgList.push({
            name: this.claims.user_organization.name,
            role: this.claims.is_owner ? "Owner" : this.claims.is_manager ? "Manager" : "User",
            teams: this.claims.labels,
          });
        else
          orgList.push({
            name: "Internal",
            role: this.claims.user_role.name,
            teams: this.claims.labels,
          });
        this.claims.guest_organizations.forEach((g) => {
          orgList.push({ name: g.name, role: "Guest", labedls: g.labels });
        });
        return orgList;
      },
    },
    created() {
      this.get_login_history();
      userService.get_single_user_details({ id: this.claims.user_id }).then((res) => {
        this.firstName = res.first_name;
        this.lastName = res.last_name;
        this.emailAddress = res.email;
        this.phoneNumber = res.phone_number;
      });
    },
    methods: {
      async get_login_history() {
        let parser = new UAParser();
        let decodedJwt = jwt_decode(window.$cookies.get("access_token"));
        let userChannelMembers = [];
        this.uaInfoList = [];
        this.$store.state.user_channel.members.each((m) => userChannelMembers.push(m.id));
        userService.get_ua_info({ id: this.claims.user_id }).then((res) => {
          res.forEach(async (u) => {
            let loggedInfo = { thisDevice: false, activeNow: false };
            if (u.jti === decodedJwt.jti) loggedInfo.thisDevice = true;
            if (userChannelMembers.includes(u.jti)) loggedInfo.activeNow = true;
            parser.setUA(u.ua);
            this.uaInfoList.push({
              ...u,
              ...parser.getResult(),
              ...(await this.lookup_ip(u.ip_address)),
              ...loggedInfo,
            });
          });
        });
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
      next_organization() {
        if (this.organizations.length - 1 > this.organizationIndex) this.organizationIndex++;
      },
      previous_organization() {
        if (this.organizationIndex > 0) this.organizationIndex--;
      },
      async get_token() {
        this.awaitingToken = true;
        this.apiPasswordError = false;
        let result = await authService
          .get_token({
            body: { username: this.claims.username, password: this.password },
          })
          .catch((err) => {
            this.apiPasswordError = true;
            console.log(err);
          });
        if (result) this.apiKey = result.Authorization;
        this.password = null;
        this.awaitingToken = false;
      },
      copy_token() {
        this.$copyText(this.apiKey)
          .then((res) => {
            this.$toast.show("Copied to clipboard.", "", this.$store.state.izitoast_options.appSuccess);
          })
          .catch((err) => {
            this.$toast.show("Could not copy", "", this.$store.state.izitoast_options.appError);
          });
      },
      update_profile() {
        let regex = /<.+?>/g;
        if (!this.firstName || this.firstName.match(regex)) {
          return this.$toast.show("Please enter valid first name", "", this.$store.state.izitoast_options.appWarning);
        } else if (!this.lastName || this.lastName.match(regex)) {
          return this.$toast.show("Please enter valid last name", "", this.$store.state.izitoast_options.appWarning);
        } else {
          this.awaitingResponse = true;
          let tel_number = null;
          if (this.phone.number) {
            tel_number = this.phone.number;
          } else {
            tel_number = this.phoneNumber;
          }
          userService
            .patch({
              id: this.claims.user_id,
              body: {
                first_name: this.firstName.replace(/<[^>]*>/g, ""),
                last_name: this.lastName.replace(/<[^>]*>/g, ""),
                email: this.emailAddress,
                phone_number: tel_number,
              },
            })
            .then((res) => {
              this.$toast.show("Profile updated.", "", this.$store.state.izitoast_options.appSuccess);
              this.awaitingResponse = false;
            })
            .catch((err) => {
              this.$toast.show("Could not update.", "", this.$store.state.izitoast_options.appError);
              this.awaitingResponse = false;
            });
        }
      },
      update_password() {
        if (this.newPassword === this.rePassword && this.newPassword) {
          userService
            .change_password({
              id: this.claims.user_id,
              body: {
                strict: false,
                new_password: this.newPassword,
                old_password: this.currentPassword,
              },
            })
            .then((res) => {
              this.$toast.show("Password updated", "", this.$store.state.izitoast_options.appSuccess);
            })
            .catch((err) => {
              this.$toast.show("Password change unsuccessful", "", this.$store.state.izitoast_options.appError);
            });
        } else this.$toast.show("Passwords do not match!", "", this.$store.state.izitoast_options.appError);
      },
      logout_all_sessions() {
        userService
          .logout_all_devices({
            id: this.claims.user_id,
            query: "exclude_current_session=true",
          })
          .then(async () => {
            this.get_login_history();
          })
          .catch((err) => {
            this.$toast.show("Logout unsuccessful", "", this.$store.state.izitoast_options.appError);
          });
      },
      logout_session(jti) {
        userService
          .logout_device({
            id: this.claims.okta_id,
            body: {
              jti_key: jti,
            },
          })
          .then((res) => {
            this.$toast.show("Session logged out.", "", this.$store.state.izitoast_options.appSuccess);
          })
          .catch((err) => {
            this.$toast.show("Logout unsuccessful", "", this.$store.state.izitoast_options.appError);
          });
      },
      async lookup_ip(ip) {
        let result = await axios.get(`https://ipapi.co/${ip}/json/`).catch((err) => console.log(err));
        return {
          location: (result.data && result.data.city) + ", " + (result.data && result.data.country_name),
        };
      },
      async refresh_key() {
        this.awaitingRefreshToken = true;
        let result = await userService
          .refresh_user_token({ id: this.$route.params.id })
          .then(() => {
            this.apiKey = null;
            this.$toast.show("API key refreshed!", "", this.$store.state.izitoast_options.appSuccess);
          })
          .catch((err) => console.log(err));
        this.awaitingRefreshToken = false;
      },
      onInput(formattedNumber, { number, valid, country }) {
        // this.phone.number = number.international;
        this.phone.number = number.e164;
        this.phone.valid = valid;
        this.phone.country = country && country.name;
      },
    },
  };
</script>

<style lang="scss">
  .user-profile {
    padding: 0 2.2rem;

    &__profile-container {
      width: 100%;
      border-radius: 10px;
      box-shadow: 0 2px 4px 0 $blue-tint-shadow;
      background-color: $white;
      display: flex;

      &__left {
        width: 60%;
        border-right: solid 2px $ghost-white-border;
        padding: 2.3rem 5rem 3.9rem 2.5rem;
        display: flex;

        &__left {
          margin-right: 5.5rem;

          &__picture {
            margin: 0.7rem 0.5rem 1rem 0.5rem;
            border-radius: 50%;
            width: 10rem;
            height: 10rem;
            position: relative;

            &__overlay {
              display: flex;
              justify-content: center;
              align-items: center;
              position: absolute;
              top: 0;
              left: 0;
              height: 10rem;
              width: 10rem;
              margin: 0;
              border-radius: 50%;
              opacity: 0;
              transition: opacity 0.4s;
              background: rgba(255, 255, 255, 0.6);
            }
            &:hover &__overlay {
              opacity: 1;
              cursor: pointer;
              z-index: 1;
            }

            &__image {
              height: 100%;
              width: 100%;
              object-fit: cover;
              border-radius: 50%;
            }
          }
        }

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

          &__bottom {
            width: 100%;

            &__api-heading {
              display: flex;
              align-items: center;
            }

            &__api-container {
              width: 100%;
              padding: 1.4rem 2rem 1.4rem 1.3rem;
              border-radius: 6px;
              border: dashed 1px rgba(23, 30, 72, 0.5);
              background-color: $pale-white-background;
              display: flex;
              justify-content: space-between;
              align-content: center;

              &__input {
                border: none;
                width: 100%;
                background-color: $pale-white-background;

                &::placeholder {
                  color: rgba(23, 30, 72, 0.4);
                }
              }
            }
          }
        }
      }

      &__right {
        width: 40%;
        padding: 3.6rem 3rem 3rem 3rem;

        &__input {
          border: none;
          width: 100%;

          &:disabled {
            background-color: $white;
          }
        }

        &__name {
          display: flex;
          width: 100%;
          margin-bottom: 2.3rem;

          &__first,
          &__last {
            width: 50%;
            border-bottom: solid 2px $ghost-white-border;
          }
        }

        &__email {
          width: 100%;
          margin-bottom: 2.1rem;
          border-bottom: solid 2px $ghost-white-border;
        }

        &__update {
          width: 16.1rem;
          height: 5rem;
          margin-top: 3.1rem;
          border-radius: 6px;
          background-color: $primary;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: "Barlow-SemiBold";
          font-size: 1.6rem;
          font-weight: 600;
          color: $white;
          cursor: pointer;
        }
      }
    }

    &__password-and-history {
      display: flex;
      width: 100%;

      &__password {
        width: 100%;
      }

      &__history {
        width: 100%;

        &__heading {
          display: flex;
          justify-content: space-between;
          align-content: center;
        }
      }

      &__password-container {
        width: 100%;
        border-radius: 10px;
        box-shadow: 0 2px 4px 0 $blue-tint-shadow;
        background-color: $white;
        padding: 3.6rem 4.6rem 3rem 4.6rem;

        &__input {
          border: none;
          width: 50%;
          border-bottom: solid 2px $ghost-white-border;
          padding-bottom: 1.1rem;
          margin-top: 1.7rem;
          margin-bottom: 3rem;

          &::placeholder {
            color: rgba(23, 30, 72, 0.4);
          }
        }

        &__update {
          width: 18.2rem;
          height: 5rem;
          margin-top: 0.1rem;
          border-radius: 6px;
          background-color: $primary;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: "Barlow-SemiBold";
          font-size: 1.6rem;
          font-weight: 600;
          color: $white;
          cursor: pointer;
        }
      }

      &__history-container {
        width: 100%;
        border-radius: 10px;
        box-shadow: 0 2px 4px 0 $blue-tint-shadow;
        background-color: $white;
        padding-top: 1rem;
        height: 40rem;
        overflow-y: auto;

        &__item {
          padding: 1.4rem 3rem 2rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;

          &:not(:last-child) {
            border-bottom: solid 2px $ghost-white-border;
          }

          &__left {
            display: flex;
            align-items: center;
          }

          &__right {
            visibility: hidden;

            &__hide {
              display: none;
            }
          }

          &:hover &__right {
            visibility: visible;
          }
        }
      }
    }

    .sh-tel-input {
      border: none;

      &:focus-within {
        box-shadow: none;
        border: none;
      }

      &__input {
        padding-bottom: 0.8rem;
        border-bottom: solid 2px $ghost-white-border;
      }
    }

    .vti__dropdown {
      display: flex;
      flex-direction: column;
      align-content: center;
      justify-content: center;
      position: relative;
      padding: 0.7rem;
      cursor: pointer;
      padding-bottom: 1.3rem;
      border-bottom: solid 2px $ghost-white-border;
      margin-right: 4rem;

      &:focus {
        outline: none;
      }

      &:hover {
        background-color: inherit;
      }

      .vti__selection {
        line-height: 1.19;

        .vti__country-code {
          font-family: "Barlow-Medium";
          font-size: 1.6rem;
          color: #171e48;
          margin-right: 3.5rem;
        }
      }
    }

    .vti__dropdown.open {
      background-color: inherit;
    }

    .vti__dropdown-list {
      border-radius: 6px;

      &::-webkit-scrollbar {
        width: 0.6rem !important;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 1rem !important;
        background: rgba(0, 0, 0, 0.2) !important;
      }
    }
  }
</style>

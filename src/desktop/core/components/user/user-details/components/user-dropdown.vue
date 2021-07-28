<template>
  <div>
    <div v-if="user.status == 'invited'" @click="resend_invite_email">
      <img v-tooltip="'Resend Invite'" class="user-dropdown__resend" src="@/assets/icons/details/resend-mail.svg" />
    </div>
    <div class="user-dropdown" v-else>
      <img @click="openDropdown = !openDropdown" class="user-dropdown__ellipsis" src="@/assets/icons/details/ellipsis-v.svg" />
      <div v-if="openDropdown" v-click-outside="clicked_outside_dropdown" class="user-dropdown__dropdown">
        <div v-if="!is_guest">
          <div class="user-dropdown__dropdown__heading">Password</div>
          <div
            @click="
              setPassword = true;
              openDropdown = false;
            "
            class="user-dropdown__dropdown__item user-dropdown__dropdown__item--active"
          >
            <img class="mr-10" src="@/assets/icons/details/set-password.svg" />
            <span>Set Password</span>
          </div>
          <div
            @click="
              resetPassword = true;
              openDropdown = false;
            "
            class="user-dropdown__dropdown__item user-dropdown__dropdown__item--active"
          >
            <img class="mr-10" src="@/assets/icons/details/reset-password.svg" />
            <span>Reset Password</span>
          </div>
          <div
            @click="
              expirePassword = true;
              openDropdown = false;
            "
            class="user-dropdown__dropdown__item user-dropdown__dropdown__item--active"
          >
            <img class="mr-10" src="@/assets/icons/details/expire-password.svg" />
            <span>Expire Password</span>
          </div>
        </div>
        <div class="user-dropdown__dropdown__heading">Status</div>
        <div
          v-if="!is_guest"
          @click="promote_to_manager"
          class="user-dropdown__dropdown__item"
          :class="[canPromote ? 'user-dropdown__dropdown__item--active' : 'user-dropdown__dropdown__item--disabled']"
        >
          <img class="mr-10" src="@/assets/icons/details/promote-manager.svg" />
          <span>Promote Manager</span>
        </div>
        <div
          v-if="!is_guest"
          @click="demote_manager"
          class="user-dropdown__dropdown__item"
          :class="[canDemote ? 'user-dropdown__dropdown__item--active' : 'user-dropdown__dropdown__item--disabled']"
        >
          <img class="mr-10" src="@/assets/icons/details/demote-manager.svg" />
          <span>Demote Manager</span>
        </div>

        <div
          @click="activate_user"
          class="user-dropdown__dropdown__item"
          :class="[canActivate ? 'user-dropdown__dropdown__item--active' : 'user-dropdown__dropdown__item--disabled']"
        >
          <img class="mr-10" src="@/assets/icons/details/activate.svg" />
          <span>Activate</span>
        </div>
        <div
          v-if="!is_guest"
          @click="suspend_user"
          class="user-dropdown__dropdown__item"
          :class="[canSuspend ? 'user-dropdown__dropdown__item--active' : 'user-dropdown__dropdown__item--disabled']"
        >
          <img class="mr-10" src="@/assets/icons/details/suspend.svg" />
          <span>Suspend</span>
        </div>
        <div
          @click="deactivate_user"
          class="user-dropdown__dropdown__item"
          :class="[canDeactivate ? 'user-dropdown__dropdown__item--active' : 'user-dropdown__dropdown__item--disabled']"
        >
          <img class="mr-10" src="@/assets/icons/details/deactivate.svg" />
          <span>Deactivate</span>
        </div>
      </div>
      <set-password v-if="setPassword" @closed="setPassword = false" />
      <reset-password v-if="resetPassword" @closed="resetPassword = false" />
      <expire-password v-if="expirePassword" @closed="expirePassword = false" />
      <promote-manager v-if="promoteManager" :user="user" @closed="promoteManager = false" />
      <demote-manager v-if="demoteManager" :user="user" @closed="demoteManager = false" />
      <activate-user v-if="activate" :user="user" :is_guest="is_guest" @closed="activate = false" />
      <suspend-user v-if="suspend" @closed="suspend = false" />
      <deactivate-user v-if="deactivate" :is_guest="is_guest" @closed="deactivate = false" />
    </div>
  </div>
</template>

<script>
  import SetPassword from "./set-password";
  import ResetPassword from "./reset-password";
  import ExpirePassword from "./expire-password";
  import PromoteManager from "./promote-manager";
  import DemoteManager from "./demote-manager";
  import ActivateUser from "./activate-user";
  // import ActivateUser from "@/desktop/shared/components/delete-modal";
  import SuspendUser from "./suspend-user";
  import DeactivateUser from "./deactivate-user";
  import { userService } from "@/desktop/shared/services/";

  export default {
    components: {
      SetPassword,
      ResetPassword,
      ExpirePassword,
      PromoteManager,
      DemoteManager,
      ActivateUser,
      SuspendUser,
      DeactivateUser,
    },
    props: ["user"],
    data() {
      return {
        openDropdown: false,
        setPassword: false,
        resetPassword: false,
        expirePassword: false,
        promoteManager: false,
        demoteManager: false,
        activate: false,
        suspend: false,
        deactivate: false,
      };
    },
    computed: {
      canPromote() {
        return !(this.user.is_owner || this.user.is_manager);
      },
      canDemote() {
        return !this.user.is_owner && this.user.is_manager;
      },
      is_guest() {
        return this.user.is_guest;
      },
      canActivate() {
        return this.is_guest
          ? this.user && this.user.active == false
          : this.user.status === "suspended" || this.user.status === "deprovisioned" || this.user.status === "staged";
      },
      canSuspend() {
        return !(this.user.status === "suspended" || this.user.status === "deprovisioned" || this.user.status === "staged");
      },
      canDeactivate() {
        return this.is_guest ? this.user && this.user.active == true : this.user.status !== "deprovisioned";
      },
    },
    methods: {
      clicked_outside_dropdown() {
        if (this.openDropdown) this.openDropdown = false;
      },
      promote_to_manager() {
        if (this.canPromote) {
          this.promoteManager = true;
          this.openDropdown = false;
        }
      },
      demote_manager() {
        if (this.canDemote) {
          this.demoteManager = true;
          this.openDropdown = false;
        }
      },
      activate_user() {
        if (this.canActivate) {
          this.activate = true;
          this.openDropdown = false;
        }
      },
      suspend_user() {
        if (this.canSuspend) {
          this.suspend = true;
          this.openDropdown = false;
        }
      },
      deactivate_user() {
        if (this.canDeactivate) {
          this.deactivate = true;
          this.openDropdown = false;
        }
      },

      async resend_invite_email() {
        let result = await userService
          .resend_invite({
            id: this.$route.params.id,
          })
          .catch((err) => this.handleErrors(err));

        if (result) {
          this.show_success("Sent email successfully.");
        }
      },
    },
  };
</script>

<style lang="scss">
  .user-dropdown {
    position: relative;
    &__resend {
      height: 2rem;
      width: 2rem;
      opacity: 0.5;
      margin: 1.5rem 0;
      &:hover {
        cursor: pointer;
        opacity: 0.8;
      }
    }

    &__ellipsis {
      cursor: pointer;
      padding: 1rem;
    }

    &__dropdown {
      position: absolute;
      right: -5rem;
      width: 23rem;
      border-radius: 10px;
      box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      border: solid 1px rgba(23, 30, 72, 0.15);
      background-color: #ffffff;
      z-index: 5;
      // font-family: Barlow;

      &__heading {
        padding: 2rem;
        font-size: 1.6rem;
        font-weight: 500;
        color: #8d95aa;
        user-select: none;
      }

      &__item {
        padding: 1.2rem 1.8rem;
        display: flex;
        align-content: center;
        color: #454a6b;
        font-size: 1.4rem;
        font-weight: 500;

        &--active {
          cursor: pointer;
          &:hover {
            color: #171e48;
            background-color: rgba(92, 126, 247, 0.1);
          }
        }

        &--disabled {
          cursor: not-allowed;
          color: #8d95aa;
        }
      }
    }
  }
</style>

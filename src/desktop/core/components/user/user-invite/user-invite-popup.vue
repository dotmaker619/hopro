<template>
  <div class="invite-container">
    <div class="invite-container__header">
      <div class="invite-container__header__title">
        Invite Users
        <i
          @click="$emit('close')"
          class="fa fa-times is-pulled-right mt-5 is-pointer"
          aria-hidden="true"
        ></i>
      </div>
    </div>
    <div class="invite-container__content" v-if="!is_selected">
      <div class="invite-container__content__item" v-for="item in items" :key="item.id">
        <div @click="handle_selected(item)" class="is-pointer is-flex align-center">
          <div class>
            <figure class>
              <img class="is-100x100" :src="item.icon" />
            </figure>
          </div>
          <div class="column is-8">
            <div class="card-content is-block">
              <p class="is-pointer invite-container__content__item__name">{{item.name}}</p>
              <p class="invite-container__content__item__description mt-10">{{item.description}}</p>
            </div>
          </div>
          <div class="column is-2 invite-container__content__item__arrow is-pulled-right">
            <div class="ml-5 is-pulled-right">
              <img src="@/assets/icons/right-arrow-active.svg" alt />
            </div>
          </div>
        </div>
        <hr :style="item.id==1?'background-color:#e3e9f3;':''" />
      </div>
    </div>
    <div class="invite-container__content has-slimscroll" v-if="is_selected">
      <div
        class="invite-container__content__header is-semibold-16-600-19"
      >{{is_selected==1?items[0].name:items[1].name}}</div>
      <user-new @close="$emit('close')" @back="is_selected=null" v-if="is_selected==1"></user-new>

      <user-guest-org @close="$emit('close')" @back="is_selected=null" v-if="is_selected==2"></user-guest-org>
    </div>
  </div>
</template>

<script>
import UserNew from "@/desktop/core/components/user/user-invite/components/user-new";
import UserGuestOrg from "@/desktop/core/components/user/user-invite/components/user-guest-org";
export default {
  components: {
    UserNew,
    UserGuestOrg
  },
  data() {
    return {
      is_selected: null,
      items: [
        {
          id: 1,
          icon: require("@/assets/icons/form/users.svg"),
          name: "Invite New Users",
          description:
            "Users will receive an email to signup your organization."
        },
        {
          id: 2,
          icon: require("@/assets/icons/form/guest-user.svg"),
          name: "Invite users from other organizations",
          description:
            "Users from other organizations will be added as a guest in your organization, you can add them to resources / teams as ususal."
        }
      ]
    };
  },
  methods: {
    handle_selected(item) {
      if (item.id == 1) {
        if (this.access("core", "invite_users")) this.is_selected = item.id;
        else this.no_access_popup("core", "invite_users");
      } else {
        if (this.access("core", "add_guest_users")) this.is_selected = item.id;
        else this.no_access_popup("core", "add_guest_users");
      }
    }
  },
  created() {
    this.is_selected = null;
  }
};
</script>

<style lang="scss">
.v--modal {
  border-radius: 10px;
  box-shadow: 0 10px 30px 0 rgba(50, 60, 70, 0.3);
  background-color: #f4f7fc;
}
.invite-container {
  color: #171e48;
  height: 100%;
  border-radius: 10px;
  //
  background-color: #f4f7fc;
  &__header {
    box-shadow: none;
    border: none;
    padding: 2rem 3rem;
    &__title {
      font-family: Barlow-semibold;
      font-size: 20px;
      font-weight: 600;
    }
  }
  &__content {
    padding: 1rem 3rem;
    // min-height: 30rem;
    // overflow: scroll;
    // margin-bottom: 15rem;
    &__item {
      padding: 0 1rem;
      .is-100x100 {
        height: 80px;
        width: 80px;
      }
      &__name {
        font-family: Barlow-semibold;
        font-size: 18px;
        font-weight: 600;
        &:hover,
        &:active {
          color: $primary;
        }
      }

      &__description {
        font-family: Barlow;
        font-size: 16px;
      }
    }
    &__header {
      font-family: Barlow-semibold;
      font-size: 16px;
      font-weight: 600;
      line-height: 2.5;
      border-bottom: 1px solid #323c4644;
    }
  }
  &__footer {
    // position: absolute;
    // bottom: 0rem;
    // padding: 3rem;
    .buttons {
      display: flex;
      justify-content: flex-end;
      padding: 3rem 1rem;
    }
  }
}
</style>
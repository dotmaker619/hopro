<template>
  <modal
    v-if="id"
    :name="`transfer-owner${id}`"
    transition="nice-modal-fade"
    classes="demo-modal-class"
    :min-width="50"
    :min-height="100"
    :adaptive="true"
    :scrollable="true"
    :reset="true"
    width="40%"
    height="auto"
    @closed="$emit('closed')"
  >
    <div class="transfer-modal">
      <div class="transfer-modal__header">
        <h1 class="transfer-modal__header__text">Transfer Ownership</h1>
        <i @click="$modal.hide(`transfer-owner${id}`)" class="fa fa-times transfer-modal__header__close" aria-hidden="true"></i>
      </div>
      <div class="transfer-modal__content" v-if="!selected_user">
        <div class="transfer-modal__content--input">
          <div class="field">
            <p class="control has-icons-left">
              <input class="input custom-input" type="text" placeholder="Search User Name" v-model="search_query" />
              <span class="icon is-left">
                <i class="fas fa-search has-text-dark has-opacity-5 is-size-4"></i>
              </span>
            </p>
          </div>
        </div>
        <div class="transfer-modal__content__users-list has-slimscroll" v-if="user_list">
          <p
            v-for="user in user_list"
            :key="user.uid"
            class="user is-flex is-vcenter is-pointer"
            @click="clicked_user = user"
            :class="{ 'is-highlighted': clicked_user && clicked_user.uid == user.uid }"
          >
            <span class="mr-10"><user-avatar :custom_class="'tiny-user-avatar'" :user="user" :pxsize="24"/></span>
            <span class="is-medium-14-00-17" v-username="user"></span>
          </p>
        </div>
        <div v-else>
          <skeleton-loading>
            <row :gutter="{ top: '10px' }">
              <column :span="24" :gutter="10">
                <square-skeleton
                  :count="5"
                  :boxProperties="{
                    top: '24px',
                    bottom: '24px',
                    width: '100%',
                    height: '35px',
                  }"
                ></square-skeleton>
              </column>
            </row>
          </skeleton-loading>
        </div>
      </div>
      <div v-else>
        <div class="transfer-modal__content is-on-top">
          <div class="transfer-modal__content--image">
            <sh-icon :name="'transfer-fill'" class="is-48x48"></sh-icon>
          </div>
          <div class="transfer-modal__content--image sh-text-semibold-16 has-text-center">
            <info-block
              :info="{
                'name': name,
                'image_class': 'image is-32x32',
                type: 'projectManagement',
              }"
              :icon_size="30"
            ></info-block>
          </div>

          <div class="transfer-modal__content__text sh-text-normal-14 has-text-grey">Are you sure you want to change the owner to</div>

          <div class="transfer-modal__content--image is-flex is-vcenter">
            <span class="mr-10"><user-avatar :user="selected_user" :pxsize="32"/></span>
            <span class="is-medium-16-500-19" v-username="selected_user"></span>
          </div>
          <div class="transfer-modal__footer mt-20">
            <div @click="selected_user = null" class="prompt-modal__footer__button prompt-modal__footer__button__cancel">Cancel</div>
            <div @click="change_ownership" class="prompt-modal__footer__button prompt-modal__footer__button__confirm">Confirm</div>
          </div>
        </div>
      </div>

      <div class="transfer-modal__footer">
        <div @click="selected_user = clicked_user" class="sh-button" :class="{ 'is-disabled': selected_user }">Transfer Ownership</div>
      </div>
    </div>
  </modal>
</template>

<script>
  import { userService } from "@/desktop/shared/services/";
  import InfoBlock from "@/desktop/shared/components/info-block";

  export default {
    data() {
      return {
        data: null,
        search_query: null,
        selected_user: null,
        clicked_user: null,
      };
    },
    components: {
      InfoBlock,
    },
    props: ["name", "service", "id", "group_id"],
    created() {
      this.search_query = "";
      // this.fetch_users();
    },
    computed: {
      user_list() {
        return this.$store.state.users.filter(
          (u) =>
            !u.is_internal &&
            u.active &&
            ((u.first_name && (u.first_name + u.last_name.toLowerCase()).includes(this.search_query.toLowerCase())) ||
              u.email.toLowerCase().includes(this.search_query.toLowerCase()))
        );
      },
    },
    methods: {
      open_popup() {
        this.$modal.show(`transfer-owner${this.id}`);
      },
      async change_ownership() {
        let owner_data = {
          uid: this.selected_user.uid,
        };

        let query = {
          body: { owner: owner_data },
          id: this.id,
        };

        this.group_id ? (query.group_id = this.group_id) : null;

        let result = await this.service.patch(query).catch((err) => this.handleErrors(err));
        this.$emit("update_user", this.selected_user);
        this.selected_user = null;
        this.$modal.hide(`transfer-owner${this.id}`);
        this.$toast.show("Ownership transfered successfully!", "", this.$store.state.izitoast_options.appSuccess);
      },
    },
    watch: {
      $route() {
        this.$modal.hide(`transfer-owner${this.id}`);
      },
    },
  };
</script>

<style lang="scss">
  .transfer-modal {
    border-radius: 10px;
    box-shadow: 0 15px 50px 0 rgba(0, 0, 0, 0.3);
    background-color: #fafcff;

    &__header {
      color: #171e48;
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #eee;
      padding: 2rem;

      &__text {
        // font-family: Barlow;
        font-size: 2rem;
        font-weight: 600;
      }

      &__close {
        font-size: 1.8rem;
        cursor: pointer;
      }
    }

    &__icon {
      padding-top: 3rem;
      display: flex;
      justify-content: center;
    }

    &__content {
      display: flex;
      flex-direction: column;
      padding: 2rem 4rem 0;
      justify-content: center;
      background-color: $primary-background;

      &.is-on-top {
        background: #fff;
        border-radius: 0.5rem;
        border: 1px solid #ddd;
        box-shadow: 0px 0px 10px 6px #ddd;
      }
      .custom-input {
        border: none;
        box-shadow: none;
        background: transparent;
        border-bottom: 2px solid #ddd;
        border-radius: 0;
        &:focus {
          box-shadow: none;
        }
        &:active {
          box-shadow: none;
        }
      }

      &--input {
        margin-bottom: 2rem;
      }
      &__users-list {
        display: flex;
        flex-direction: column;
        height: 50vh;
        overflow-y: auto;

        .user {
          padding: 1rem 0;
          border-radius: 0.5rem;

          &.is-highlighted {
            background-color: $white;
            color: $primary;
          }
        }

        &__icon {
          width: 3.6rem !important;
          height: 3.6rem !important;
        }
      }

      &__text {
        padding: 2rem;
        text-align: center;
        font-size: 1.6rem;
        font-weight: 500;
        line-height: 1.75;
        color: rgba(23, 30, 72, 0.7);
      }
      &--image {
        display: flex;
        justify-content: center;
      }
    }

    &__footer {
      padding-top: 2rem;
      padding-bottom: 1rem;
      padding-right: 2rem;
      display: flex;
      justify-content: flex-end;
      border-top: 2px solid #eef1f5;
      font-size: 1.6rem;
      font-weight: 600;

      &__button {
        width: 11rem;
        height: 5rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &__cancel {
          background-color: #ffffff;
          border: solid 1px rgba(23, 30, 72, 0.2);
          margin-right: 1rem;
          color: #5c617e;
        }

        &__confirm {
          background-color: $primary;
          color: #ffffff;
        }
      }
    }
  }
</style>

<template>
  <div v-if="!isLoading" class="assign-containers">
    <div class="assign-containers__header">
      <span class="assign-containers__header__title">Assign Containers</span>
      <i @click="hide_modal" class="fa fa-times assign-containers__header__close" aria-hidden="true" />
    </div>
    <div class="assign-containers__content__select">
      <img :src="require('@/assets/icons/form-search-icon.svg')" class="mr-10" />
      <input v-model="containerInput" class="assign-containers__content__select__text" type="text" placeholder="Search Container Name" />
    </div>
    <div class="assign-containers__content has-slimscroll">
      <div class="assign-containers__content__heading">
        <div class="ml-50 mr-auto">Containers</div>
        <div>Read</div>
        <div>Write</div>
      </div>
      <div class="assign-containers__content__body">
        <div v-for="(container, i) in filteredAllContainers" :key="i" class="assign-containers__content__body__row">
          <div class="assign-containers__content__body__row__main">
            <div class="image is-24x24 mr-10" v-if="container.properties && container.properties.icon">
              <img :src="container.properties.icon" class="image is-24x24 is-rounded" />
            </div>
            <div
              v-else
              class="assign-containers__content__body__row__main__icon"
              :style="
                `background-color: ${
                  container.properties && container.properties.color ? container.properties.color : hashed_color(container.name, 'projectManagement')
                }`
              "
            >
              {{ container.name.charAt(0).toUpperCase() }}
            </div>
            <span class="assign-containers__content__body__row__main__name">{{ container.name }}</span>
          </div>
          <span
            style="cursor: pointer"
            :class="{
              'sh-access-tag--read':
                selectedContainers[container.uid] &&
                (selectedContainers[container.uid].access === 'read' || selectedContainers[container.uid].access === 'write'),
            }"
            @click="select_container(container.uid, 'read')"
            class="sh-access-tag"
          >
            <i class="fa fa-check" aria-hidden="true" />
          </span>
          <span
            style="cursor: pointer"
            @click="select_container(container.uid, 'write')"
            class="sh-access-tag"
            :class="{ 'sh-access-tag--write': selectedContainers[container.uid] && selectedContainers[container.uid].access === 'write' }"
          >
            <i class="fa fa-check" aria-hidden="true" />
          </span>
        </div>
      </div>
      <!-- <div class="assign-containers__content__footer">
        <div
          @click="add_containers"
          class="assign-containers__content__footer__button"
        >Assign Containers</div>
      </div> -->
    </div>
    <div class="add-item__footer">
      <div v-if="is_saving" class="add-item__footer__button button is-pulled-right">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="add_containers" class="add-item__footer__button button has-text-white  is-pulled-right is-medium-16-500-19">Save</div>
      <div @click="$emit('close')" class="add-item__footer__button__cancel button is-pulled-right is-medium-16-500-19 mr-10">Cancel</div>
    </div>
  </div>
  <modal-skeleton v-else />
</template>

<script>
  import { containerService, userService } from "@/desktop/shared/services/";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

  export default {
    mixins: [HashColor],
    data() {
      return {
        containerInput: "",
        allContainers: null,
        selectedContainers: {},
        isLoading: false,
      };
    },

    computed: {
      filteredAllContainers() {
        if (this.allContainers) return this.allContainers.filter((f) => f.name.toLowerCase().startsWith(this.containerInput.toLowerCase()));
      },
    },

    created() {
      this.get_containers();
    },

    methods: {
      hide_modal() {
        this.$emit("close");
      },
      async get_containers() {
        this.isLoading = true;
        let result = await containerService
          .getAll({ query: `exclude_user=${this.$route.params.id}&access=write` })
          .catch((err) => this.handleErrors(err));
        this.allContainers = result.results;
        this.isLoading = false;
      },
      select_container(containerUid, access) {
        if (this.selectedContainers[containerUid])
          if (access === "read") delete this.selectedContainers[containerUid];
          else if (this.selectedContainers[containerUid].access === "read") this.selectedContainers[containerUid].access = "write";
          else this.selectedContainers[containerUid].access = "read";
        else
          this.selectedContainers[containerUid] = {
            uid: containerUid,
            access: access,
          };

        this.selectedContainers = { ...this.selectedContainers };
      },
      async add_containers() {
        await userService
          .post({
            id: this.$route.params.id,
            attribute: "containers/assign",
            body: Object.values(this.selectedContainers),
          })
          .then((res) => {
            this.show_success(res.message);
            this.$eventHub.$emit("refresh-container-list");
            this.$emit("close");
          })
          .catch((err) => this.handleErrors(err));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .assign-containers {
    height: 100%;
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.8rem 3rem;
      background-color: $white;
      color: #171e48;
      border-bottom: 2px solid rgb(234, 237, 243);
      &__title {
        font-size: 2rem;
        font-weight: 500;
      }
      &__close {
        font-size: 2rem;
        cursor: pointer;
      }
    }
    &__content {
      background-color: #f4f7fc;
      padding: 0 3rem 0rem 3rem;
      height: 60%;
      overflow: auto;
      position: relative;

      &__select {
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        padding-bottom: 0.5rem;
        padding-top: 2rem;
        margin: auto 3rem;
        position: sticky;
        top: 0;
        background-color: #f4f7fc;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        z-index: 50000;

        &__text {
          width: 100%;
          border: 0;
          color: #171e48;
          font-size: 1.6rem;
          line-height: 4rem;
          background-color: #f4f7fc;
          &:focus {
            outline: none;
          }
          &::placeholder {
            color: rgba(23, 30, 72, 0.4);
          }
        }
      }

      &__heading {
        display: grid;
        grid-template-columns: auto 10% 10%;
        margin-top: 2rem;
        color: #8d95aa;
        font-size: 1.4rem;
        justify-items: center;
      }

      &__body {
        padding: 2rem 0;
        border-bottom: 1px solid rgba(23, 30, 72, 0.1);
        &__row {
          display: grid;
          grid-template-columns: auto 10% 10%;
          justify-items: center;
          align-items: center;
          padding: 1rem 0;
          &__main {
            display: flex;
            justify-self: flex-start;
            align-items: center;
            &__icon {
              width: 2.4rem;
              height: 2.4rem;
              line-height: 2.4rem;
              border-radius: 50%;
              // background-color: #ffa16c;
              color: $white;
              font-size: 1.2rem;
              font-weight: 600;
              text-align: center;
              margin-right: 1rem;
              user-select: none;
            }
            &__name {
              color: #171e48;
              font-size: 1.6rem;
              font-weight: 500;
            }
          }
        }
      }

      &__footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 2rem;
        &__button {
          color: $white;
          background-color: $primary;
          width: 15rem;
          height: 5rem;
          text-align: center;
          line-height: 5rem;
          font-size: 1.4rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
        }
      }
    }
  }
</style>

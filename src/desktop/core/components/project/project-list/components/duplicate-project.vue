<template>
  <modal
    :name="'duplicate-project'"
    transition="nice-modal-fade"
    classes="demo-modal-class overflow-visible"
    :min-width="200"
    :min-height="200"
    :adaptive="true"
    :scrollable="false"
    :reset="false"
    :pivot-y="0.5"
    width="30%"
    height="auto"
    @closed="
      $modal.hide('duplicate-project');
      $emit('close');
    "
  >
    <div class="template-modal">
      <div class="is-flex has-space-between is-vcenter px-20 mb-20">
        <h1 class="template-modal__header__text is-semiBold-20-600-000">Duplicate</h1>
        <sh-icon
          @click.native="$modal.hide('duplicate-project')"
          :name="'close'"
          :file="'tickets_sprite'"
          class="is-16x16 is-pointer template-modal__header__close"
        ></sh-icon>
      </div>

      <div class="template-modal__content mb-30">
        <div class="template-modal__content--template">
          <p class="is-medium-16-500-19 has-text-theme-black">{{ multiple_projects ? "Add suffix" : "Add Name" }}</p>
          <input class="input mt-10 is-paddingless is-regular-16-00-19" placeholder="Project Name" v-model="name" required />
        </div>

        <div class="template-modal__content--template mt-30 is-relative">
          <p class="is-regular-16-00-19 has-text-theme-black">Group</p>

          <input
            class="input mt-10 is-paddingless"
            :placeholder="
              project && project.group && project.group.name
                ? project.group.name
                : multiple_projects && multiple_projects[0] && multiple_projects[0].group
                ? multiple_projects[0].group.name
                : 'Select a group'
            "
            v-model="search_keyword"
            @input="get_groups()"
            @click="selected_group = null"
          />
          <div class="group-dropdown-results has-slimscroll-xs is-absolute" v-if="data && !selected_group">
            <div
              v-for="list in data"
              :key="list.uid"
              class="results_items"
              @click="select_group(list)"
              :class="[selected_template && selected_template.name == list.name ? 'selected_template' : null]"
            >
              <p>{{ list.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="info-message columns px-20">
        <div class="column is-narrow">
          <sh-icon :name="'exclamation'" class="is-16x16"></sh-icon>
        </div>

        <div class="column">
          <p class="is-semiBold-14-600-17 has-text-blue">Note</p>
          <p class="is-regular-14-00-17 mt-5">
            Reports won't be duplicated and will be referencing to the original project. All changes to the existing reports will appear in the
            duplicated projects as well.
          </p>
        </div>
      </div>

      <div class="template-modal__footer is-pointer">
        <div @click="duplicate_project" class="sh-button is-flex ml-auto mr-20">
          <sh-icon :name="'duplicate-white'" :file="'tickets_sprite'" class="is-22x22  actions-dropdown-content__list--icon"></sh-icon>
          <span class="ml-10">Duplicate</span>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
  import { groupService } from "@/desktop/shared/services/";

  export default {
    props: ["project", "multiple_projects", "group"],
    data() {
      return {
        name: null,
        search_keyword: null,
        data: null,
        selected_group: null,
      };
    },

    mounted() {
      this.$modal.show("duplicate-project");
    },

    created() {
      if (this.project) {
        this.name = this.project.name;
      }
    },

    methods: {
      get_groups() {
        _.debounce(async (e) => {
          let result = await groupService
            .getAll({
              query: `search=${this.search_keyword}&page_size=5`,
            })
            .catch((err) => this.handleErrors(err));

          this.data = result.results;
        }, 500)();
      },
      select_group(group) {
        this.selected_group = group;
        this.search_keyword = this.selected_group.name;
      },
      async duplicate_project() {
        if (this.multiple_projects) {
          let data = this.multiple_projects.map((project) => _.pick(project, ["name", "uid"]));

          data.map((item) => (item.name = (item.name + (this.name ? this.name : "")).slice(0, 98)));

          let res = await groupService
            .copy_project({
              id: this.selected_group && this.selected_group.uid ? this.selected_group.uid : this.group,
              body: data,
            })
            .catch((err) => this.handleErrors(err));
        } else {
          let data = [
            {
              name: this.name.slice(0, 98),
              uid: this.project.uid,
            },
          ];

          let res = await groupService
            .copy_project({
              id: this.selected_group && this.selected_group.uid ? this.selected_group.uid : this.project.group.uid,
              body: data,
            })
            .catch((err) => this.handleErrors(err));
        }

        this.$emit("close");
        this.$eventHub.$emit("refresh-group-list");
        this.$eventHub.$emit("refresh-project-list");
        this.$modal.hide("duplicate-project");
      },
    },
  };
</script>

<style lang="scss">
  .template-modal {
    border-radius: 10px;
    box-shadow: 0 15px 50px 0 rgba(0, 0, 0, 0.3);
    background-color: #fafcff;
    padding: 2rem;

    &__header {
      color: #171e48;
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #eef1f5;
      padding-bottom: 2rem;

      &__text {
        font-size: 2rem;
        font-weight: 600;
        text-transform: capitalize;
      }

      &__close {
        font-size: 1.8rem;
        cursor: pointer;
      }
    }

    &__content {
      padding: 2rem;

      &__text {
        padding: 2rem 6rem 4rem 6rem;
        text-align: center;
        font-size: 1.6rem;
        font-weight: 500;
        line-height: 1.75;
        color: rgba(23, 30, 72, 0.7);
      }

      .input {
        width: 100%;
        border: none;
        background-color: transparent;
        box-shadow: none;
        color: #171e48;
        font-size: 1.6rem;
        line-height: 4rem;
        border-radius: 0;

        border-bottom: 1px solid rgba(23, 30, 72, 0.1);

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: rgba(23, 30, 72, 0.4);
        }
      }

      .group-dropdown-results {
        background-color: white;
        border: 1px solid #eee;
        z-index: 100;
        border-radius: 1rem;
        position: absolute;

        top: 7rem;
        width: 100%;

        &_items {
          padding: 1rem;
          cursor: pointer;
          font-weight: 600;

          &:hover {
            background-color: rgba(92, 126, 247, 0.2);
          }
        }
      }
    }

    &__footer {
      padding-top: 3rem;
      padding-bottom: 1rem;
      display: flex;
      justify-content: center;
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

  .hover-background {
    &:hover {
      background-color: $primary-background;
    }
  }

  .share-dropdown {
    position: absolute;
    background: $white;
    border: 1px solid #eee;
    border-radius: 1rem;
    z-index: 10;
    box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
  }

  .no-wrap {
    flex-wrap: nowrap !important;
  }

  .info-message {
    width: 90%;
    margin: auto;
    padding: 1.5rem;
    border-radius: 6px;
    border: solid 1px #c8d4fd;
    background-color: #e3eafe;
  }
</style>

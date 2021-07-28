<template>
  <div>
    <div class="form-builder">
      <div class="form-builder--heading">
        <div class="form-builder--heading__options">
          <div class="form-builder--heading__tabs">
            <div class="sh-tabs">
              <ul style="border-bottom: none; position: relative; bottom: -1px">
                <li>
                  <router-link active-class="is-active" :to="{ name: 'forms' }"
                    >Forms</router-link
                  >
                </li>
                <li>
                  <router-link
                    active-class="is-active"
                    :to="{ name: 'admin-user-list' }"
                    >Submissions</router-link
                  >
                </li>
                <li>
                  <router-link
                    active-class="is-active"
                    :to="{ name: 'admin-user-list' }"
                    >Reports</router-link
                  >
                </li>
              </ul>
            </div>
          </div>
          <div class="form-builder--heading__options-right">
            <div>
              <div class="has-text-right is-medium-14-500-24">Setting</div>
            </div>
          </div>
        </div>
      </div>

      <div class="top-section mb-5">
        <div class="top-container">
          <div class="top-container__left is-medium-14-500-17 medium-opacity">
            <button
              :class="
                'button is-rounded is-medium' +
                (filterKey === 'shared' ? ' active' : '')
              "
              @click="btnClick(2)"
            >
              Shared with me
            </button>
            <button
              :class="
                'button is-rounded is-medium' +
                (filterKey === 'published' ? ' active' : '')
              "
              @click="btnClick(0)"
            >
              Published
            </button>
            <button
              :class="
                'button is-rounded is-medium' +
                (filterKey === 'draft' ? ' active' : '')
              "
              @click="btnClick(1)"
            >
              Drafts
            </button>
          </div>
          <div class="top-container__right">
            <div class="is-medium-14-500-17 medium-opacity mr-5">Show:</div>
            <div
              class="sh-dropdown"
              v-click-outside="() => (groupby_active = false)"
            >
              <div
                @click="groupby_active = !groupby_active"
                class="map-active is-pointer mr-40 ml-5"
              >
                <p class="is-flex is-vcenter">
                  <span>All Time</span>
                  <sh-icon
                    :name="'chevron-down'"
                    class="is-10x10 ml-5"
                  ></sh-icon>
                </p>
                <!-- <img src="@/assets/icons/chevron-down.svg" alt /> -->
              </div>
            </div>
            <div class="is-medium-14-500-17 medium-opacity mr-5">Group By:</div>

            <div
              class="sh-dropdown is-active"
              v-click-outside="() => (sortby_active = false)"
            >
              <div @click="sortby_active = false" class="map-active mr-40 ml-5">
                <p class="is-flex is-vcenter">
                  <span>None</span>
                  <sh-icon
                    :name="'chevron-down'"
                    class="is-10x10 ml-5"
                  ></sh-icon>
                </p>
              </div>
            </div>
            <div class="is-medium-14-500-17">
              <div @click="createForm()" class="sh-button sh-button--create">
                New Form
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="columns" style="padding: 10px; display: flex; flex-wrap: wrap">
      <div
        class="asset-item"
        v-for="form in forms.filter((form) => {
          if (filterKey === 'shared') return true;
          return form.status === filterKey;
        })"
        :key="form.uid"
      >
        <div>
          <!-- v-if="form.bookmarkView" -->
          <div class="bookmark" @click="activeView(form)">
            <sh-icon :name="'bookmark'" class="is-14x14 is-pointer" />
          </div>
          <div
            v-if="form.bookmark && form.bookmarkView"
            class="bookmark"
            @click="deactiveView(form)"
          >
            <sh-icon
              :name="'bookmarked-highlight'"
              class="is-14x14 is-pointer"
            />
          </div>
          <div class="asset--card is-pointer" @click="view(form)">
            <div style="padding: 5px; border-bottom: 2px solid #f4f7fc">
              <div class="asset--card__image">
                <img v-if="form.thumbnail" :src="form.thumbnail" />
                <sh-icon
                  v-else
                  :file="'forms-sprite'"
                  :name="'logo-sensehawk'"
                  class="image"
                  style="height: 160px; max-width: 100%"
                ></sh-icon>
                <div>
                  <sh-icon
                    :name="'edit'"
                    :file="'helper_sprite'"
                    class="is-24x24 mr-10 overlay-icon"
                  ></sh-icon>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="card-title">
                <div class="columns is-mobile">
                  <div class="column is-9 padding-20">
                    <h5>{{ form.name }}</h5>
                  </div>
                  <div class="column is-2 padding-15">
                    <sh-dropdown :triggerIsIcon="true" :icon="'none'">
                      <div slot="selection">
                        <span class="icon has-text-info">
                          <i class="fas fa-ellipsis-h" aria-hidden="true"></i>
                        </span>
                      </div>
                      <div slot="content">
                        <p>
                          <span class="is-medium-14-500-17">Print Form</span>
                        </p>

                        <p>
                          <span class="is-medium-14-500-17"
                            >Print Submissions</span
                          >
                        </p>

                        <p>
                          <span class="is-medium-14-500-17"
                            >Download All Attachments</span
                          >
                        </p>
                      </div>
                    </sh-dropdown>
                  </div>
                </div>
              </div>
              <div class="card-text">
                <slot> {{ form.totalSubmissions }} Submission</slot>
              </div>
              <div class="footer">
                <slot>
                  <div class="columns is-mobile center">
                    <div class="column is-1">
                      <span class="icon has-text-info">
                        <i class="fas fa-check-circle" aria-hidden="true"></i>
                      </span>
                    </div>
                    <div class="column is-2">
                      <div class="asset--card__image afterimage">
                        <img src="/img/asset-map.41a376d3.svg" />
                      </div>
                    </div>
                    <div class="column is-5">
                      <p>
                        {{
                          $store.getters.state_users[form.owner].first_name +
                          " " +
                          $store.getters.state_users[form.owner].first_name
                        }}
                      </p>
                    </div>
                    <div class="column is-4">
                      <p>4hrs ago</p>
                    </div>
                  </div>
                  <div class="columns is-mobile center">
                    <div v-if="filterKey === 'shared'" class="column is-6">
                      Status :
                    </div>
                    <div v-if="filterKey === 'shared'" class="column is-6">
                      {{ form.status }}
                    </div>
                  </div>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import shDropdown from "../../../shared/components/sh-dropdown.vue";
import { mapMutations, mapState, mapGetters, mapActions } from "vuex";
export default {
  components: {
    shDropdown,
  },
  data() {
    return {
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      cards: [
        {
          img: "/img/asset-placeholder.58eb70d4.png",
          formName: "Sensehawk From 01",
          sub: "3 Submission",
          date: new Date(),
          name: "Jhon Peter",
          bookmark: false,
          bookmarkView: false,
        },
      ],
      filterKey: "published",
    };
  },
  computed: {
    ...mapState("forms", ["forms"]),
  },
  watch: {
    forms(newForms) {
      // return newForms.filter((form) => form.status === this.filterKey);
      console.log(newForms);
    },
    // filterKey(newKey) {
    //   console.log(newKey);
    //   return this.forms.filter((form) => form.status === newKey);
    // },
  },
  methods: {
    ...mapMutations(["forms", ["SET_FORMID"]]),
    ...mapActions("forms", ["add_form"]),

    async createForm() {
      let form = await this.add_form({
        body: {
          name: "Untitled Form",
          targetElement: {
            asset: null,
            type: "organization",
            uid: "ERWXfHvgDU",
            stage: "CORE",
          },
        },
      });
      if (form && form.data && form.data.uid) {
        this.$router.push(`/forms/${form.data.uid}/create`);
      }
    },
    btnClick(flag) {
      console.log("success", this.formsBtn);
      if (flag == 1) {
        this.filterKey = "draft";
      } else if (flag == 2) {
        this.filterKey = "shared";
      } else {
        this.filterKey = "published";
      }
    },
    view(form) {
      console.log(form);
      this.$router.push(`/forms/${form.uid}/create`);
    },
    activeView(card) {
      card.bookmark = true;
    },
    deactiveView(card) {
      card.bookmark = false;
      card.bookmarkView = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.form-builder {
  &--heading {
    padding: 0px 30px;
    background: white;
    border-top: 1px solid #f6f6f6;
    box-shadow: 0px 1px 0px #0000000d;
    &__options {
      margin-top: 15px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &-left,
      &-right {
        display: flex;
        align-items: center;
      }
    }
    &__tabs {
      display: flex;
      align-items: center;
      justify-content: left;
    }
  }
}
.map-active {
  opacity: 1;
  font-family: Barlow-semibold;
  font-size: 14px;
  font-weight: 600;
  color: #171e48;
}
.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  &__right {
    display: flex;
    align-items: center;
    color: #393c42;
  }
  .medium-opacity {
    opacity: 0.7;
  }
}
.asset-item {
  padding: 1rem;
  .bookmark {
    display: none;
  }

  &:hover {
    .bookmark {
      display: flex;
    }
  }
  .asset--card {
    width: 250px;
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
    position: relative;
    padding-bottom: 2.3rem;
    &__image {
      position: relative;
      img {
        height: 160px;
        width: 100%;
        border-radius: 1rem 1rem 0 0;
      }

      div {
        display: none;
      }
    }

    border: 2px solid transparent;
    &:hover {
      box-shadow: 0 3px 6px 0 #2585d3;
      border: 2px solid #2585d3;
      .asset--card__image {
        position: relative;
        div {
          position: absolute;
          background: #00000099;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .overlay-icon {
            color: white !important;
          }
        }
      }
    }
  }
}
.icon {
  color: grey !important;
}
.afterimage img {
  border-radius: 30px !important;
  height: 20px !important;
}
.card-text {
  padding-left: 13px;
}
.footer {
  padding: 0;
  padding-top: 10px;
  padding-left: 10px;
  background: white;
}
.bookmark {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: #ffffff;
  filter: drop-shadow(1px 1px 2px #898a8b);
}
.active {
  background-color: #393c42 !important;
  color: #f4f7fc;
}
.asset-item {
  position: relative;
  padding: 1rem;
  .asset--card {
    width: 250px;
    background-color: $white;
    border-radius: 1rem;
    box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
    position: relative;
    padding-bottom: 2.3rem;
    &:hover {
      box-shadow: 0 3px 6px 0 rgba(92, 126, 247, 0.3);
    }

    &__image {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f4f7fc;
      img {
        height: 150px;
        width: 50%;
        // border-radius: 1rem 1rem 0 0;
      }
    }
    &__icon {
      display: flex;
      justify-content: center;
      position: absolute;
      width: 100%;
      bottom: 14rem;
      &--avatar {
        width: 4rem;
        height: 4rem;
        border: 2px solid $white;
        border-radius: 50%;
        color: $white;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
.icon {
  color: grey !important;
}
.afterimage {
  background-color: #ffffff !important;
}
.afterimage img {
  width: 30px !important;
  border-radius: 50% !important;
  height: 100% !important;
}
.card-text {
  padding-left: 13px;
}
.footer {
  padding: 0;
  padding-top: 10px;
  padding-left: 10px;
  background: white;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style scoped>
.button {
  border: 1.5px solid var(--primary);
  background: #ffffff 0% 0% no-repeat padding-box;
  border-radius: 18px;
  opacity: 1;
  margin-left: 20px;
  padding: 15px;
}
.sh-button {
  border: 1px solid #2585d3;
  background-color: #fff;
  color: #2585d3;
}
</style>

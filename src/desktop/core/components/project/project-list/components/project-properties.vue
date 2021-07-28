<template>
  <modal
    :name="modalName"
    transition="nice-modal-fade"
    classes="demo-modal-class project-properties-modal"
    :min-width="100"
    :min-height="100"
    :adaptive="true"
    :scrollable="false"
    :reset="true"
    width="40%"
    height="auto"
    @closed="$emit('closed')"
  >
    <div class="project-properties">
      <div class="project-properties__head">
        <div class="project-properties__head__name">Properties</div>

        <i @click="$modal.hide(modalName)" class="project-properties__head__close fa fa-times" />
      </div>
      <div class="project-properties__body">
        <div class="project-properties__body__row">
          <div class="project-properties__body__row__left">Key</div>
          <div class="project-properties__body__row__middle">Value</div>
          <div class="project-properties__body__row__right"></div>
        </div>
        <div class="project-properties__body__row">
          <div class="project-properties__body__row__left">
            <p class="project-properties__body__row__input bpm-less">Type</p>
          </div>
          <div class="project-properties__body__row__middle">
            <p @click="isSelectOpen = !isSelectOpen" class="is-flex has-space-between is-vcenter">
              {{ selectedType ? selectedType : "------" }}
              <i class="fa ml-10 is-pointer" :class="[isSelectOpen ? 'fa-chevron-up' : 'fa-chevron-down']" />
            </p>
            <div v-if="isSelectOpen" v-click-outside="() => (isSelectOpen = false)" class="project-properties__body__row__middle__options">
              <div
                v-for="(item, i) in typeOptions"
                :key="i"
                @click="
                  selectedType = item;
                  isSelectOpen = false;
                "
                class="project-properties__body__row__middle__options__item"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <span v-if="selectedType" @click="delete_property('type', null)">
            <sh-icon :name="'delete-grey'" class="is-20x20 ml-40 is-pointer"></sh-icon>
          </span>
        </div>
        <div class="project-properties__body__row">
          <div class="project-properties__body__row__left">
            <p class="project-properties__body__row__input bpm-less">Date</p>
          </div>
          <div class="project-properties__body__row__middle">
            <input
              @click="cal_popup.show('date-input')"
              type="text"
              class="project-properties__body__row__input"
              id="date-input"
              :value="selectedDate ? new Date(selectedDate).toLocaleDateString() : null"
            />
          </div>
          <span @click="delete_property('date', null)" v-if="selectedDate">
            <sh-icon :name="'delete-grey'" class="is-20x20 ml-40 is-pointer"></sh-icon>
          </span>
        </div>

        <div class="project-properties__body__row">
          <div class="project-properties__body__row__left">
            <p class="project-properties__body__row__input bpm-less">Disable?</p>
          </div>

          <div class="project-properties__body__row__middle">
            <input
              type="checkbox"
              id="disabled"
              class="project-properties__body__row__input sleek-checkbox"
              :checked="is_disabled"
              @change="is_disabled = !is_disabled"
            />
          </div>
        </div>

        <div v-for="(property, key, i) in properties" :key="i">
          <div v-if="key !== 'type' && key !== 'date'" class="project-properties__body__row">
            <div class="project-properties__body__row__left">
              <input
                v-if="edit_property == i"
                class="project-properties__body__row__input"
                type="text"
                :placeholder="key"
                v-model="update_key"
                @keypress.enter="update_property(key)"
              />
              <span v-else>{{ key }}</span>
            </div>
            <div class="project-properties__body__row__middle">
              <input
                v-if="edit_property == i"
                class="project-properties__body__row__input"
                type="text"
                :placeholder="property"
                v-model="update_value"
                @keypress.enter="update_property(key)"
              />
              <span v-else>{{ property }}</span>
            </div>
            <div class="project-properties__body__row__right">
              <span v-if="edit_property != i" @click="(update_value = property), (update_key = key), (edit_property = i)">
                <sh-icon :name="'edit-box'" class="is-20x20 mr-10 is-pointer"></sh-icon>
              </span>
              <span v-if="edit_property == i" @click="update_property(key)">
                <sh-icon :name="'complete'" class="is-20x20 mr-10 is-pointer"></sh-icon>
              </span>
              <span v-if="edit_property != i" @click="delete_property(key, value)">
                <sh-icon :name="'delete-grey'" class="is-20x20 mr-10 is-pointer"></sh-icon>
              </span>
            </div>
          </div>
        </div>

        <div class="project-properties__body__row">
          <div class="project-properties__body__row__left">
            <input
              v-model="inputKey"
              class="project-properties__body__row__input"
              type="text"
              placeholder="Key"
              v-on:keyup.enter="nextInput"
              v-focus
            />
          </div>
          <div class="project-properties__body__row__middle">
            <input
              v-model="inputVal"
              id="input2"
              class="project-properties__body__row__input"
              type="text"
              placeholder="Value"
              @keypress.enter="append_property(inputKey, inputVal)"
            />
          </div>
          <div class="project-properties__body__row__right">
            <i @click="append_property(inputKey, inputVal)" class="project-properties__body__row__right__check fa fa-check" />
          </div>
        </div>
      </div>
      <div @click="update_properties" class="project-properties__body__button">Update Properties</div>
    </div>
  </modal>
</template>

<script>
  import { projectService } from "@/desktop/shared/services/";

  export default {
    props: ["project"],
    data() {
      return {
        modalName: "project-properties",
        typeOptions: ["visual", "plant_design", "grayscale", "others"],
        isSelectOpen: false,
        inputKey: null,
        inputVal: null,
        properties: {},
        selectedType: null,
        selectedDate: null,
        calendar: null,
        cal_popup: null,
        edit_property: -1,
        update_key: null,
        update_value: null,
        is_disabled: false,
      };
    },
    created() {
      this.properties = this.project.properties;
      if (this.properties.type) this.selectedType = this.properties.type;
      if (this.properties.date) this.selectedDate = this.properties.date;
      if (this.properties.is_disabled) this.is_disabled = this.properties.is_disabled;
    },
    mounted() {
      this.$modal.show(this.modalName);
      this.create_cal();
    },
    methods: {
      create_cal() {
        if (!this.calendar)
          this.calendar = new dhx.Calendar(null, {
            css: " project-properties__body__row__input is-date",
            dateFormat: "%d/%m/%y",
          });

        this.cal_popup = new dhx.Popup();
        this.cal_popup.attach(this.calendar);

        this.calendar.events.on("change", (date) => {
          this.selectedDate = date;
          this.cal_popup.hide();
        });
      },
      nextInput(e) {
        document.getElementById("input2").focus();
      },
      append_property(key, value) {
        if (!key || !key.trim().length || !value || !value.trim().length) {
          return;
        }
        this.properties[key] = value;
        this.inputKey = null;
        this.inputVal = null;
      },

      update_property(delete_prop) {
        delete Object.assign(this.properties, {
          [this.update_key]: this.properties[delete_prop],
        })[delete_prop];

        this.properties[this.update_key] = this.update_value;
        this.update_key = null;
        this.update_value = null;
        this.edit_property = -1;
        this.$emit("properties_updated");
      },

      delete_property(key, value) {
        if (key === "type") {
          this.selectedType = null;
          this.properties.type = null;
        }
        if (key === "date") {
          this.properties.date = null;
          this.selectedDate = null;
        } else {
          delete this.properties[key];
          this.properties = { ...this.properties };
        }
      },

      async update_properties() {
        if (this.selectedType) this.properties.type = this.selectedType;
        if (this.selectedDate) this.properties.date = this.selectedDate;
        this.properties.is_disabled = this.is_disabled;

        let result = await projectService
          .patch({
            group_id: this.project.group.uid,
            id: this.project.uid,
            body: { properties: this.properties },
          })
          .catch((err) => this.handleErrors(err));
        if (result) {
          this.show_success("Project properties updated.");
          this.$eventHub.$emit("refresh-project-list");
          this.$modal.hide(this.modalName);
        }
      },
    },
  };
</script>

<style lang="scss">
  .project-properties-modal {
    overflow: visible !important;
  }
  .project-properties {
    border-radius: 10px;
    box-shadow: 0 10px 30px 0 rgba(50, 60, 70, 0.3);
    background-color: #fafcff;
    color: #171e48;
    overflow: visible;
    padding-bottom: 3rem;

    &__head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 1px 0 rgba(50, 60, 70, 0.05);
      background-color: #ffffff;
      padding: 2rem 3rem;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;

      &__name {
        width: 93px;
        height: 24px;
        font-family: Barlow-SemiBold;
        font-size: 20px;
        font-weight: 600;
        font-stretch: normal;
        font-style: normal;

        letter-spacing: normal;
        text-align: left;
        color: #171e48;
      }
      &__close {
        font-size: 2rem;
        cursor: pointer;
      }
    }

    &__body {
      font-size: 1.6rem;
      align-items: center;
      padding: 0 3rem;
      font-weight: 500;
      overflow: visible;
      font-family: Barlow-Medium;
      font-weight: 500;
      font-stretch: normal;
      font-style: normal;

      &__row {
        display: flex;
        width: 100%;
        padding: 2rem 0;
        overflow: visible;

        &__left {
          width: 50%;
          text-transform: capitalize;
          padding: 0 1rem;
        }

        &__middle {
          width: 35%;
          overflow: visible;
          position: relative;
          text-transform: capitalize;
          padding: 0 1rem;

          &__select {
            cursor: pointer;
          }

          &__options {
            z-index: 10;
            position: absolute;
            overflow: visible;
            background-color: #ffffff;
            border: 1px solid #ddd;
            box-shadow: 0 2px 1px 0 rgba(50, 60, 70, 0.05);
            top: 100%;
            left: 0;
            padding: 0.5rem 0;
            border-radius: 10px;
            width: 100%;

            &__item {
              padding: 0.5rem 2rem;
              cursor: pointer;
              text-transform: capitalize;

              &:hover {
                background-color: rgba(92, 126, 247, 0.1);
              }
            }
          }
        }
        &__right {
          width: 15%;
          display: flex;
          align-items: center;
          justify-content: space-evenly;

          &__check {
            font-size: 2rem;
            color: $primary;
            cursor: pointer;
          }
        }
        &__input {
          width: 100%;
          border: 0;
          color: #171e48;
          font-size: 1.6rem;
          line-height: 4rem;
          background-color: #fafcff;
          text-transform: capitalize;
          border-radius: 4px;
          border: solid 1px rgba(23, 30, 72, 0.2);
          padding: 0 1rem;

          &.is-date {
            width: 166px;
          }

          &:focus {
            outline: none;
          }
          &::placeholder {
            color: rgba(23, 30, 72, 0.4);
          }
        }
      }

      &__button {
        display: flex;
        justify-content: flex-end;
        margin-top: 2rem;
        margin-right: 3rem;
        margin-left: auto;
        font-size: 1.6rem;
        font-weight: 600;
        color: #ffffff;
        background-color: $primary;
        padding: 1.6rem 2rem;
        width: 17rem;
        border-radius: 6px;
        cursor: pointer;
      }
    }
  }
</style>

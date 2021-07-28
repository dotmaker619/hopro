<template>
  <div class="webviewer-options">
    <div class="webviewer-toolbar">
      <div class="webviewer-toolbar-option">
        <div
          class="webviewer-toolbar-option--group"
          :class="{ active: option }"
        >
          <div
            @click="
              leftOpen = !leftOpen;
              leftOpen
                ? instance.openElements(['leftPanel'])
                : instance.closeElements(['leftPanel']);
            "
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'index'"
              :style="
                leftOpen
                  ? 'fill:transparent;stroke:steelblue;stroke-width:2px;'
                  : 'fill:transparent;stroke:white;stroke-width:2px'
              "
              class="is-18x18"
            ></sh-icon>
          </div>
          <div class="webviewer-toolbar-option--button__seperator"></div>
          <div
            v-if="!isMobile"
            @click="instance.toggleFullScreen()"
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'fullScreen'"
              class="is-36x36"
            ></sh-icon>
          </div>
          <div
            @click="zoomDropdown = true"
            v-click-outside="
              () => {
                zoomDropdown = false;
              }
            "
            class="webviewer-toolbar-option--zoom"
          >
            {{ dropdownVal ? dropdownVal : Math.round(zoomValue * 100) + "%" }}
            <i
              style="font-size: 10px"
              class="fa fa-chevron-down ml-5 is-10x10"
            ></i>
            <div
              v-show="zoomDropdown"
              class="webviewer-toolbar-option__dropdown px-20 py-5"
            >
              <div
                @click.stop="
                  zoomDropdown = false;
                  dropdownVal = size.name;
                  (zoomValue = size.value), docViewer.zoomTo(zoomValue);
                  size.fit
                    ? docViewer.setFitMode(docViewer.FitMode[size.fit])
                    : '';
                "
                v-for="size in zoomSize"
                :key="size"
              >
                {{ size.name }}
              </div>
            </div>
          </div>
          <div
            @click="
              dropdownVal = null;
              zoomValue = docViewer.getZoom() - 0.2;
              docViewer.zoomTo(zoomValue);
            "
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'zoom-out'"
              class="is-18x18"
            ></sh-icon>
          </div>
          <div
            style="margin-left: 15px"
            @click="
              dropdownVal = null;
              zoomValue = docViewer.getZoom() + 0.2;
              docViewer.zoomTo(zoomValue);
            "
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'zoom-in'"
              class="is-18x18"
            ></sh-icon>
          </div>
          <div class="webviewer-toolbar-option--button__seperator left"></div>
          <div
            @click="docViewer.rotateClockwise()"
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'rotate-file-icon-left'"
              class="is-24x24"
            ></sh-icon>
          </div>
          <div
            style="margin-left: 15px"
            @click="docViewer.rotateCounterClockwise()"
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'rotate-file-icon'"
              class="is-24x24"
            ></sh-icon>
          </div>
        </div>
        <div
          class="webviewer-toolbar-option--group heading"
          :class="{ active: option }"
        >
          <div>
            <div
              v-if="isMobile"
              @click="$emit('close')"
              class="webviewer-toolbar-option--button"
            >
              <sh-icon
                style="fill: transparent; stroke: white"
                :file="'pdftron_sprite'"
                :name="'back-arrow'"
                class="is-14x14 mr-5"
              ></sh-icon>
            </div>
            <img
              width="24px"
              height="21px"
              style="position: relative; top: -2px"
              class="file-type-icon-100 mr-10"
              :src="icon"
            />
            {{ name }}
            <div class="webviewer-toolbar-option--button">
              <sh-icon
                v-if="bookmark"
                :name="'bookmarked-highlight'"
                class="is-14x14"
              />
            </div>
          </div>
          <div v-if="isMobile">
            <div @click="download" class="webviewer-toolbar-option--button">
              <sh-icon
                :file="'pdftron_sprite'"
                :name="'download'"
                class="is-18x18"
              ></sh-icon>
            </div>
            <div
              @click="option = !option"
              class="webviewer-toolbar-option--button"
            >
              <sh-icon
                :file="'pdftron_sprite'"
                :name="'ellipsis-v'"
                class="is-18x18"
              ></sh-icon>
            </div>
          </div>
        </div>
        <div
          class="webviewer-toolbar-option--group"
          :class="{ active: option }"
        >
          <user-tag
            :custom_class="'tiny-user-avatar '"
            class="mr-30"
            :custom_size="24"
            :users="currently_viewing"
            :not_state="true"
            :tagsCountToShow="3"
            :no_access="true"
            :is_precense_component="true"
            id="pdftron-viewer"
          ></user-tag>
          <div
            v-if="!isMobile"
            @click="download"
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'download'"
              class="is-18x18"
            ></sh-icon>
          </div>
          <div
            @click="$emit('delete')"
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'delete'"
              class="is-19x19"
            ></sh-icon>
          </div>
          <div class="webviewer-toolbar-option--button__seperator right"></div>
          <div
            @click="infoDropdown = true"
            v-click-outside="
              () => {
                infoDropdown = false;
              }
            "
            class="webviewer-toolbar-option--button"
            style="position: relative"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'info'"
              class="is-20x20"
            ></sh-icon>
            <div
              v-show="infoDropdown"
              v-if="$slots.default"
              style="left: unset; right: -20px"
              class="webviewer-toolbar-option__dropdown"
            >
              <div class="webviewer-toolbar-option__dropdown__header">
                <div
                  style="justify-content: space-between"
                  class="is-flex align-center px-15 py-5"
                >
                  <div class="has-text-white">Details</div>
                  <sh-icon
                    @click.native.stop="infoDropdown = false"
                    :file="'pdftron_sprite'"
                    :name="'close'"
                    class="is-10x10"
                  ></sh-icon>
                </div>
              </div>
              <div>
                <slot></slot>
              </div>
            </div>
          </div>
          <div v-if="!isMobile" class="webviewer-toolbar-option--button">
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'ellipsis-h'"
              class="is-16x16"
            ></sh-icon>
          </div>
          <div
            v-if="!isMobile"
            @click="$emit('close')"
            class="webviewer-toolbar-option--button"
          >
            <sh-icon
              :file="'pdftron_sprite'"
              :name="'close'"
              class="is-14x14"
            ></sh-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import UserTag from "@/desktop/shared/components/tags/user-tag-new";

export default {
  components: { UserTag },
  props: [
    "instance",
    "isMobile",
    "url",
    "docViewer",
    "bookmark",
    "name",
    "icon",
    "id"
  ],

  data() {
    return {
      option: false,
      leftOpen: false,
      zoomValue: this.docViewer.getZoom(),
      dropdownVal: null,
      zoomDropdown: false,
      infoDropdown: false,
      viewingMembers: null,
      channel: null,
      zoomSize: [
        { name: "Actual Size", fit: "Zoom", value: 1 },
        { name: "Page Fit", fit: "FitPage", value: 1 },
        { name: "Page width", fit: "FitWidth", value: 1 },
        { name: "50%", value: 0.5 },
        { name: "75%", value: 0.75 },
        { name: "100%", value: 1 },
        { name: "125%", value: 1.25 },
        { name: "150%", value: 1.5 },
        { name: "200%", value: 2 },
        { name: "300%", value: 3 },
        { name: "400%", value: 4 },
      ],
    };
  },
  mounted() {
    if (this.$store.getters.annotation_tools) {
      this.channel = this.$store.state.PUSHER.subscribe(
        `presence-annotations-annotation-${this.id}`
      );
      this.channel.bind("pusher:subscription_succeeded", (e) => {
        this.update_members();
      });

      this.channel.bind("pusher:member_added", (member) => {
        this.update_members();
      });

      this.channel.bind("pusher:member_removed", (member) => {
        this.update_members();
      });
    }
  },
  beforeDestroy() {
    if (this.$store.getters.annotation_tools) {
      this.$store.state.PUSHER.unsubscribe(
       `presence-annotations-annotation-${this.id}`
      );
    }
  },
  computed: {
    currently_viewing() {
      return this.viewingMembers
        ? this.viewingMembers.filter(
            (user) => user.email != this.$store.state.claims.email
          )
        : [];
    },
    channel_members() {
      return this.channel.members;
    },
  },
  methods: {
    update_members() {
      this.viewingMembers = this.channel_members
        ? Object.values(this.channel_members.members)
        : [];
    },
    download() {
      window.open(this.url, "_blank");
    },
  },
};
</script>

<style lang="scss">
#pdftron-viewer{
  .tiny-user-avatar + span{
    display:none;
  }
}
</style>

<style lang="scss" scoped>
svg {
  fill: white;
}
$size: 18px;
.webviewer {
  &-options {
    padding: 18px 64px;
    @include for-size(tablet) {
      padding: 0;
    }
    font-size: $size;
    right: 0;
    top: 0;
  }
  &-toolbar {
    color: white;
    &-selection {
      display: none;
    }
    &-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      &__dropdown {
        position: absolute;
        min-width: 130px;
        top: 30px;
        left: -5px;
        border-radius: 4px;
        box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
        border: solid 1px rgba(255, 255, 255, 0.15);
        background-color: #0b0b0b;
        font-family: Barlow;
        font-size: 14px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: 2.57;
        letter-spacing: normal;
        text-align: left;
        color: #b6b6b6;
        &__header {
          width: 100%;
          border-bottom: 1px solid #666;
        }
      }
      @include for-size(tablet) {
        flex-wrap: wrap;
      }
      &--zoom {
        cursor: pointer;
        position: relative;
        @include for-size(tablet) {
          display: none;
        }

        font-size: 14px;
        font-family: Barlow;
        padding-bottom: 3px;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.21;
        letter-spacing: normal;
        text-align: right;
        margin: 0px 25px;
      }
      &--button {
        cursor: pointer;
        &__seperator {
          @include for-size(tablet) {
            display: none;
          }
          margin: 0px 25px;
          padding: 5px 1px;
          height: 25px;
          background: #666;
          &.left {
            margin-left: 40px;
          }
          &.right {
            margin-right: 40px;
          }
        }
      }
      &--button + &--button {
        margin-left: 25px;
      }
      @include for-size(tablet) {
        &--button:not(:first-child) {
          margin-left: 25px;
        }
      }
      .heading > div:first-child &--button {
        margin-left: 5px;
      }
      &--group {
        display: flex;
        @include for-size(tablet) {
          padding: 10px;
          display: none;
          &.active {
            display: flex;
          }
          &:first-child {
            order: 1;
            justify-content: space-between;
            flex: 1;
            height: 44px;
            background: #000000;
          }
          &:last-child {
            order: 2;
            width: 100px;
            height: 44px;
            background: #000000;
          }
        }
        &:last-child {
          justify-content: flex-end;
        }
        align-items: center;
        width: 425px;
        &.heading {
          width: auto;
          margin: 0;
          > div {
            display: flex;
            align-items: center;
          }
          @include for-size(tablet) {
            width: 100%;
            padding: 20px 10px 10px 10px;
            margin: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }
  }
}
</style>

<template>
  <div>
    <div
      @dragenter.prevent.stop="open_file_upload"
      class="attachments-wrapper is-relative"
    >
      <upload-file
        :class="{ 'uppy-mobile': uppyDropdown }"
        @uploaded_success="upload_completed"
        @initialised="uppy = $event"
        service="tickets"
        :name="ticket.name"
        type="ticket"
        :uid="ticket.uid"
        id="ticket_attachments"
        :uploadMethod="uploadMethod"
        @close-uppy="
          uppyDropdown = false;
          getOfflineData();
        "
        :isModal="$route.meta.screen == 'mobile' ? false : true"
        v-if="uppyDropdown || $route.meta.screen !== 'mobile'"
      >
        <div style="display: none">Click</div>
      </upload-file>

      <attachment-search
        class="attachment-mobile-search"
        @search_val="search_keyword = $event"
      />
      <attachment-filters
        class="attachment-mobile-filter"
        @filter_by="filter_by = $event"
        @sort_by="sort_by = $event"
      />

      <div
        v-if="!is_loading"
        class="attachments-top-section is-flex align-center has-space-between"
      >
        <div class="attachments-top-section__left is-flex align-center">
          <div class="attachments-top-section__left--search mr-20">
            <attachment-search class="" @search_val="search_keyword = $event" />
          </div>
          <attachment-filters
            @filter_by="filter_by = $event"
            @sort_by="sort_by = $event"
          />
        </div>
        <div class="attachments-top-section__right is-flex align-center">
          <attachment-bulk-actions
            @refresh_attachments="getData"
            :existing_files="existing_files"
            :ticket="ticket"
            :selected="selected"
            :deselectUid="ticket.uid"
          />
        </div>
      </div>
      <div v-if="is_loading">
        <div v-if="$route.meta.screen !== 'mobile'">
          <div class="columns" v-for="i in 2" :key="i">
            <attachment-skeleton v-for="i in 4" :key="i" class="column is-3" />
          </div>
        </div>
        <div v-else>
          <div
            class="columns is-flex"
            style="flex-wrap: none"
            v-for="i in 2"
            :key="i"
          >
            <attachment-skeleton
              v-for="i in 3"
              :key="i"
              class="column is-4"
              style="width: 33.33%; flex: none"
            />
          </div>
        </div>
      </div>
      <div v-else>
        <!-- TODO -Refactor parent-child commn-->
        <div
          v-if="
            filtered_files.length > 0 ||
            (offlineAttachments && offlineAttachments.length > 0)
          "
        >
          <div class="attachments-tab has-slimscroll-xs" id="att-tab">
            <attachment-list
              v-if="filtered_files.length > 0"
              :existing_files="filtered_files"
              :deselectUid="ticket.uid"
              :ticket="ticket"
              :service="service"
              @delete_attachment="delete_attachment($event)"
              @upload_completed="getData"
              @selection_change="selected = $event"
              @refresh_attachments="getData()"
            ></attachment-list>
            <hr v-if="filtered_files.length > 0" />
            <div v-if="offlineAttachments && offlineAttachments.length > 0">
              <h1 class="offline-heading">Offline Attachments</h1>
              <div
                v-for="attachment in offlineAttachments"
                :key="attachment.file_name"
                class="offline-data"
              >
                <div>
                  <sh-icon
                    :name="'offline-attachment-icon'"
                    class="is-30x30 mr-10"
                  ></sh-icon>
                </div>
                <div style="flex: 1">
                  <div class="offline-file-name">
                    {{ attachment.file_name }}
                  </div>
                  <div class="offline-date">{{ attachment.data.type }}</div>
                </div>
                <div
                  style="width: 150px; text-align: center; display: flex"
                  class="offline-status"
                >
                  <sh-icon
                    :name="
                      attachment.status === 'pending'
                        ? 'offline-attachment-pending'
                        : 'offline-attachment-done'
                    "
                    class="is-14x14 mr-10"
                  ></sh-icon>
                  {{
                    attachment.status === "pending"
                      ? "Waiting for the internet"
                      : "uploaded"
                  }}
                </div>
                <div
                  @click="deleteOfflineAttachment(attachment.key)"
                  v-show="attachment.status === 'pending'"
                >
                  <sh-icon :name="'trash'" class="is-18x18 mr-10"> </sh-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mt-40 mb-60">
          <div class="no-result">
            <div class="no-results__image">
              <img
                slot="image"
                src="@/assets/illustrations/no-attachments-illustration.svg"
                alt
              />
            </div>
            <div class="no-results__text is-medium-20-500-24 has-opacity-8">
              No Attachments
            </div>
            <p
              class="is-regular-14-00-17 px-20"
              style="text-align: center; max-width: 50rem"
            >
              Create a list of task to keep track of the changes and have
              attachments added to each task. Moreover template them and reuse
              it for later use.
            </p>
            <div class="no-results__button mt-20">
              <div
                class="sh-button sh-button--inverted"
                @click="
                  $route.meta.screen == 'mobile'
                    ? (uppyDropdown = true)
                    : false;
                  open_file_upload();
                "
              >
                Add Attachments
              </div>
            </div>
          </div>
        </div>
        <!-- uppy -->
        <div class="ticket-add-files-widget" v-if="filtered_files.length">
          <sh-icon
            :name="'upload-grey'"
            :file="'helper_sprite'"
            class="is-24x24 mr-5 mt-5"
          ></sh-icon>
          Drop files here to attach or
          <span @click="open_file_upload" id="upload-browse">browse</span>
        </div>
      </div>
      <div
        @click="uppyDropdown = false"
        v-if="uppyDropdown"
        class="uppy-backdrop"
      ></div>
      <div
        style="justify-content: center"
        v-if="
          (filtered_files.length && isMobile) ||
          (offlineAttachments && offlineAttachments.length > 0)
        "
        class="attachment-mobile-uploadbtn is-flex is-vcenter"
        @click.stop="
          uppyDropdown = true;
          open_file_upload();
        "
      >
        <i class="fa fa-plus"></i>
      </div>
      <attachment-bulk-actions
        class="attachment-mobile-actions"
        v-if="selected.length"
        @refresh_attachments="getData"
        :existing_files="existing_files"
        :ticket="ticket"
        :selected="selected"
        :deselectUid="ticket.uid"
      />
    </div>
  </div>
</template>

<script>
import { set, get } from "idb-keyval";
import UploadFile from "@/desktop/shared/components/upload-file";
import searchbar from "@/desktop/core/shared/components/searchbar";
import AttachmentList from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-list";
import AttachmentBulkActions from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-bulk-actions";
import AttachmentSearch from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-search";
import AttachmentFilters from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-filters";
import AttachmentSkeleton from "@/desktop/tickets/components/ticket-details/components/attachments/components/attachment-skeleton";

export default {
  components: {
    searchbar,
    AttachmentList,
    UploadFile,
    AttachmentBulkActions,
    AttachmentSearch,
    AttachmentFilters,
    AttachmentSkeleton,
  },
  props: ["ticket", "service"],
  data() {
    return {
      uppy: null,
      uppyDropdown: false,
      selected: [],
      existing_files: [],
      search_keyword: "",
      filter_by: { name: "All", value: "" },
      sort_by: { name: "Uploaded Time", value: "createdAt" },
      is_loading: true,
      offlineAttachments: [],
    };
  },
  async mounted() {
    this.$on("refresh_attachments", this.getData);
    this.getData(true);
    await this.getOfflineData();
  },
  beforeDestroy() {
    this.$off("refresh_attachments", this.getData);
  },
  methods: {
    async getOfflineData() {
      let attachment = await get("attachments");
      this.setOfflineData(attachment);
    },
    async setOfflineData(attachment) {
      this.offlineAttachments = attachment[this.ticket.uid]
        ? Object.keys(attachment[this.ticket.uid]).map((d) => {
            attachment[this.ticket.uid][d].key = d;
            return attachment[this.ticket.uid][d];
          }).filter(d=>!d.checklist_id)
        : [];
    },
    async deleteOfflineAttachment(key) {
      let attachment = await get("attachments");
      delete attachment[this.ticket.uid][key];
      await set("attachments", attachment);
      this.setOfflineData(attachment);
    },
    open_file_upload() {
      try {
        this.uppy.getPlugin("Dashboard").openModal();
      } catch (err) {
        console.log(err);
      }
    },
    upload_completed() {
      this.getData();
      this.uppyDropdown = false;
    },
    uploadMethod(serviceObject) {
      return this.service.update_file_upload({
        body: {
          serviceObject: serviceObject,
        },
        id: this.ticket.uid,
      });
    },
    async delete_attachment(file) {
      let res = await this.service
        .delete_attachments({
          id: this.ticket.uid,
          file_id: file.uid,
        })
        .then(() => this.getData())
        .catch((err) => this.handleErrors(err));
    },

    async getData(loading = false) {
      this.is_loading = loading;
      this.existing_files = await this.service
        .get_file_download_details({
          id: this.ticket.uid,
        })
        .catch((err) => {
          this.handleErrors(err);
          this.is_loading = false;
        });
      this.is_loading = false;
    },
  },
  computed: {
    offline() {
      return this.$store.state.is_offline;
    },
    filtered_files() {
      let attachments = _.orderBy(
        this.existing_files,
        [this.sort_by.value],
        ["asc"]
      );
      if (this.filter_by.value == "favorite") {
        attachments = attachments.filter((file) => file.pinned == true);
      } else if (this.filter_by.value == "ticket") {
        attachments = attachments.filter(
          (file) => file.foreignObjectType == "ticket"
        );
      } else if (this.filter_by.value == "checklist") {
        attachments = attachments.filter(
          (file) => file.foreignObjectType == "checklist"
        );
      } else if (this.filter_by.value == "comment") {
        attachments = attachments.filter(
          (file) => file.foreignObjectType == "comment"
        );
      } else {
        attachments = attachments;
      }
      if (this.search_keyword) {
        attachments = attachments.filter((file) =>
          file.fileName
            .toLowerCase()
            .includes(this.search_keyword.toLowerCase())
        );
      }
      return attachments;
    },
  },
};
</script>

<style lang="scss">
.offline {
  &-heading {
    margin: 15px 182px 0 15px;
    font-family: Barlow;
    font-size: 14px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: left;
    color: black;
  }
  &-data {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 16px;
  }
  &-file-name {
    margin: 0 30.5px 0 0;
    font-family: Barlow;
    font-size: 12px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.17;
    letter-spacing: normal;
    text-align: left;
  }
  &-date {
    margin: 5px 48.5px 1px 0;
    opacity: 0.7;
    font-family: Barlow;
    font-size: 10px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.2;
    letter-spacing: normal;
    text-align: left;
  }
  &-status {
    margin: 0 0 0 8.5px;
    opacity: 0.7;
    font-family: Barlow;
    font-size: 10px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.2;
    letter-spacing: normal;
    text-align: left;
  }
  &-disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
.attachment-mobile-search {
  display: none;
  @include for-size(tablet) {
    display: block;
    border-bottom: 1px solid #eee;
  }
}
.attachment-mobile-filter {
  display: none;
  @include for-size(tablet) {
    display: block;
    padding: 1.2rem;
  }
}
.attachment-mobile-actions {
  display: none;
  @include for-size(tablet) {
    display: block;
  }
}
.uppy-backdrop {
  position: fixed;
  background: #000;
  opacity: 0.6;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
}
.uppy-mobile {
  position: fixed;
  width: 100vw;
  max-height: 60vh;
  // border-top-left-radius: 2rem;
  // border-top-right-radius: 2rem;
  overflow: auto;
  bottom: 0;
  left: 0;
  background: white;
  z-index: 102;
  > div {
    padding: 0;
    margin: 0;
  }
}
.attachment-mobile-uploadbtn {
  position: fixed;
  right: 20px;
  bottom: 65px;
  background: #2585d3;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 100px;
  z-index: 9;
  font-size: 16px !important;
  box-shadow: 0px 1px 3px 0px $primary;
}

.attachment-download {
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px rgba(23, 30, 72, 0.1);
  color: #747891;
  width: 136px;
  height: 36px;
}
.attachments-tab {
  position: relative;
  max-height: 90vh;
  padding: 0.5rem 4rem 1rem 4rem;
  overflow: auto;
  @include for-size(tablet) {
    padding: 0;
  }
  @include for-size(tablet) {
    padding: 0;
    max-height: none;
    height: calc(100vh - 23rem);
    overflow: scroll;
  }
  .attachment-list {
    margin-bottom: 7rem;
    @include for-size(tablet) {
      margin-bottom: 1.5rem;
    }
    .attachment {
      margin: 2rem 0rem;
    }
  }
}

.attachments-top-section {
  color: #171e48;
  padding: 4rem 4rem 1rem 4rem;
  @include for-size(tablet) {
    display: none !important;
  }
  .select {
    margin-top: 3px;
    background-color: transparent;
    .select-value {
      font-family: Barlow-semibold;
      font-size: 14px;
      font-weight: 600;
      color: #171e48;
    }
    select {
      background-color: transparent;
    }
  }
  &__left {
    @include for-size(tablet) {
      width: 100%;
      justify-content: space-between;
    }
    &--search {
      @include for-size(tablet) {
        display: none;
      }
    }
  }
  &__right {
    .download-dropdown {
      left: 0rem;
      width: 13.8rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
      .card {
        z-index: 3;
        box-shadow: none;
        border-radius: 10px;
        border: solid 1px rgba(23, 30, 72, 0.1);
        .button {
          padding: 2.2rem 1rem;
        }
      }
    }
  }
}

.ticket-add-files-widget {
  @include for-size(tablet) {
    display: none;
  }
  position: absolute;
  width: 100%;
  z-index: 40;
  bottom: 0rem;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: #ccc;
  height: 80px;
  box-shadow: 0 1px 0 0 rgba(92, 126, 247, 0.3);
  background-color: #f5f7fc;
  color: #868aa2;
  #upload-browse {
    margin-left: 5px;
    font-weight: 500;
    color: $primary;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>

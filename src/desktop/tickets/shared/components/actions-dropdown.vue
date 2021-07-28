<template>
  <div>
    <div v-if="!isMobile" class="actions-dropdown is-relative" v-click-outside="close_dropdown">
      <div v-if="!is_context" class="actions-dropdown-selection" @click="toggle_dropdown" :class="{ 'is-vhidden': !hover }">
        <sh-icon :name="'3-dots-menu'" class="is-20x20 ml-10" v-if="is_list" />
        <p class="is-flex is-vcenter" v-else>
          <sh-icon :name="'ticket-settings'" class="is-20x20 mr-10" />
          <sh-icon :name="'ticket-settings-arrow-down'" class="is-14x14" />
        </p>
      </div>
      <ul class="actions-dropdown-content is-action" v-if="active" :class="{ 'is-left': !is_list }">
        <li class="is-flex is-between actions-dropdown-content__list is-relative">
          <p
            :class="{ 'has-no-access': !$store.getters.ticket_replication_features }"
            v-tooltip="{ content: `Duplicate ` }"
            class="actions-dropdown-content__list--item"
            @click.stop="
              close_modals();
              showDuplicateModal = true;
            "
          >
            <sh-icon :name="'duplicate'" class="is-22x22 actions-dropdown-content__list--icon" />
          </p>
          <p
            v-tooltip="{ hideOnTargetClick: false, content: `${copied ? 'Copied to clipboard' : 'Copy URL'}` }"
            class="actions-dropdown-content__list--item"
            v-clipboard:copy="ticket_path"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
          >
            <sh-icon :name="copied ? 'copyurl-active' : 'copyurl'" class="is-22x22 actions-dropdown-content__list--icon" />
          </p>
          <p class="actions-dropdown-content__list--item" v-tooltip="{ content: `Archive` }">
            <sh-icon :name="'archive'" class="is-22x22 actions-dropdown-content__list--icon" @click.stop.native="archive_ticket()" />
          </p>
          <p class="actions-dropdown-content__list--item" v-tooltip="{ content: `Delete` }" :class="{ 'is-disabled': !ticket.writeAccess }">
            <span
              @click.stop="
                showDeleteModal = true;
                active = false;
              "
            >
              <sh-icon :name="'delete-ticket'" class="is-22x22 actions-dropdown-content__list--icon" />
            </span>
          </p>
          <duplicate-template :class="[is_modal_view ? 'viewer-actions-popup' : 'template-position']"
            v-if="showDuplicateModal"
            :ticket="ticket"
            @close-duplicate-modal="showDuplicateModal = false"
          >
          </duplicate-template>
        </li>
        <li class="actions-dropdown-content__item" @click.stop="is_ticket_pinned ? unpin() : create_pin()">
          <sh-icon v-if="is_ticket_pinned" :name="'unpinn'" class="is-21x21 mr-10 actions-dropdown-content__list--icon"></sh-icon>
          <sh-icon v-else :name="'pinned'" class="is-22x22 mr-10 actions-dropdown-content__list--icon"></sh-icon>
          <span class="actions-dropdown-content__item--text">{{ is_ticket_pinned ? "Unpin ticket" : "Pin ticket" }}</span>
        </li>

        <li class="actions-dropdown-content__item" @click.stop="download()">
          <sh-icon :name="'download-attachments'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />

          <span class="actions-dropdown-content__item--text">Download Attachments</span>
        </li>
        <li
          class="actions-dropdown-content__item"
          :class="{ 'is-disabled': !ticket.writeAccess }"
          v-if="ticket && ticket.takenUp && ticket.takenUp.uid && ticket.takenUp.uid == $store.state.user_claims.user_id"
          @click.stop="giveup_ticket"
        >
          <sh-icon :name="'giveup'" class="rotate180 is-22x22 mr-10 actions-dropdown-content__list--icon" />

          <span class="actions-dropdown-content__item--text">Give Up</span>
        </li>
        <li
          class="actions-dropdown-content__item"
          :class="{ 'is-disabled': !ticket.writeAccess }"
          v-else-if="!ticket || !ticket.takenUp || !ticket.takenUp.uid || ticket.takenUp.uid != $store.state.user_claims.user_id"
          @click.stop="takeup_ticket($store.state.user_claims)"
        >
          <sh-icon :name="'giveup'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />

          <span class="actions-dropdown-content__item--text">Take Up</span>
        </li>
        <li class="is-relative" :class="{ 'has-no-access': !$store.getters.ticket_replication_features }">
          <p
            class="actions-dropdown-content__item "
            @click.stop="
              close_modals();
              showSaveModal = true;
            "
          >
            <sh-icon :name="'save-as-template'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />
            <span class="actions-dropdown-content__item--text" :class="{ 'is-disabled': !$store.getters.ticket_replication_features }"
              >Save as Template</span
            >
          </p>
          <save-template
            :class="[is_modal_view ? 'viewer-actions-popup' : 'template-position']"
            v-if="showSaveModal"
            @close-save-template="showSaveModal = false"
            :tickets="[ticket.uid]"
            :type="'save'"
          ></save-template>
        </li>
        <li class=" is-relative" :class="{ 'has-no-access': !$store.getters.ticket_replication_features, 'is-disabled': !ticket.writeAccess }">
          <p
            class="actions-dropdown-content__item"
            @click.stop="
              close_modals();
              showLoadModal = true;
            "
          >
            <sh-icon :name="'load-more-template'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />
            <span class="actions-dropdown-content__item--text" :class="{ 'is-disabled': !$store.getters.ticket_replication_features }"
              >Load from Template</span
            >
          </p>
          <save-template
            :class="[is_modal_view ? 'viewer-actions-popup' : 'template-position']"
            v-if="showLoadModal"
            @close-load-template="showLoadModal = false"
            :tickets="[ticket.uid]"
            :type="'load'"
          ></save-template>
        </li>
      </ul>
    </div>

    <div v-else>
      <div class="actions-backdrop" v-if="active" @click.stop="active = false"></div>
      <div v-click-outside="close_dropdown" class="m-actions-dropdown">
        <div v-if="!is_context && !$store.state.is_offline" class="actions-dropdown-selection" @click="active = !active">
          <sh-icon :name="'3-dots-menu'" class="is-20x20 ml-10" />
        </div>
        <ul class="actions-dropdown-content is-action" v-if="active" :class="{ 'is-left': !is_list }">
          <li class="is-flex has-space-between align-center px-25 pt-10 pb-15">
            <p class="is-medium-16-500-19 has-text-black">
              Please choose an option
            </p>
            <p @click="active = false">
              <sh-icon :name="'close'" class="is-12x12" v-if="active"></sh-icon>
            </p>
          </li>
          <hr class="is-marginless" />
          <li class="actions-dropdown-content__item mt-5" @click.stop="download()">
            <sh-icon :name="'download-attachments'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />

            <span class="actions-dropdown-content__item--text">Download Attachments</span>
          </li>
          <li>
            <p
              v-tooltip="{ hideOnTargetClick: false, content: `${copied ? 'Copied to clipboard' : 'Copy URL'}` }"
              class="actions-dropdown-content__item"
              v-clipboard:copy="ticket_path"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
            >
              <sh-icon :name="copied ? 'copyurl-active' : 'copyurl'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />
              <span class="actions-dropdown-content__item--text">Copy Link</span>
            </p>
          </li>
          <li>
            <p @click.stop="archive_ticket()" class="actions-dropdown-content__item" v-tooltip="{ content: `Archive` }">
              <sh-icon :name="'archive'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />
              <span class="actions-dropdown-content__item--text">Archive</span>
            </p>
          </li>
          <li
            class="actions-dropdown-content__item"
            :class="{ 'is-disabled': !ticket.writeAccess }"
            v-if="ticket && ticket.takenUp && ticket.takenUp.uid && ticket.takenUp.uid == $store.state.user_claims.user_id"
            @click.stop="giveup_ticket"
          >
            <sh-icon :name="'giveup'" class="rotate180 is-22x22 mr-10 actions-dropdown-content__list--icon" />

            <span class="actions-dropdown-content__item--text">Give Up</span>
          </li>
          <li
            class="actions-dropdown-content__item"
            :class="{ 'is-disabled': !ticket.writeAccess }"
            v-else-if="!ticket || !ticket.takenUp || !ticket.takenUp.uid || ticket.takenUp.uid != $store.state.user_claims.user_id"
            @click.stop="takeup_ticket($store.state.user_claims)"
          >
            <sh-icon :name="'giveup'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />

            <span class="actions-dropdown-content__item--text">Take Up</span>
          </li>
          <li>
            <p
              @click.stop="
                showDeleteModal = true;
                active = false;
              "
              class="actions-dropdown-content__item"
              v-tooltip="{ content: `Delete` }"
              :class="{ 'is-disabled': !ticket.writeAccess }"
            >
              <span>
                <sh-icon :name="'delete-ticket'" class="is-22x22 mr-10 actions-dropdown-content__list--icon" />
              </span>
              <span class="actions-dropdown-content__item--text">Delete</span>
            </p>
          </li>
        </ul>
      </div>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="ticket.uid"
      :resourceName="ticket.name"
      :resourceType="ticket.isTemplate ? 'template' : 'ticket'"
      :resourceService="ticketService"
      @closed="showDeleteModal = false"
      @deleted="deleted_resource(ticket.uid)"
    />
  </div>
</template>

<script>
  import { ticketService } from "@/desktop/shared/services/";
  import SaveTemplate from "./save-template";
  import DuplicateTemplate from "./duplicate-template";
  import { mapState } from "vuex";
  import PinMixin from "@/desktop/shared/mixins/pin.mixin";

  export default {
    mixins: [PinMixin],
    props: {
      ticket: Object,
      is_list: Boolean,
      is_context: Boolean,
      hover: {
        type: Boolean,
        default: true,
      },
      is_modal_view: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        active: false,
        ticketService: ticketService,
        showDeleteModal: false,
        showSaveModal: false,
        showDuplicateModal: false,
        showLoadModal: false,
        copied: false,
        ticket_path: `${window.location.origin}/tickets/${this.ticket.uid}/details`,
      };
    },
    components: {
      SaveTemplate,
      DuplicateTemplate,
    },
    computed: {
      ...mapState(["PINNED_TABS", "current_organization", "claims"]),
      is_watching() {
        return _.find(this.ticket.watchers, ["uid", this.$store.state.user_claims.user_id]);
      },
      is_ticket_pinned() {
        return !!this.PINNED_TABS.filter((p) => p.path === `/tickets/${this.ticket.uid}/details`).length;
      },
    },
    created() {
      this.$eventHub.$on("open_context_menu", (id) => {
        id == this.ticket.uid && this.is_context ? (this.active = true) : (this.active = false);
      });
    },
    beforeDestroy() {
      this.$eventHub.$off("open_context_menu");
    },
    methods: {
      create_pin() {
        let pinObj = {
          name: this.ticket.name || this.ticket.uid,
          path: `/tickets/${this.ticket.uid}/details`,
          type: "tickets",
        };
        let pinnedList = [...this.PINNED_TABS];
        pinnedList.unshift(pinObj);
        this.edit_or_unpin(pinnedList.slice(0, 10));
      },
      unpin() {
        let updated_pins = this.PINNED_TABS.filter((p) => p.path !== `/tickets/${this.ticket.uid}/details`);
        this.edit_or_unpin(updated_pins);
      },
      async archive_ticket() {
        this.$store.dispatch("tickets/update_ticket_value", {
          value: {
            archive: !this.ticket.archive,
          },
          id: this.ticket.uid,
        });
        this.$store.dispatch("tickets/remove_tickets", this.ticket.uid);

        this.$emit("close_details");
      },
      async giveup_ticket() {
        this.$store.dispatch("tickets/update_ticket_value", {
          value: { takenUp: null },
          id: this.ticket.uid,
        });
        this.active = false;

        this.$toast.show("Ticket Given Up", "", this.$store.state.izitoast_options.appWarning);
      },
      deleted_resource(uid) {
        if (this.ticket.isTemplate) this.$eventHub.$emit("delete_template_ticket", uid);
        this.$store.dispatch("tickets/remove_tickets", this.ticket.uid);
        this.$emit("close_details");
      },
      async resolve_ticket() {
        this.$store.dispatch("tickets/update_ticket_value", {
          value: { status: { value: 3 } },
          id: this.ticket.uid,
        });

        this.$emit("close_details");
      },
      async download() {
        let files = await ticketService
          .get_file_download_details({
            id: this.ticket.uid,
          })
          .catch((err) => {
            this.handleErrors(err);
          });

        if (files && files.length) {
          files.forEach((attachment) => (attachment["name"] = attachment.fileName));

          let data = {
            attachments: files.map((attachment) => _.pick(attachment, ["name", "url"])),
            name: this.ticket.name,
            type: "ticket",
          };

          this.$eventHub.$emit("download_zip", data);
          this.active = false;
        } else {
          this.$toast.show("This ticket does not have any attachments!", "", this.$store.state.izitoast_options.appWarning);
          this.active = false;
        }
      },

      async takeup_ticket(user) {
        let body = {
          user: {
            uid: user.user_id,
            email: user.email,
          },
        };
        this.$store.dispatch("tickets/update_ticket_value", {
          value: { takenUp: body.user },
          id: this.ticket.uid,
        });

        this.active = false;
      },
      onCopy: function(e) {
        this.copied = true;

        // this.active = false;
      },
      onError: function(e) {
        this.copied = true;

        // this.active = false;
      },
      async watch_ticket() {
        let updated_watchers = [
          ...this.ticket.watchers,
          {
            uid: this.$store.state.user_claims.user_id,
            email: this.$store.state.user_claims.email,
          },
        ];

        this.$store.dispatch("tickets/update_ticket_value", {
          value: { watchers: updated_watchers },
          id: this.ticket.uid,
        });
      },
      async unwatch_ticket() {
        let updated_watchers = [...this.ticket.watchers];

        updated_watchers = _.remove(updated_watchers, (watcher) => {
          return watcher.uid != this.$store.state.user_claims.user_id;
        });

        this.$store.dispatch("tickets/update_ticket_value", {
          value: { watchers: updated_watchers },
          id: this.ticket.uid,
        });
      },
      close_dropdown() {
        this.$emit("close_dropdown");
        this.close_modals();
        this.active = false;
      },
      close_modals() {
        this.showSaveModal = false;
        this.showLoadModal = false;
        this.showDuplicateModal = false;
      },
      toggle_dropdown() {
        this.close_modals();
        this.active = !this.active;
        if (this.active) {
          this.$emit("keep_active");
        } else {
          this.$emit("close_dropdown");
        }
      },
    },
  };
</script>

<style lang="scss">
  .actions-dropdown {
    position: inherit;

    &-selection {
      cursor: pointer;
    }
    &-content {
      background: $white;
      z-index: 10;
      box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
      background-color: #ffffff;
      position: absolute;
      right: 4rem;
      margin-top: 1rem;
      padding: 1rem 0;
      border-radius: 1rem;
      &.is-left {
        top: 32px;
        right: -2rem;
      }
      &.is-action {
        width: 25.6rem;
      }
      &.is-project {
        width: 18rem;
      }
      &:hover {
        background-color: $white;
      }

      .pointer {
        background-color: $white;
        height: 1rem;
        width: 1rem;
        border-top: 1px solid #aaa;
        border-right: 1px solid #aaa;
        transform: rotate(-45deg);
        position: absolute;
        top: -0.5rem;
        left: 65%;
      }
      // @include for-size(portrait-tablets){
      //   position: fixed;
      //   width: 100vw;
      //   max-height: 60vh;
      //   overflow: auto;
      //   bottom: 0;
      //   left: 0;
      //   border-radius: 0rem;
      //   border-top-left-radius: 1rem;
      //   border-top-right-radius: 1rem;
      //   background: white;
      //   z-index: 102;
      //   &.is-action {
      //     width: 100vw;
      //   }
      // }
      &__list {
        margin: 0rem 2rem;
        &--item {
          padding: 1rem;
          border-radius: 2rem;

          &:hover {
            background-color: $primary-background;
            cursor: pointer;
          }
        }
      }

      &__item {
        display: flex;
        align-items: center;
        background-color: $white;
        white-space: nowrap;
        // line-height: 50px;
        padding: 1.3rem 2rem;

        &--icon {
          // max-height: 4rem;
          // max-width: 4rem;
        }
        &--text {
          font-family: Barlow-Medium;
          font-size: 16px;
          font-weight: 500;
          font-stretch: normal;
          font-style: normal;
          letter-spacing: normal;
          text-align: left;
          color: #171e48;
        }
        &:hover {
          background-color: $primary-background;
          cursor: pointer;
        }
        &.is-footer {
          border-top: 1px solid #ddd;
        }
        &.is-not-allowed {
          cursor: not-allowed;
        }
      }
    }
  }

  .actions-backdrop {
    position: fixed;
    background: #000;
    opacity: 0.6;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
  }
  .m-actions-dropdown {
    .actions-dropdown-content {
      // @include for-size(tablet) {
        position: fixed;
        width: 100vw;
        max-height: 60vh;
        overflow: auto;
        bottom: 0;
        left: 0;
        border-radius: 0rem;
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        background: white;
        z-index: 102;
        &.is-action {
          width: 100vw;
        }
      // }
    }
  }

  .viewer-actions-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .template-position {
    position: absolute;
    right: 21rem;
    top: 0;
  }
</style>

<template>
  <task-list v-if="channel || offline" id="mobile-checklist" :ticket="ticket" :channel="channel" :service="apiService"></task-list>
</template>
<script>
  import TaskList from "@/desktop/tickets/components/ticket-details/components/task-list/task-list-section";
  import { ticketService } from "@/desktop/shared/services/";

  export default {
    props: ["ticket", "channel"],
    components: {
      TaskList,
    },
    computed: {
      offline() {
        return this.$store.state.is_offline;
      },
    },
    data() {
      return {
        apiService: ticketService,
      };
    },
  };
</script>
<style lang="scss">
  #mobile-checklist {
    margin: 0;
    height: 100%;
    overflow: scroll;
    padding: 0;
    .demo-modal-class {
      width: 80vw !important;
      left: 10vw !important;
    }
    .checklist-with-value {
      margin: 0;
      padding: 0;
      .task {
        position: relative;
      }
      .tasks {
        position: relative;
        .checlist-task-menu {
          position: absolute;
          right: 5px;
          top: 5px;
        }
        .checklist-task-upload--icon {
          display: block !important;
        }
        .task-list-sub-task {
          display: block !important;
        }
        .task-list-attachment-backdrop {
          position: fixed;
          background: #000;
          opacity: 0.6;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 100;
        }
        .task-attachment {
          position: fixed;
          width: 100vw;
          max-height: 60vh;
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
        .sh-custom-checkbox.is-green::before {
          width: 18px;
          height: 18px;
        }
        .sh-custom-checkbox.is-green:checked::after {
          top: 2px;
          left: 6px;
          height: 10px;
        }
      }

      .progress {
        padding: 15px;
      }
      .checklist-actions--create {
        display: none;
      }
      .checklist-list > div {
        border-top: 1px solid #ccc;
        margin: 0;
      }
      .checklist-item {
        padding: 15px 0px;
        display: flex;
        overflow: hidden;
        &--header * {
          font-size: 14px !important;
        }
        .dropdown {
          display: flex !important;
          padding-right: 5px;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        > div {
          flex: none;
          width: 100%;
          > div {
            width: 100%;
            justify-content: space-between;
          }
        }
        .checklist-input-field--create {
          position: fixed;
          top: 0;
          bottom: 0 !important;
          left: 0;
          border-radius: 0;
          background: white;
          z-index: 1000;
          width: 100vw;
          flex-flow: column;
          padding: 15px;
          border: 0px solid #e6e6e6;
          align-items: flex-start;
          > div {
            &:first-child {
              height: 100vh;
              > * {
                margin-bottom: 40px;
              }
              align-items: flex-start;
              align-content: flex-start;
            }
            flex-wrap: wrap;
          }
          .save-button {
            position: absolute;
            bottom: 15px;
            right: 15px;
          }
        }
        .checklist-divider {
          margin: 10px 0;
        }

        .checklist-task-actions {
          flex-wrap: wrap;
          width: calc(100% - 15px);
          position: relative;
          .username-truncate {
            font-size: 12px !important;
          }
          .checklist-task-actions--description {
            > p {
              margin-left: 5px;
              font-size: 12px !important;
            }
          }
          > div {
            width: 100%;
          }
          .tick-background {
            display: none;
          }
          .checklist-action--icons {
            display: flex;
            justify-content: flex-end;
            .sh-task-notes {
              order: -1;
              margin-right: 10px !important;
            }
          }
          .checklist-action--icons .sh-task-user-dropdown {
            display: none;
            &.has-assignee {
              display: block !important;
            }
            width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-right: 0px;
            margin-left: 10px;
          }
        }
        .checklist-task-list {
          .task {
            margin: 0;
            padding: 0;
            flex-wrap: wrap;
            hr {
              min-width: 1000%;
              position: relative;
              margin: 8px 0;
              left: -100%;
            }
          }
          width: 100vw;
          overflow: hidden;
          margin-left: 0;
          .checklist-grab-icon {
            display: none;
          }
          .checklist-subtask--create * {
            font-size: 14px !important;
          }
          .tasks,
          .checklist-subtask--create,
          .subtask-create {
            padding: 0;
            padding-left: 15px;
          }
        }
      }
    }
    .no-result {
      justify-content: center;
      height: 100%;
      hr {
        display: none;
      }
      .task-no-result-description {
        width: 100%;
        font-size: 12px;
        padding: 10px 40px;
      }
    }
    .sh-dropdown {
      .sh-menu-horizontal {
        display: none;
      }
      .backdrop {
        position: fixed;
        background: #000;
        opacity: 0.6;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 100;
      }
      .sh-menu-vertical {
        width: 16px;
        height: 16px;
        display: block;
      }
    }

    .results {
      height: 165px;
      border-radius: 0px;
      border: 1px solid #ccc;
      border-top: 0;
    }

    .sh-dd-content--options {
      input {
        opacity: 0.4;
      }
    }

    .sh-dropdown-content,
    .sh-dd-content,
    .results {
      user-select: none;
      position: fixed;
      top: unset !important;
      bottom: -7px !important;
      left: 0;
      background: white;
      z-index: 1000;
      width: 100vw !important;
      label,
      p {
        font-size: 14px;
      }
      .sh-dropdown-content__item {
        display: flex;
        align-items: center;
        svg {
          margin-right: 5px;
        }
      }
    }
    .checklist-actions-mobile {
      position: fixed;
      right: 20px;
      bottom: 65px;
      background: #2585d3;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px !important;
      z-index: 1;
    }
    .mobileattachment .card-content .filename {
      font-size: 10px !important;
    }
  }
</style>

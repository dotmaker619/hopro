<template>
  <div class="description-section">
    <skeleton-loading v-if="is_loading">
      <row class="sh-skeletn" v-for="i in 2" :key="i" :gutter="{ top: '10px' }">
        <column v-for="i in 1" :key="i" :span="20" :gutter="10">
          <square-skeleton
            :count="2"
            :boxProperties="{
              top: '12px',
              bottom: '12px',
              width: '100%',
              height: '1.5rem',
            }"
          ></square-skeleton>
        </column>
      </row>
    </skeleton-loading>
    <div class="column editor-size" v-else>
      <div id="editor" class="description-section">{{ description }}</div>
    </div>
  </div>
</template>

<script>
  import { ticketService } from "@/desktop/shared/services/";

  export default {
    props: ["owner", "description", "is_loading", "ticket"],
    mounted() {
      setTimeout(() => {
        ClassicEditor.create(document.querySelector("#editor"), {
          // "ckfinder",
          // "imageStyle:side",
          // "imageStyle:full",
          // "imageTextAlternative",
          // "imageUpload",
          // "selectAll",
          // "indent",
          // "outdent",
          toolbar: [
            "heading",
            "bold",
            "italic",
            "highLight",
            "|",
            "blockQuote",
            "link",
            "numberedList",
            "bulletedList",
            "todoList",
            "insertTable",
            "|",
            "undo",
            "redo",
          ],
          placeholder: "Type here to add description",
        })
          .then((editor) => {
            if (!this.ticket.writeAccess) editor.isReadOnly = true;
            editor.setData(this.ticket.description || "");
            editor.model.document.on("change:data", () => {
              this.update_description(editor.getData());
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }, 100);
    },
    methods: {
      update_description: _.debounce(async function(description) {
        if (this.ticket.writeAccess) {
          this.$store.dispatch("tickets/update_ticket_value", {
            value: {
              description,
            },
            id: this.ticket.uid,
          });
        }
      }, 500),
    },
  };
</script>

<style lang="scss">
  .description-section {
    padding: 4rem;
    @include for-size(smartphones) {
      padding: 1rem;
    }
    .ck.ck-toolbar.ck-toolbar_grouping {
      background-color: #fff;
    }

    .ck.ck-editor__editable_inline {
      border: none;
      border-top: 1px solid transparent;

      &.ck-focused {
        border: 1px solid #c4c4c4;
        box-shadow: none;
      }

      &.ck-blurred {
        border: 1px solid white;
        border-top: 1px solid #c4c4c4;
        box-shadow: none;
      }
    }
  }

  .ck.ck-content {
    font-family: Barlow-Regular;
    .todo-list {
      list-style: none;
    }
    h1 {
      display: block;
      font-size: 2em;
      margin-top: 0.67em;
      margin-bottom: 0.67em;
      margin-left: 0;
      margin-right: 0;
      font-weight: bold;
    }
    h2 {
      display: block;
      font-size: 1.5em;
      margin-top: 0.83em;
      margin-bottom: 0.83em;
      margin-left: 0;
      margin-right: 0;
      font-weight: bold;
    }
    h3 {
      display: block;
      font-size: 1.17em;
      margin-top: 1em;
      margin-bottom: 1em;
      margin-left: 0;
      margin-right: 0;
      font-weight: bold;
    }
    h4 {
      display: block;
      margin-top: 1.33em;
      margin-bottom: 1.33em;
      margin-left: 0;
      margin-right: 0;
      font-weight: bold;
    }
    h5 {
      display: block;
      font-size: 0.83em;
      margin-top: 1.67em;
      margin-bottom: 1.67em;
      margin-left: 0;
      margin-right: 0;
      font-weight: bold;
    }
    h6 {
      display: block;
      font-size: 0.67em;
      margin-top: 2.33em;
      margin-bottom: 2.33em;
      margin-left: 0;
      margin-right: 0;
      font-weight: bold;
    }
    ol {
      display: block;
      list-style-type: decimal;
      margin-top: 1em;
      margin-bottom: 1em;
      margin-left: 0;
      margin-right: 0;
      padding-left: 40px;
    }
    ul {
      display: block;
      list-style-type: disc;
      margin-top: 1em;
      margin-bottom: 1 em;
      margin-left: 0;
      margin-right: 0;
      padding-left: 40px;
    }
  }
  .editor-size {
    max-width: 100%;
  }
</style>

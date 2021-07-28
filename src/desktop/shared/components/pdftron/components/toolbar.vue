<template>
  <div class="webviewer-tools">
    <div
      v-for="tool in tools"
      :key="tool.name"
      class="webviewer-tools-icon"
      :class="{ active: tool.name === active, option: tool.option }"
      @click="
        tool.click(tool);
        open = false;
      "
    >
      <sh-icon
        :file="'pdftron_sprite'"
        :name="tool.name"
        :class="tool.size"
      ></sh-icon>
      <sh-icon
        :file="'pdftron_sprite'"
        :name="'chevron-down'"
        class="is-8x8"
        style="position: absolute; top: 10px; left: 25px"
        v-if="tool.option"
        @click.native.stop.prevent="tool.option ? (open = !open) : ''"
      ></sh-icon>
      <div
        v-if="tool.option && open"
        class="webviewer-tools-icon--option"
        @click.stop
      >
        <div
          v-for="option in tool.option"
          :key="option.name"
          :class="{ active: option.name === active }"
          @click="
            tool.name = option.name;
            tool.toolName = option.toolName;
            tool.click(tool);
            open = false;
          "
        >
          <sh-icon
            :file="'pdftron_sprite'"
            :name="option.name"
            :class="tool.size"
          ></sh-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  props: ["instance", "isMobile", "docViewer"],
  data() {
    return {
      option: false,
      open: false,
      active: "",
      tools: [
        {
          name: "selection",
          size: "is-20x20",
          toolName: "TextSelect",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "highlight",
          size: "is-18x18",
          toolName: "AnnotationCreateTextHighlight",
          subject: "highlight",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "polygon",
          size: "is-16x16",
          toolName: "AnnotationCreatePolygon",
          subject: "shape",
          option: [
            {
              name: "line",
              toolName: "AnnotationCreateLine",
            },
            {
              name: "arrow",
              toolName: "AnnotationCreateArrow",
            },
            {
              name: "polyline",
              toolName: "AnnotationCreatePolyline",
            },
            {
              name: "rectangle",
              toolName: "AnnotationCreateRectangle",
            },
            {
              name: "ellipse",
              toolName: "AnnotationCreateEllipse",
            },
            {
              name: "Cloud",
              toolName: "AnnotationCreatePolygonCloud",
              style: "transform:scale(0.75)",
            },
            {
              name: "polygon",
              toolName: "AnnotationCreatePolygon",
              style: "transform:scale(0.75)",
            },
          ],
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "freeflow",
          size: "is-18x18",
          subject: "shape",
          toolName: "AnnotationCreateFreeHand",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "eraser",
          size: "is-18x18",
          toolName: "AnnotationEraserTool",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "text",
          size: "is-14x14",
          subject: "shape",
          toolName: "AnnotationCreateFreeText",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "comment",
          size: "is-20x20",
          subject: "comment",
          toolName: "AnnotationCreateComment",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "tickets",
          size: "is-20x20",
          subject: "ticket",
          toolName: "AnnotationCreateTicket",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "pan",
          size: "is-20x20",
          toolName: "Pan",
          click: (tool) => {
            this.toolClicked(tool);
          },
        },
        {
          name: "undo",
          size: "is-16x16",
          click: () => {
            this.history.undo();
          },
        },
        {
          name: "redo",
          size: "is-16x16",
          click: () => {
            this.history.redo();
          },
        },
      ],
    };
  },
  created() {
    this.history = this.docViewer.getAnnotationHistoryManager();
    this.$emit("tool-clicked", this.toolClicked);
  },
  mounted() {
    let obj = {};
    this.tools.forEach((d) => {
      obj[d.toolName] = d.subject;
      if (d.option) d.option.forEach((f) => (obj[f.toolName] = d.subject));
    });
    this.$emit("tools-genre", obj);
  },
  methods: {
    toolClicked(tool) {
      if (!tool || this.active === tool.name) {
        this.active = "";
        this.setTool({ toolName: "AnnotationEdit" });
        return;
      }
      this.active = tool.name;
      this.setTool(tool);
    },
    setTool(tool) {
      this.docViewer.setToolMode(this.docViewer.getTool(tool.toolName));
    },
  },
};
</script>

<style lang="scss" scoped>
svg {
  fill: white;
  cursor: pointer;
  opacity: 0.6;
  &:hover {
    opacity: 0.8;
  }
}

.active {
  svg {
    opacity: 1;
  }
}

$size: 18px;
.webviewer {
  &-tools {
    position: fixed;
    left: 15px;
    top: 90px;
    border-radius: 4px;
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.3);
    border: solid 2px rgba(255, 255, 255, 0.15);
    background-color: #0b0b0b;
    width: 50px;
    height: 494px;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0px;
    &-icon {
      position: relative;
      display: flex;
      justify-content: center;
      width: 30px;
      height:30px;
      align-items:center;
      &.active {
        background:rgba($color: #fff, $alpha: 0.1);
      }
      &--option {
        position: absolute;
        width: 120px;
        border-radius: 4px;
        display: flex;
        left: 42px;
        top: 0px;
        flex-wrap: wrap;
        align-items: center;
        box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
        background-color: #ffffff;
        svg {
          fill: black;
          margin:10px;
          opacity:1;
        }
      }
    }
  }
}
</style>

<template>
  <div class="webviewer">
    <heading
      v-if="documentLoaded"
      :bookmark="bookmark"
      :icon="icon"
      :name="name"
      :instance="instance"
      :docViewer="docViewer"
      :isMobile="isMobile"
      :url="url"
      @close="$emit('close')"
      @delete="$emit('delete')"
    >
      <slot></slot>
    </heading>
    <toolbar
      v-if="documentLoaded && toolsEnabled && !isMobile"
      :instance="instance"
      :docViewer="docViewer"
      :isMobile="isMobile"
    ></toolbar>
    <div class="webviewer-viewer" ref="viewer"></div>

    <div v-if="tickets" class="ebs-quick-list">
      <div style="padding: 15px" class="is-flex has-space-between pa-10">
        <span class="is-semiBold-16-600-19 is-flex is-vcenter is-capitalized"
          >Tickets</span
        >
        <sh-icon
          @click.native="tickets = false"
          name="close"
          class="is-16x16 ml-10 is-pointer"
        ></sh-icon>
      </div>
      <div class="ebs-quick-list__items has-slimscroll">
        <ticket-list :is_vertical_window="true" :element="null"></ticket-list>
      </div>
    </div>
    <div class="ebs-quick-list" v-if="showComments && ckeditorLoaded">
      <div style="padding: 10px" class="is-flex has-space-between pa-10">
        <span class="is-semiBold-16-600-19 is-flex is-vcenter is-capitalized"
          >Comments</span
        >
        <sh-icon
          @click.native="showComments = false"
          name="close"
          class="is-16x16 ml-10 is-pointer"
        ></sh-icon>
      </div>
      <div style="height: 100%">
        <comments
          id="mobile-comments"
          :small="true"
          :commentsUnread="0"
          :ticket="{ uid: 'pdftron' }"
          :channelName="'pdftronswq'"
        ></comments>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import WebViewer from "@pdftron/webviewer";
import Heading from "./components/heading";

export default {
  name: "WebViewer",
  components: { Heading },
  props: {
    path: {
      default: `${process.env.BASE_URL}webviewer`,
      type: String,
    },
    name: String,
    url: String,
    icon: String,
    bookmark: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      instance: null,
      documentLoaded: false,
      isMobile: false,
      supported: false,
      docViewer: null,
      toolsEnabled: false,
      tickets: false,
      showComments: false,
      ckeditorLoaded: false,
    };
  },
  beforeDestroy() {
    // document.getElementsByTagName("html")[0].style.overflowY = "auto";
    this.hidebackground(".ticket-details-popup .animation-content", false);
  },
  created() {
    if (!document.getElementById("ckeditor")) {
      var scriptTag = document.createElement("script");
      scriptTag.src =
        "https://cdn.jsdelivr.net/gh/sensehawk/cdn/ckeditor/ckeditor-classic.js";
      scriptTag.id = "ckeditor";
      scriptTag.onload = () => {
        this.ckeditorLoaded = true;
      };
      document.getElementsByTagName("head")[0].appendChild(scriptTag);
    } else {
      this.ckeditorLoaded = true;
    }
  },
  mounted: function () {
    // document.getElementsByTagName("html")[0].style.overflowY = "hidden";
    this.hidebackground(".ticket-details-popup .animation-content", true);
    let extension = this.name.split(".").pop();
    this.isMobile = this.$route.meta.screen == "mobile";
    WebViewer(
      {
        path: this.path,
        initialDoc: this.url, // replace with your own PDF file
        css: `${process.env.BASE_URL}pdftron.css`,
        extension: extension,
        disabledElements: [
          "header",
          "ribbons",
          "toolsHeader",
          "searchButton",
          "menuButton",
          "leftPanelButton",
          "outlinesPanel",
          "bookmarksPanel",
          "thumbnailControl",
          "documentControl",
          "outlinesPanelButton",
          "contextMenuPopup",
          "notesPanel",
        ],
      },
      this.$refs.viewer
    ).then((instance) => {
      this.documentLoaded = true;
      this.instance = instance;
      this.supported = instance.CoreControls.SupportedFileFormats.CLIENT.indexOf(
        extension.toLowerCase()
      );
      if (this.supported === -1) {
        this.$toast.show(
          "File Format not supported",
          "",
          this.$store.state.izitoast_options.appError
        );
        this.$emit("close");
        return;
      }
      this.instance.setTheme("dark");
      const { docViewer, annotManager, Annotations, Tools } = instance;
      this.docViewer = docViewer;
      this.zoomValue = docViewer.getZoom();
    });
  },
  methods: {
    download() {
      window.open(this.url, "_blank");
    },
    hidebackground(q, b) {
      const div = document.querySelector(q);
      if (!div) return;
      div.style.overflowY = b ? "hidden" : "auto";
    },
    setTooltip(targetElement) {
      this.instance.setAnnotationContentOverlayHandler((annotation) => {
        const div = targetElement.cloneNode(true);
        var styledChildren = targetElement.getElementsByTagName("*");
        var children = div.getElementsByTagName("*");
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var styles = document.defaultView.getComputedStyle(styledChildren[i]);
          for (var prop = 0; prop.length; prop++) {
            child.style[styles[prop]] = styles.getPropertyValue(styles[prop]);
          }
        }
        return div;
      });
    },
    addTextPopup() {
      const { docViewer } = this.instance;
      const contextMenuItems = this.instance.textPopup.getItems();

      this.instance.textPopup.add(
        {
          type: "actionButton",
          label: "Zoom out",
          onClick: () => docViewer.zoomTo(docViewer.getZoom() - 0.25),
        },
        contextMenuItems[5].dataElement
      );
    },
  },
};
</script>

<style lang="scss">
.webviewer {
  iframe {
    height: 100%;
  }
}
</style>
<style lang="scss" scoped>
svg {
  fill: white;
}
$size: 18px;
.webviewer {
  font-size: $size;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 100;
  display: flex;
  flex-flow: column;
  background-color: rgba(0, 0, 0, 0.8);
  &-viewer {
    width: 100%;
    margin: 0px auto;
    margin-bottom: 20px;
    padding: 0px 64px;
    @include for-size(tablet) {
      padding: 0px;
      margin-bottom: 0px;
    }
    flex: 1;
  }
}
</style>

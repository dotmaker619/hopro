<template>
  <div class="webviewer">
    <heading
      v-if="documentLoaded"
      :bookmark="bookmark"
      :icon="icon"
      :name="name"
      :id="uid"
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
      @tool-clicked="toolClicked = $event"
      @tools-genre="toolsGenre = $event"
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
        <ticket-list
          :is_vertical_window="true"
          :element="ticketQuery" :customclass="'is-relative'"
        ></ticket-list>
      </div>
    </div>
    <div class="ebs-quick-list" v-if="commentsChannel && ckeditorLoaded" v-show="showComments">
      <div style="padding: 10px;position:absolute;width:100%;" class="is-flex has-space-between pa-10">
        <span class="is-semiBold-16-600-19 is-flex is-vcenter is-capitalized"
          >Comments</span
        >
        <sh-icon
          @click.native="showComments = false"
          name="close"
          class="is-16x16 ml-10 is-pointer"
        ></sh-icon>
      </div>
      <div style="padding-top:40px;height:100%">
        <comments
          id="mobile-comments"
          :small="true"
          :commentsUnread="0"
          :ticket="{ uid: 'pdftron' }"
          :channelName="commentsChannel"
          :dataUid="commentsQuery"
          :is_vertical_window="true"
        ></comments>
      </div>
    </div>
    <div class="tooltip-annot" style="display:none;">
        <div :ref="`tooltip_unknown`" style="display:flex;align-items:center;">
          <user-avatar :user="'unknown'" :pxsize="20" :avatarfontsize="12" class="mr-5" style="width:24px;height:24px;margin-right:5px;" :custom_class="'tiny-user-avatar'"></user-avatar>
          <p style="margin:0;" class="is-medium-13-500-16 has-text-blue-grey truncate-text is-width-10" >unknown</p>
        </div>
        <div :ref="`tooltip_${annotUser.uid}`" v-for="annotUser in annotOwners" :key="annotUser.uid" style="display:flex;align-items:center;">
          <user-avatar :user="annotUser" :pxsize="20" :avatarfontsize="12" class="mr-5" style="width:24px;height:24px;margin-right:5px;" :custom_class="'tiny-user-avatar'"></user-avatar>
          <p style="margin:0;" class="is-medium-13-500-16 has-text-blue-grey truncate-text is-width-10" v-username="annotUser"></p>
        </div>
    </div> 
  </div>
</template>

<script>
/* eslint-disable */
import WebViewer from "@pdftron/webviewer";
import Heading from "./components/heading";
import Toolbar from "./components/toolbar";
import TicketList from "@/desktop/tickets/components/tickets-list/tickets-list";
import { annotationService } from "@/desktop/shared/services/";
import Comments from "@/mobile/modules/tickets/components/ticket-details/components/comments";
import AddUsers from "@/desktop/shared/components/add-users-modal";
import AddTeams from "@/desktop/shared/components/add-teams-modal";

export default {
  name: "WebViewer",
  components: { Heading, Toolbar, Comments, TicketList },
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
    targetElement: Object,
    uid: String,
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
      toolClicked: null,
      annotManager: null,
      idMap: {},
      annotMap: {},
      toolsGenre: {},
      commentsChannel: null,
      ticketQuery: null,
      ownerMap:{}
    };
  },
  beforeDestroy() {
    // document.getElementsByTagName("html")[0].style.overflowY = "auto";
    this.hidebackground(".ticket-details-popup .animation-content", false);
    this.$store.state.PUSHER.unsubscribe(
      `private-annotations-org_${this.$store.state.claims.user_organization}`
    );
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
  computed:{
    annotOwners(){
      return Object.values(this.ownerMap);
    },
  },
  mounted: function () {
    // document.getElementsByTagName("html")[0].style.overflowY = "hidden";
    this.hidebackground(".ticket-details-popup .animation-content", true);
    let extension = this.name.split(".").pop();
    this.isMobile = this.$route.meta.screen == "mobile";
    this.channel = this.$store.state.PUSHER.subscribe(
      `private-annotations-org_${this.$store.state.current_organization.uid}`
    );
    this.commentsChannel = this.uid;
    this.channel.bind("ANNOTATIONS_UPDATED", (data) => {
      if (this.targetElement.uid === data.elementUid) {
        let q = "";
        data.uids.forEach((d) => (q += `&annotationUid=${d}`));
        this.getAllAnnotations(q, data.uids);
      }
    });
    this.channel.bind("ANNOTATIONS_CREATED", (data) => {
      if (this.targetElement.uid === data.elementUid) {
        let q = "";
        data.uids.forEach((d) => (q += `&annotationUid=${d}`));
        this.getAllAnnotations(q, data.uids);
      }
    });
    this.channel.bind("ANNOTATIONS_REMOVED", (data) => {
      if (this.targetElement.uid === data.elementUid) {
        let q = "";
        data.uids.forEach((d) => (q += `&annotationUid=${d}`));
        this.getAllAnnotations(q, data.uids);
      }
    });
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
      const {
        docViewer,
        annotManager,
        Annotations,
        Tools,
        CoreControls,
      } = instance;
      this.annotManager = annotManager;
      this.setTooltip();
      // let claims = this.$store.state.claims,user;
      // if (claims.firstname)
      //   user = claims.firstname + " " + claims.lastname;
      // else if (claims.email) user = claims.email;
      // else user = claims.user_id;
      // annotManager.setCurrentUser(user);
      this.docViewer = docViewer;
      this.zoomValue = docViewer.getZoom();
      const tool = docViewer.getTool("AnnotationCreateFreeText");
      tool.on("annotationAdded", (annotation) => {
        annotation.Font = "Barlow";
      });
      if (this.$store.getters.annotation_tools && this.targetElement) {
        docViewer.on("documentLoaded", () => {
          this.getAllAnnotations();
        });
        docViewer.on("keyDown", (e) => {
          if (e.key === "Escape") {
            this.toolClicked();
          }
        });
        instance.annotationPopup.add({
          type: "customElement",
          render: this.renderCustomButton(),
        });
        this.toolsEnabled = true;
        this.addCustomAnnotation({
          docViewer,
          annotManager,
          Annotations,
          Tools,
          instance,
          ticketToolName: "AnnotationCreateComment",
          name: "comment",
          drawPath: (ctx, StrokeColor) => {
            var svgPath = new Path2D(
              "M20.194-1.332H3.808A4.006 4.006 0 0 0 .854.1 3.6 3.6 0 0 0 0 2.535v12.479a3.842 3.842 0 0 0 3.794 3.866l2.6.069.327 3.719 7.09-3.788h6.386A3.842 3.842 0 0 0 24 15.014V2.535a3.841 3.841 0 0 0-3.807-3.867z"
            );
            var svgPath1 = new Path2D(
              "M13.959 13.806a1.9 1.9 0 0 1 1.846 1.849 1.846 1.846 0 1 1-3.691 0 1.879 1.879 0 0 1 1.845-1.849zm5.53 0a1.9 1.9 0 0 1 1.85 1.849 1.847 1.847 0 1 1-3.694 0 1.879 1.879 0 0 1 1.845-1.849zm5.534 0a1.9 1.9 0 0 1 1.846 1.849 1.879 1.879 0 0 1-1.846 1.851 1.86 1.86 0 0 1-1.845-1.851 1.879 1.879 0 0 1 1.845-1.849z"
            );
            ctx.translate(4, 5);
            ctx.fillStyle = StrokeColor;
            ctx.fill(svgPath);
            ctx.translate(-8, -7);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill(svgPath1);
          },
        });
        this.addCustomAnnotation({
          docViewer,
          annotManager,
          Annotations,
          Tools,
          instance,
          ticketToolName: "AnnotationCreateTicket",
          name: "ticket",
          drawPath: (ctx, StrokeColor) => {
            var svgPath = new Path2D(
              "M19.35 29.53l-1.664-1.714a1.693 1.693 0 0 0-.342-1.729 1.6 1.6 0 0 0-1.111-.459 1.572 1.572 0 0 0-.562.108l-1.668-1.706v-.014l8.066-8.319.365.141.324-.239.014-.408-.094-.122 1.57-1.622h.014l.848.881a.44.44 0 0 0 .3.3l.5.53a1.7 1.7 0 0 0 .336 1.729 1.575 1.575 0 0 0 1.113.456 1.593 1.593 0 0 0 .564-.1l1.664 1.715-.881.923-.023.028-.041.023a.628.628 0 0 0-.053.07l-7.686 7.911a.436.436 0 0 0-.287.3l-1.27 1.312zm7.564-9.842l-.324.225-.014.4.094.126.295.324.371.122.324-.234.014-.394-.084-.136-.314-.31zm-1.232-1.27l-.309.225-.016.4.08.126.314.324.365.126.309-.225.016-.408-.08-.126-.314-.319zm-1.219-1.256l-.328.221-.014.408.094.126.3.3.367.141.322-.239.014-.408-.094-.122-.3-.3zm-1.232-1.27l-.314.22-.014.408.084.127.311.318.365.126.313-.225.016-.4-.086-.126-.309-.323zm-.85 13.2h-.014l-.68-.712 7.256-7.485.137.141a.4.4 0 0 0 .3.131h.018a.421.421 0 0 0 .293-.123.464.464 0 0 0 0-.637l-.131-.141.646-.684a.907.907 0 0 0 0-1.242l-1.822-1.87a.42.42 0 0 0-.307-.132.415.415 0 0 0-.219.062.792.792 0 0 1-.424.125.806.806 0 0 1-.58-.251.859.859 0 0 1-.121-1.031.449.449 0 0 0-.066-.543l-.5-.534 1.1-1.158h.014l1.654 1.72a1.684 1.684 0 0 0 .338 1.729 1.559 1.559 0 0 0 1.105.454 1.58 1.58 0 0 0 .572-.107l1.664 1.706v.019l-10.24 10.564z"
            );
            ctx.translate(-9, -6);
            ctx.fillStyle = StrokeColor;
            ctx.beginPath();
            ctx.arc(24, 21, 15, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#FFFFFF";
            ctx.fill(svgPath);
          },
        });
      }
      annotManager.on("annotationSelected", (annotations, action) => {
        if (action === "selected") {
          this.$emit("select");
          let state = {comment:this.showComments,tickets:this.tickets};
          this.commentsQuery = this.idMap[annotations[0].Id].uid;
          this.tickets = false;
          this.showComments = false;
          this.$nextTick(()=>{
          if (annotations[0].Subject === "ticket"||state.tickets) {
            this.showTicketsBox(annotations[0].Id);
          } else if (annotations[0].Subject === "comment"||state.comment) {
            this.showCommentsBox(annotations[0].Id);
          }
          });
        } else if (action === "deselected") {
          this.$emit("deselect");
        }
        if (annotations === null && action === "deselected") {
          this.$emit("deselectAll");
        }
      });
      annotManager.on(
        "annotationChanged",
        (annotations, action, { imported }) => {
          if (imported) {
            return;
          }
          if (action === "add") {
            if (this.toolClicked && annotations[0].Subject === "ticket") {
              this.toolClicked();
            } else if (
              this.toolClicked &&
              annotations[0].Subject === "comment"
            ) {
              this.toolClicked();
            }
            annotManager
              .exportAnnotations({
                widgets: false,
                links: false,
                fields: false,
                annotList: [annotations[0]],
              })
              .then((xfdfData) => {
                if (this.targetElement) {
                  annotationService
                    .add_annotation({
                      body: {
                        name: "ANNOTATION ROLEINTERNAL",
                        targetElement: this.targetElement,
                        type: this.toolsGenre[annotations[0].ToolName],
                        annotationData: xfdfData,
                        organization: this.$store.state.claims
                          .user_organization,
                        public: 1,
                      },
                    })
                    .then((d) => {
                      this.idMap[annotations[0].Id] = d.data;
                      if (
                        (this.toolClicked &&
                          annotations[0].Subject === "ticket") ||
                        annotations[0].Subject === "comment"
                      ) {
                        annotManager.selectAnnotation(annotations[0]);
                      }
                    });
                }
              });
          } else if (action === "modify") {
            annotations.forEach((d) =>
              annotManager
                .exportAnnotations({
                  widgets: false,
                  links: false,
                  fields: false,
                  annotList: [d],
                })
                .then((xfdfData) => {
                  annotationService.update_annotation({
                    id: this.idMap[d.Id].uid,
                    body: {
                      annotationData: xfdfData,
                    },
                  });
                })
            );
            console.log("this change modified annotations");
          } else if (action === "delete") {
            annotations.forEach((d) =>
              annotationService.delete_annotation({
                id: this.idMap[d.Id].uid,
              })
            );
            console.log("there were annotations deleted");
          }
        }
      );
    });
  },
  methods: {
    showCommentsBox(annotationID){
       if (this.idMap[annotationID]) {
              this.showComments = true;
              this.tickets=false;
       }
    },
    showTicketsBox(annotationID){
            if (this.idMap[annotationID]) {
              this.ticketQuery = {
                dataUid: this.idMap[annotationID].uid,
                ...this.targetElement,
              };
              this.tickets = true;
              this.showComments = false;
            }
    },
    getAllAnnotations(id = "", uidList) {
      let annot = annotationService.getAll({
        query: `element=${this.targetElement.uid}${id}`,
      });
      let isExist = {};
      annot.then((data) => {
        data.data.forEach((d) => {
          let users=_.filter(this.$store.state.users || [],(u) =>!!d.users[u.uid]);
          let labels=_.filter(this.$store.state.teams || [],(u) =>!!d.labels[u.uid]);
          d.readUsers=_.filter(users || [],(u) =>d.users[u.uid]==="read");
          d.writeUsers=_.filter(users || [],(u) =>d.users[u.uid]==="write");
          d.readLabels=_.filter(labels || [],(u) =>d.labels[u.uid]==="read");
          d.writeLabels=_.filter(labels || [],(u) =>d.labels[u.uid]==="write");
          isExist[d.uid] = true;
          if(this.$store.getters.state_users[d.owner])
          this.$set(this.ownerMap,d.owner,this.$store.getters.state_users[d.owner]);
          this.annotManager
            .importAnnotations(d.annotationData)
            .then((annot) => annot.forEach((f) =>{ 
              f.ReadOnly=!d.writeAccess;
              this.annotMap[d.uid]=f; 
              this.idMap[f.Id] = d;
              // f.ReadOnly = true;
            }));
        });
        if(uidList){
          uidList.forEach(d=>{
            if(!isExist[d]){
              this.annotManager.deleteAnnotation(this.annotManager.getAnnotationById(this.annotMap[d].Id),true);
            } 
          });
        }
      });
    },
    renderCustomButton() {
      const eye = require(`@/assets/icons/pdftron/eye.svg`);
      const eyeClose = require(`@/assets/icons/pdftron/eyeclosed.svg`);
      const user = require(`@/assets/icons/pdftron/users.svg`);
      const team = require(`@/assets/icons/pdftron/teams.svg`);
      const comment = require(`@/assets/icons/pdftron/comments.svg`);
      const ticket = require(`@/assets/icons/pdftron/tickets.svg`);
      const [eyeButton, eyeImage, eyeBubble] = this.createCustomButton(eye);
      const [userButton, userImage, userBubble] = this.createCustomButton(user);
      const [teamButton, teamImage, teamBubble] = this.createCustomButton(team);
      const [ticketButton, ticketImage, ticketBubble] = this.createCustomButton(
        ticket
      );
      const [
        commentButton,
        commentImage,
        commentBubble,
      ] = this.createCustomButton(comment);
      eyeButton.onclick = () => {
        let annot = this.idMap[
          this.annotManager.getSelectedAnnotations()[0].Id
        ];
        this.change_access(annot,userBubble,teamBubble);
        eyeImage.src = annot.public === 0 ? eyeClose : eye;
        userButton.style.display = annot.public === 1 ? "none" : "initial";
        teamButton.style.display = annot.public === 1 ? "none" : "initial";
      };
      userButton.onclick = () => {
        this.add_users(
          this.idMap[this.annotManager.getSelectedAnnotations()[0].Id],
          userBubble
        );
      };
      teamButton.onclick = () => {
        this.add_teams(
          this.idMap[this.annotManager.getSelectedAnnotations()[0].Id],
          teamBubble
        );
      };
      ticketButton.onclick = () => {
       this.showTicketsBox(this.annotManager.getSelectedAnnotations()[0].Id);
      };
      commentButton.onclick = () => {
        this.showCommentsBox(this.annotManager.getSelectedAnnotations()[0].Id);
      };
      eyeBubble.setAttribute("style", "display:none");
      ticketBubble.setAttribute("style", "display:none");
      commentBubble.setAttribute("style", "display:none");
      let span = document.createElement("div");
      span.setAttribute("style", "display:flex");
      span.appendChild(eyeButton);
      span.appendChild(userButton);
      span.appendChild(teamButton);
      span.appendChild(commentButton);
      span.appendChild(ticketButton);
      const renderEye = () => {
        let annot = this.idMap[
          this.annotManager.getSelectedAnnotations()[0].Id
        ];
        if (annot) {
          if(!annot.writeAccess){
             return;
          }
          if (
            this.annotManager.getSelectedAnnotations()[0].Subject ===
              "ticket" ||
            this.annotManager.getSelectedAnnotations()[0].Subject === "comment"
          ) {
            ticketButton.setAttribute("style", "display:none");
            commentButton.setAttribute("style", "display:none");
          } else {
            ticketButton.setAttribute("style", "");
            commentButton.setAttribute("style", "");
          }
          eyeImage.src = annot.public === 0 ? eyeClose : eye;
          try {
            userBubble.innerHTML =
              annot.readUsers.length + annot.writeUsers.length;
            userBubble.setAttribute(
              "style",
              annot.readUsers.length + annot.writeUsers.length > 0
                ? "display:block"
                : "display:none"
            );
            teamBubble.innerHTML =
              annot.readLabels.length + annot.writeLabels.length;
            teamBubble.setAttribute(
              "style",
              annot.readLabels.length + annot.writeLabels.length > 0
                ? "display:block"
                : "display:none"
            );
          } catch (e) {
            userBubble.setAttribute("style", "display:none");
            teamBubble.setAttribute("style", "display:none");
          }
          userButton.style.display = annot.public === 1 ? "none" : "initial";
          teamButton.style.display = annot.public === 1 ? "none" : "initial";
        }
        return span;
      };
      return renderEye;
    },
    createCustomButton(eye) {
      const eyeImg = document.createElement("img");
      eyeImg.src = eye;
      const bubble = document.createElement("span");
      bubble.setAttribute("class", "ActionButtonBubble");
      const button = document.createElement("button");
      button.setAttribute("class", "Button ActionButton");
      button.appendChild(eyeImg);
      button.appendChild(bubble);
      return [button, eyeImg, bubble];
    },
    download() {
      window.open(this.url, "_blank");
    },
    hidebackground(q, b) {
      const div = document.querySelector(q);
      if (!div) return;
      div.style.overflowY = b ? "hidden" : "auto";
    },
    setTooltip() {
      this.instance.setAnnotationContentOverlayHandler((annotation) => {
        try{
        let owner=this.$refs[`tooltip_${this.idMap[annotation.Id].owner}`];  
        let targetElement = owner?owner[0]:this.$refs[`tooltip_unknown`];
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
        }
        catch(e){
          console.log(e);
        }
      });
    },
    change_access(details,userBubble,teamBubble) {
      details.public = details.public === 1 ? 0 : 1;
      annotationService
        .update_annotation({
          id: details.uid,
          body: {
            public: details.public,
            readUsers:[],
            writeUsers:[],
            readLabels:[],
            writeLabels:[]
          },
        })
        .catch((err) => this.handleErrors(err));
      userBubble.setAttribute("style","display:none");
      teamBubble.setAttribute("style","display:none");
    },
    add_users(details, userBubble) {
      this.$modal.show(
        AddUsers,
        {
          users: [
            ...(details.readUsers || []).map((u) => ({
              ...u,
              access: "read",
            })),
            ...(details.writeUsers || []).map((u) => ({
              ...u,
              access: "write",
            })),
          ],
          complete: async (e) => {
            const readUsers = e
              .filter((u) => u.access === "read")
              .map((u) => u.uid);
            const writeUsers = e
              .filter((u) => u.access === "write")
              .map((u) => u.uid);
            details.readUsers = readUsers;
            details.writeUsers = writeUsers;
            let total = details.readUsers.length + details.writeUsers.length;
            userBubble.setAttribute(
              "style",
              total > 0 ? "display:block" : "display:none"
            );
            userBubble.innerHTML = total;
            annotationService
              .update_annotation({
                id: details.uid,
                body: {
                  readUsers,
                  writeUsers,
                },
              })
              .catch((err) => this.handleErrors(err));
          },
        },
        { height: "80%" },
        { name: "add-vault-users" }
      );
    },
    add_teams(details, teamBubble) {
      this.$modal.show(
        AddTeams,
        {
          teams: [
            ...(details.readLabels || []).map((u) => ({
               ...u,
              access: "read",
            })),
            ...(details.writeLabels || []).map((u) => ({
              ...u,
              access: "write",
            })),
          ],
          complete: async (e) => {
            let readLabels = e
              .filter((u) => u.access === "read")
              .map((u) => u.uid);
            let writeLabels = e
              .filter((u) => u.access === "write")
              .map((u) => u.uid);
            details.readLabels = readLabels;
            details.writeLabels = writeLabels;
            let total = details.readLabels.length + details.writeLabels.length;
            teamBubble.setAttribute(
              "style",
              total > 0 ? "display:block" : "display:none"
            );
            teamBubble.innerHTML = total;
            annotationService
              .update_annotation({
                id: details.uid,
                body: {
                  readLabels,
                  writeLabels,
                },
              })
              .catch((err) => this.handleErrors(err));
          },
        },
        { height: "80%" }
      );
    },
    addCustomAnnotation({
      docViewer,
      annotManager,
      Annotations,
      Tools,
      instance,
      ticketToolName,
      name,
      drawPath,
    }) {
      const TicketAnnotation = function () {
        Annotations.StickyAnnotation.call(this);
        this.Subject = name;
        this.ToolName = ticketToolName;
      };
      TicketAnnotation.prototype = new Annotations.StickyAnnotation();
      TicketAnnotation.prototype.elementName = name;
      TicketAnnotation.prototype.draw = function (ctx, pageMatrix) {
        this.setStyles(ctx, pageMatrix);
        drawPath(ctx, this.StrokeColor);
      };

      const TicketSelectionModel = function (annotation, canModify) {
        Annotations.StickySelectionModel.call(this, annotation, canModify);
      };

      TicketSelectionModel.prototype = new Annotations.StickySelectionModel();
      TicketAnnotation.prototype.selectionModel = TicketSelectionModel;
      const TicketCreateTool = function (docViewer) {
        Tools.GenericAnnotationCreateTool.call(
          this,
          docViewer,
          TicketAnnotation
        );
      };

      TicketCreateTool.prototype = new Tools.GenericAnnotationCreateTool();
      const mouseUp = Tools.StickyCreateTool.prototype.mouseLeftUp;
      const mouseDown = Tools.StickyCreateTool.prototype.mouseLeftDown;
      TicketCreateTool.prototype.mouseLeftDown = function () {
        mouseDown.apply(this, arguments);
      };

      TicketCreateTool.prototype.mouseLeftUp = function () {
        if (
          this.pageCoordinates[1] &&
          (!this.Lb || this.yq || this.overrideSelection)
        ) {
          const pagePoint = this.pageCoordinates[1];
          const pageNumber = pagePoint.pageNumber;
          const ticket = new TicketAnnotation();
          ticket.PageNumber = pageNumber;
          ticket.X = pagePoint.x;
          ticket.Y = pagePoint.y;
          ticket.StrokeColor.B = Math.floor(Math.random() * 256);
          ticket.StrokeColor.G = Math.floor(Math.random() * 256);
          ticket.StrokeColor.R = Math.floor(Math.random() * 256);
          ticket.Author = annotManager.getCurrentUser();
          annotManager.deselectAllAnnotations();
          annotManager.addAnnotation(ticket);
          annotManager.redrawAnnotation(ticket);
        } else {
          mouseUp.apply(this, arguments);
        }
      };

      // register the annotation type so that it can be saved to XFDF files
      annotManager.registerAnnotationType(
        TicketAnnotation.prototype.elementName,
        TicketAnnotation
      );

      const ticketTool = new TicketCreateTool(docViewer);
      instance.registerTool(
        {
          toolName: ticketToolName,
          toolObject: ticketTool,
          buttonImage:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">' +
            '<path d="M12 7.77L18.39 18H5.61L12 7.77M12 4L2 20h20L12 4z"/>' +
            '<path fill="none" d="M0 0h24v24H0V0z"/>' +
            "</svg>",
          buttonName: "triangleToolButton",
          tooltip: "Triangle",
        },
        TicketAnnotation
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
  z-index: 40;
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
.ebs-quick-list {
  width: 360px;
  height: calc( 100% - 100px );
  position: fixed;
  right: 65px;
  top: 75px;
  padding: 0;
  display: flex;
  flex-flow: column;
  border-radius: 4px;
  box-shadow: 2px 2px 8px -2px #333;
}
</style>

<template>
  <div class="attachment-popup-viewer">
    <div class="top-section is-inline-flex align-center">
        <div class="is-pointer" @click="close_popup()">
            <sh-icon :name="'ticket-detail-close'" class="is-14x14 mr-5" />
        </div>
        <p class="is-medium-14-500-17 ml-10">{{file.fileName}}</p>
    </div>
    <div class="attachment-image mt-20 mb-20">
        <img class="image" :src="file.thumbnails.large||file.thumbnails.small">
    </div>
    <div class="is-inline-flex align-center mb-5">
        <p class="is-medium-18-500-22">{{file.fileName|truncate-middle}}</p>
        <div class="is-pointer ml-5" @click="bookmark_attachment">
            <sh-icon :name="file.pinned ? 'bookmarked-highlight' : 'bookmark'"
            class="is-18x18 mr-10"
            />
        </div>
    </div>
    <div class="date mb-30">
        <p class="is-regular-14-00-17 has-text-grey ">
        {{ file.createdAt | dateFormat}}
        </p>
    </div>
    <div class="uploaded-from mb-30">
        <p class="is-regular-14-00-17 has-text-grey mb-5">Uploaded from </p>
        <p class="is-inline-flex align-center">
            <svg v-if="file.foreignObjectType!=='ticket'"
            viewBox="0 0 16 16"
            class="is-14x14 mr-5"
            >
            <use :xlink:href="require('@/assets/icons/tickets_sprite.svg')+'#foreign-'+file.foreignObjectType" />
            </svg>
            <span class="is-medium-14-500-17 is-capitalized">{{file.foreignObjectType}}s</span>
        </p>
    </div>
    <div class="uploaded-by">
        <p class="is-regular-14-00-17 has-text-grey mb-5">Uploaded by </p>
        <div class="is-inline-flex align-center">
            <figure class="image is-36x36">
                <user-avatar
                :user="file.owner"
                :pxsize="24"
                :custom_class="'tiny-user-avatar'"
                ></user-avatar>
            </figure>
            <span class="is-medium-14-500-17 mb-15 is-capitalized" v-username="$store.getters.state_users[file.owner.uid]"></span>
        </div>
    </div>
    <div class="download-viewer-attachment is-flex is-center padding-10">
        <div class="button is-fullwidth is-outlined is-large ">
            <p @click.stop.self="download" class="is-inline-flex align-center is-medium-14-500-17"><sh-icon class="image  is-18x18 mr-10" :name="'download-blue'" :file="'tickets_sprite'"></sh-icon>
                Download</p>
        </div>
    </div>
  </div>
</template>

<script>
import { ticketService } from "@/desktop/shared/services/";
export default {
    methods: {
        close_popup(){
            this.$emit('close');
        },
        download(){
            window.open(this.file.url, "_blank");
        },
        async bookmark_attachment(){
            this.file.pinned = !this.file.pinned
            let res = await ticketService
            .update_attachment_data({
                id: this.ticket.uid,
                file_id: this.file.uid,
                body: {
                    pinned: !this.file.pinned
                }
            })
            .then(() => this.$emit("refresh_attachments"))
            .catch(err => this.handleErrors(err));
        }
    },
    props: ['file','ticket']
}
</script>

<style lang="scss">
.attachment-details-popup {
  .animation-content {
    background: white;
    z-index: 120;
    border-radius: 0;
  }
}
.attachment-popup-viewer {
    color: black;
    background: white;
    height: 100vh;
    padding: 2rem 1.4rem;
    .attachment-image {
        max-height: 44vh;
        overflow: auto;
        img {
            width: 100%;
            max-width: 100vw;
            object-fit: contain;
        }
    }
    .download-viewer-attachment {
        
        .button {
            // width: 280px;
            margin: 3rem auto;
            height: 44px;
            border-radius: 6px;
            color: $primary;
            box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
            border: solid 1.5px #2585d3;
        }
    }
}
</style>
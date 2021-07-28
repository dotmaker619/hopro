<template>
    <activity-block :mobile_view="mobile_view" :activity="activity">
        <template #activity-description>
           <slot name="activity-description"></slot>
        </template>
        <template #activity-details>        
            <p v-if="file_name" :class="{'text--strike-through' : delete_verb}" class="is-medium-14-500-17 px-10 py-5 is-inline-flex align-center bordered--file">                
                <span v-if="mobile_view" v-tooltip="file_name.length > text_truncate_length ? file_name : ''">{{ file_name | truncate(text_truncate_length) }}</span>
                <span v-else>{{ file_name }}</span>
                <a v-if="!activity.object.data.is_deleted && !delete_verb" @click="download( {uid: file_uid, rootFolder:''})">
                    <sh-icon
                        class="ml-10 is-pointer is-14x14"
                        :file="'tickets_sprite'"
                        :name="'download-blue'"
                    ></sh-icon>
                </a>
            </p>
        </template>
    </activity-block> 
</template>

<script>
import { fileService } from "@/desktop/shared/services/";
import ActivityBlock from "./activity-block";

export default {
    props: {
        activity: {
            required: true
        },
        mobile_view: {
            type: Boolean,
            default: false,
            required: false
        },
        text_truncate_length: {
            type: Number,
            default: 17,
            required: false
        },
        file: {
            required: false,
            type: Object
        }
    },
    components: {
        ActivityBlock
    },
    methods: {
      download (file) {
        fileService
          .get_file_download_url({
            id: file.uid,
            headers: this.get_password_header(file.rootFolder)
          })
          .then(res => {
            window.open(res.data, "_blank");
          });
      }
    },
    computed: {
        file_name () {
            return this.file ? (this.file.name || this.file.filename) : this.activity.object.data.name;
        },
        file_uid () {
            return this.file ? this.file.uid : this.activity.object.id;
        },
        delete_verb () {
            return this.activity.verb.toLowerCase().includes('delete');
        }
    }
}
</script>
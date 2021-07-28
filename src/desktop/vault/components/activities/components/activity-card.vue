<template>
  <div class="activity-details">
    <folder-activity
      :mobile_view="mobile_view"
      :activity="activity"
      v-if="activity.verb == 'DELETE_CHILD_FOLDER'"
    >
      <template #activity-description>deleted a child folder</template>
    </folder-activity>
    <folder-activity
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'DELETE_FOLDER'"
    >
      <template #activity-description>deleted the folder</template>
    </folder-activity>
    <ownership-activity
      :mobile_view="mobile_view"
      :activity="activity"
      :text_truncate_length="text_truncate_length"
      v-else-if="activity.verb == 'UPDATE_FOLDER' && activity.attributes.owner"
    />
    <folder-activity
    :mobile_view="mobile_view"
    :activity="activity"
     v-else-if="activity.verb == 'UPDATE_FOLDER'">
      <template #activity-description>
        updated the folder
      </template>
    </folder-activity>
    <folder-activity
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'CREATE_FOLDER'"
    >
      <template #activity-description>created a new folder</template>
    </folder-activity>
    <div v-else-if="activity.verb == 'UPDATE_USERS'">
      <users-activity :display_time="!(mobile_view && filtered_list_of_users.users_removed.length)" :mobile_view="mobile_view" :activity="activity" v-if="filtered_list_of_users.users_added.length" :list_of_users="filtered_list_of_users.users_added">
        <template #activity-description>
            added {{filtered_list_of_users.users_added.length}} {{ display_entry_based_on_length(filtered_list_of_users.users_added.length, 'user') }}
        </template>
      </users-activity>
      <users-activity :display_time="!filtered_list_of_users.users_added.length || (mobile_view && filtered_list_of_users.users_added.length)" :mobile_view="mobile_view" :activity="activity" v-if="filtered_list_of_users.users_removed.length" :list_of_users="filtered_list_of_users.users_removed" :strike_users="true">
        <template #activity-description>
            removed {{filtered_list_of_users.users_removed.length}} {{ display_entry_based_on_length(filtered_list_of_users.users_removed.length, 'user') }}
        </template>
      </users-activity>
    </div>
    <div v-else-if="activity.verb == 'UPDATE_LABELS'">
      <activity-block :display_time="!(mobile_view && filtered_list_of_labels.labels_removed.length)" :mobile_view="mobile_view" :activity="activity" v-if="filtered_list_of_labels.labels_added.length">
        <template #activity-description>
          added {{filtered_list_of_labels.labels_added.length}} {{ display_entry_based_on_length(filtered_list_of_labels.labels_added.length, 'team') }}
        </template>
        <template #activity-details>
          <primary-tag class="unset-margin-top" :tags="get_teams(filtered_list_of_labels.labels_added)" :toShowCount="mobile_view ? 1 : 5" :type="'team'"/>
        </template>
      </activity-block>
      <activity-block :display_time="!filtered_list_of_labels.labels_added.length || (mobile_view && filtered_list_of_labels.labels_added.length)" :mobile_view="mobile_view" :activity="activity" v-if="filtered_list_of_labels.labels_removed.length">
        <template #activity-description>
          removed {{filtered_list_of_labels.labels_removed.length}} {{ display_entry_based_on_length(filtered_list_of_labels.labels_removed.length, 'team') }}
        </template>
        <template #activity-details>
          <primary-tag class="unset-margin-top" :tags="get_teams(filtered_list_of_labels.labels_removed)" :toShowCount="mobile_view ? 1 : 5" :type="'team'"/>
        </template>
      </activity-block>
    </div>
    <div v-else-if="activity.verb == 'UPDATE_TAGS'">
      <activity-block :display_time="!(mobile_view && filtered_list_of_tags.tags_removed.length)" :mobile_view="mobile_view" :activity="activity" v-if="filtered_list_of_tags.tags_added.length">
        <template #activity-description>
          added {{filtered_list_of_tags.tags_added.length}} {{ display_entry_based_on_length(filtered_list_of_tags.tags_added.length, 'tag') }}
        </template>
        <template #activity-details>
          <assigned-tags :tags="filtered_list_of_tags.tags_added"  :write_access="false" />
        </template>
      </activity-block>
      <activity-block :display_time="!filtered_list_of_tags.tags_added.length || (mobile_view && filtered_list_of_tags.tags_added.length)" :mobile_view="mobile_view" :activity="activity" v-if="filtered_list_of_tags.tags_removed.length">
        <template #activity-description>
          removed {{filtered_list_of_tags.tags_removed.length}} {{ display_entry_based_on_length(filtered_list_of_tags.tags_removed.length, 'tag') }}
        </template>
        <template #activity-details>
          <assigned-tags :tags="filtered_list_of_tags.tags_removed"  :write_access="false" />
        </template>
      </activity-block>
    </div>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'ADD_USER'"
    >
      <template #activity-description>added a user</template>
    </activity-block>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'REMOVE_USER'"
    >
      <template #activity-description>removed a user</template>
    </activity-block>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'ADD_LABEL'"
    >
      <template #activity-description>added a team</template>
    </activity-block>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'REMOVE_LABEL'"
    >
      <template #activity-description>removed a team</template>
    </activity-block>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'RESET_PASSWORD'"
    >
      <template #activity-description>reset a password</template>
    </activity-block>
    <folder-activity
      :mobile_view="mobile_view"
      :activity="activity"
      :folder_name="activity.attributes.destination.name === activity.object.data.name ? activity.attributes.folder.name : activity.attributes.destination.name"
      v-else-if="activity.verb == 'MOVE_FOLDER'"
    >
      <template #activity-description>{{activity.attributes.destination.name === activity.object.data.name ? 'moved a folder here' : 'moved the folder to' }}</template>
    </folder-activity>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'CHANGED_PASSWORD'"
    >
      <template #activity-description>changed a password</template>
    </activity-block>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'ADDED_PASSWORD'"
    >
      <template #activity-description>added a password</template>
    </activity-block>
    <file-activity
      :file="activity.attributes"
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'CREATE_FILE'"
    >
      <template #activity-description>created a new file</template>
    </file-activity>
    <ownership-activity
      :mobile_view="mobile_view"
      :activity="activity"
      :text_truncate_length="text_truncate_length"
      v-else-if="activity.verb == 'UPDATE_FILE' && activity.attributes.owner"
    />
    <file-activity
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'UPDATE_FILE'"
    >
      <template #activity-description>updated the file</template>
    </file-activity>
    <file-activity
      :file="activity.attributes"
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'DELETE_FILE'"
    >
      <template #activity-description>deleted the file</template>
    </file-activity>
    <file-activity
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'DOWNLOAD_FILE'"
    >
      <template #activity-description>downloaded the file</template>
    </file-activity>
    <file-activity
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      :file="activity.attributes.file"
      v-else-if="activity.verb == 'MOVE_FILE'"
    >
      <template #activity-description>
        moved a file {{activity.attributes.destinationFolder.name === activity.object.data.name ? 'here' : 'to'}}
        <div v-if="activity.attributes.destinationFolder.name !== activity.object.data.name" class="is-flex align-center ml-5 has-text-black">
          <sh-icon style="align-self: flex-end" :file="'vault_sprite'" :name="'add-folder'" class="is-16x16" />
          <p class="is-medium-14-500-17 ml-5">{{activity.attributes.destinationFolder.name}}</p>
        </div>
      </template>
    </file-activity>
    <file-activity
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'SHARE_FILE'"
    >
      <template #activity-description>shared a file</template>
    </file-activity>
    <file-activity
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'READ_FILE'"
    >
      <template #activity-description>viewed the file</template>
    </file-activity>
    <file-activity
      :text_truncate_length="text_truncate_length"
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'DOWNLOAD_SHARED_FILE'"
    >
      <template #activity-description>downloaded shared file</template>
    </file-activity>
    <activity-block
      :mobile_view="mobile_view"
      :activity="activity"
      v-else-if="activity.verb == 'BULK_UPLOAD_FILES'"
    >
      <template #activity-description>uploaded files</template>
    </activity-block>
  </div>
</template>


<script>
import {
  fileService,
  folderService,
  userService
} from "@/desktop/shared/services/";

import { DateTime } from "luxon";

import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
import ActivityBlock from "./activity-card/activity-block";

import FileActivity from "./activity-card/file-activity";
import UsersActivity from "./activity-card/users-activity";
import OwnershipActivity from "./activity-card/ownership-activity";
import FolderActivity from "./activity-card/folder-activity";

export default {
  props: {
    activity: {
      default: null,
      required: true
    },
    mobile_view: {
      type: Boolean,
      default: false
    },
    text_truncate_length: {
      type: Number,
      default: 17
    }
  },
  components: {
    PrimaryTag,
    AssignedTags,
    ActivityBlock,
    FileActivity,
    UsersActivity,
    OwnershipActivity,
    FolderActivity
  },
  methods: {
    get_teams(teams) {
      return teams.map(team => this.$store.getters.state_teams[team.uid]);
    },
    download(file) {
      fileService
        .get_file_download_url({
          id: file.uid,
          headers: this.get_password_header(file.rootFolder)
        })
        .then(res => {
          window.open(res.data, "_blank");
        });
    },
    display_entry_based_on_length(length, entry) {
      if (length === 1) {
        return entry;
      }
      return `${entry}s`;
    }
  },
  computed: {
    // Computed properties are cached by default. They're re-evaluated only when some of its reactive dependencies have changed.
    // Though it's possible to create a single method to return filtered data, computed properties are preferred since results returned after execution of
    // a method aren't cached.
    filtered_list_of_tags() {
      let tags_added = this.activity.attributes.tags
        ? this.activity.attributes.tags.filter(tag => tag.op == "add")
        : [];
      let tags_removed = this.activity.attributes.tags
        ? this.activity.attributes.tags.filter(tag => tag.op == "remove")
        : [];
      tags_added = tags_added.map(tag => tag.tag);
      tags_removed = tags_removed.map(tag => tag.tag);
      return {
        tags_added,
        tags_removed
      };
    },
    filtered_list_of_users() {
      let users_added = this.activity.attributes.users
        ? this.activity.attributes.users.filter(user => user.op == "add")
        : [];
      let users_removed = this.activity.attributes.users
        ? this.activity.attributes.users.filter(user => user.op == "remove")
        : [];
      return {
        users_added,
        users_removed
      };
    },
    filtered_list_of_labels() {
      let labels_added = this.activity.attributes.labels
        ? this.activity.attributes.labels.filter(label => label.op == "add")
        : [];
      let labels_removed = this.activity.attributes.labels
        ? this.activity.attributes.labels.filter(label => label.op == "remove")
        : [];
      return {
        labels_added,
        labels_removed
      };
    }
  }
};
</script>

<style lang="scss" scoped >
.activity-details {
  color: #171e48;
  background-color: white;
  // width: 778px;
  height: auto;
}
</style>

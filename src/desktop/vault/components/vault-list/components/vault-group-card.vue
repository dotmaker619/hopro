<template>
  <div class="vault-list-group">
    <div class="column group-heading is-flex is-vcenter align-center ">
      <span class="ml-15">
          <img
            @click="active=!active"
            class="is-pointer pt-10"
            :class="{'rotate-90 pr-5 pt-5':!active,'ml-5':active}"
            src="@/assets/icons/chevron-circle-down.svg"
            alt
        />
      </span>
      <div class="is-flex is-vcenter align-center" v-if="group_by.filter_key == 'owner'">
        <user-avatar
          :user="{ uid: heading }"
          :pxsize="24"
          :custom_class="'tiny-user-avatar'"
        ></user-avatar>
        <p
          class="is-medium-16-500-19 ml-8"
          v-username="$store.getters.state_users[heading]"
        ></p>
      </div>
      <div v-if="group_by.filter_key == 'tags'">
        <span v-if="heading.toString().length > 0" class="is-flex align-center">
          <assigned-tags
            :tags="heading.toString().split(',')"
            :write_access="false"
          />
          <!-- <span class="entity-count is-flex mt-5 icon">{{ group.length }}</span> -->
        </span>
        <span v-else>No tags</span>
      </div>
      <p
        v-if="group_by.filter_key == 'type'"
        class="is-medium-16-500-19 is-capitalized"
      >
        {{
          heading == "undefined"
            ? "Folders"
            : mime.extension(heading) == false
            ? "Other"
            : mime.extension(heading)
        }}
      </p>
      <p
        v-if="group_by.filter_key == 'accessed'"
        class="is-medium-16-500-19 is-capitalized"
      >
        {{ heading }}
      </p>
      <p class="counter">{{ group.length }}</p>
    </div>

    <data-component v-if="active"
      :index="index"
      :data="group"
      :is_loading="is_loading"
      :is_viewer_small="is_viewer_small"
    />
  </div>
</template>

<script>
import {mapState } from "vuex";
import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
import DataComponent from "@/desktop/vault/components/vault-list/components/vault-data-component";
export default {
    props: ['index','group',,'heading','is_loading','is_viewer_small'],
    components: {
        AssignedTags,
        DataComponent
    },
    data(){
        return {
            active:true,
            mime:require("mime-types")
        }
    },
    computed: {
    ...mapState("vault", [
      "group_by",
    ]),
  }
};
</script>

<style lang="scss">
.vault-list-group{
    .group-heading {
        border-bottom: 1px solid #eee;
    }
    .rotate-90 {
        transform: rotate(-90deg);
    }
    .counter {
        font-family: Barlow-bold;
        font-size: 12px;
        color: #171e48;
        opacity: 0.7;
        background-color: #dee5f0;
        border-radius: 1rem;
        text-align: center;
        /* margin-left: 5px; */
        padding-top: 0.2rem;
        margin-left: 0.5rem;
        height: 2.2rem;
        width: 2.2rem;
    }
}
</style>

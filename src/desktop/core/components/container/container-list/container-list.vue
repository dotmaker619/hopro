  <template>
  <div class="list-card">
    <router-view></router-view>
    <div class="list-top-section">
      <div class="list-top-section--search">
        <searchbar @search="pageChangeHandle(1, $event)"></searchbar>
      </div>
      <div class="list-top-section--create">
        <a v-if="access('core', 'create_containers')" @click="open_form_popup()">
          <div class="sh-button sh-button--create sh-button--inverted is-semiBold-14-600-17">New Container</div>
        </a>
        <a v-else @click="no_access_popup('core', 'create_containers')">
          <div class="sh-button sh-button--create disabled-link is-semiBold-14-600-17">New Container</div>
        </a>
      </div>
    </div>
    <div v-if="data && data.length && !isLoading">
      <list-header></list-header>
      <div class="sh-list">
        <div
          :class="$route.name == 'asset-details-containers' ? 'detail-items' : 'sh-list__item'"
          @mouseleave="hover = -1"
          @mouseenter="hover = item.uid"
          v-for="item in data"
          :key="item.uid"
          v-click-outside="() => (hover == item.uid ? (hover = -1) : null)"
        >
          <div class="columns">
            <div class="column" :class="$route.name == 'asset-details-containers' ? 'is-3' : ''">
              <router-link :to="{ name: 'container-details', params: { id: item.uid } }" class="has-text-dark">
                <main-details-media
                  :truncate_value="$route.name == 'asset-details-containers' ? '15' : '22'"
                  :info="{
                    name: item.name,
                    subtext: item.groups ? `${item.groups.length} ${item.groups.length > 1 ? 'Groups' : 'Group'}` : '*No details found',
                    name_class: 'is-semiBold-16-600-19 has-primary-text name-highlights-on-hover',
                    subtext_class: 'is-medium-14-500-17 has-primary-text',
                    properties: item.properties,
                  }"
                ></main-details-media>
              </router-link>
            </div>
            <div class="column is-flex align-center">
              <user-avatar :user="item.owner" :pxsize="30" class="mr-10"></user-avatar>
              <span class=" is-medium-14-500-17 has-text-new-grey" v-username="item.owner"></span>
            </div>
            <div class="column is-flex align-center" v-if="$route.name == 'container-list'">
              <primary-tag :tags="item.asset ? [item.asset] : null" :hideIcon="false" :type="'asset'" :truncate_length="10"></primary-tag>
            </div>
            <div class="column is-flex align-center">
              <app-type-tag :apps="item.app_types" :count="3" :item_id="item.uid"></app-type-tag>
            </div>
            <div class="column is-flex is-between align-center">
              <div>
                <div v-if="item.tags && item.tags.length">
                  <assigned-tags :tags="item.tags" :write_access="false" :number_of_tags_to_display="3" />
                </div>
                <div v-else class="is-flex align-center">
                  <sh-icon :name="'tags'" class="is-20x20 mr-5 has-opacity-6"></sh-icon>
                  <span class="is-regular-14-00-17 has-opacity-7 has-text-light-grey">*No tags assigned</span>
                </div>
              </div>
              <div>
                <transfer-owner
                  :ref="'containerList' + item.uid"
                  :name="item.name"
                  :service="containerService"
                  :id="item.uid"
                  @update_user="update_owner(item, $event)"
                ></transfer-owner>
              </div>
              <div v-if="!$store.getters.is_org_user">
                <div class="asset-dropdown" v-click-outside="() => (dropdown == item.uid ? (dropdown = -1) : null)">
                  <div
                    class="asset-dropdown-selection"
                    @click="dropdown == -1 ? (dropdown = item.uid) : (dropdown = -1)"
                    :class="{ 'is-hidden': hover != item.uid && dropdown != item.uid }"
                  >
                    <sh-icon :name="'3-dots-menu'" class="is-20x20"></sh-icon>
                  </div>
                  <div class="asset-dropdown-content" v-if="dropdown == item.uid">
                    <p @click="open_form_popup(item)" tag="p">
                      <sh-icon :name="'edit-small'" class="is-24x24 mr-10"></sh-icon>
                      <span class="no-whitespace-wrap">Edit Container</span>
                    </p>

                    <p @click="open_transfer_popup(item.uid)">
                      <sh-icon :name="'transfer-2'" class="is-24x24 mr-10"></sh-icon>
                      <span class="no-whitespace-wrap">Transfer ownership</span>
                    </p>
                    <p
                      @click="
                        showDeleteModal = true;
                        currentContainer = item;
                      "
                    >
                      <sh-icon :name="'delete-small'" class="is-24x24 mr-10"></sh-icon>
                      <span class="no-whitespace-wrap">Delete container</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="isLoading">
        <list-header></list-header>
        <list-skeleton></list-skeleton>
      </div>
      <no-results v-else>
        <img slot="image" src="@/assets/illustrations/containers-illustration.svg" alt />
        <div slot="button">
          <a @click="open_form(ContainersFormComponent, { header: 'Create Container for', type: 'container' })">
            <div class="sh-button sh-button--create">Create New Container</div>
          </a>
        </div>
      </no-results>
    </div>
    <div>
      <pagination
        :default_page_size="default_page_size"
        :current-page="currentPage"
        :page-count="pageCount"
        class="articles-list__pagination"
        @nextPage="pageChangeHandle('next')"
        @previousPage="pageChangeHandle('previous')"
        @loadPage="pageChangeHandle"
        :visiblePagesCount="visiblePagesCount"
        :totalRecords="totalRecords"
      ></pagination>
    </div>
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="currentContainer.uid"
      :resourceName="currentContainer.name"
      :resourceType="'container'"
      :resourceService="containerService"
      @closed="showDeleteModal = false"
      @deleted="show_success('Resource successfully deleted');getData();$parent.$emit('update');"
    />
  </div>
</template>

<script>
  import { containerService, userService, assetService } from "@/desktop/shared/services/";
  import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import AppTypeTag from "@/desktop/shared/components/tags/app-type-tag";
  import AssignedTags from "@/desktop/shared/components/tags/type-tag/components/assigned-tags";
  import searchbar from "@/desktop/core/shared/components/searchbar";
  import ContainersFormComponent from "@/desktop/core/components/container/container-form.component.vue";
  import FormPopup from "@/desktop/shared/mixins/form-popup.mixin.vue";
  import PaginationMixin from "@/desktop/shared/mixins/pagination.mixin.vue";
  import Pagination from "@/desktop/shared/components/pagination.vue";
  import ListHeader from "@/desktop/core/components/container/container-list/components/container-list-header.vue";
  import ListSkeleton from "@/desktop/core/shared/components/skeleton/list-skeleton.vue";
  export default {
    name: "container-list",
    components: {
      MainDetailsMedia,
      PrimaryTag,
      AppTypeTag,
      AssignedTags,
      searchbar,
      Pagination,
      ListHeader,
      ListSkeleton,
    },
    mixins: [FormPopup, PaginationMixin],
    data() {
      return {
        data: null,
        containerService: containerService,
        isLoading: false,
        showDeleteModal: false,
        currentContainer: null,
        hover: -1,
        dropdown: -1,
        ContainersFormComponent: ContainersFormComponent,
      };
    },
    created() {
      this.getData();
    },

    computed: {
      hideInfoBlockImage() {
        return this.$route.name == "container-list" ? false : true;
      },
    },
    methods: {
      async getData() {
        this.isLoading = true;
        let query = {
          labels: true,
          users: true,
          groups: true,
        };

        if (this.$route.name === "asset-details-containers" || this.$route.name === "asset-container-create") query.asset = this.$route.params.id;

        await this.get_data(query, containerService);
        this.isLoading = false;
      },
      open_form_popup(edit_item) {
        let info = {};
        info.header = edit_item ? "Edit Container for" : "Create Container for";
        if (this.$route.name === "asset-details-containers") {
          info.asset_uid = this.$route.params.id;
        }
        if (edit_item) {
          info.has_group = edit_item.groups && edit_item.groups.length > 0;
          info.asset_uid = edit_item.asset.uid;
          info.subheader = edit_item.asset.name;
          info.header += " asset";
        }
        this.open_form(this.ContainersFormComponent, info, edit_item);
      },

      open_transfer_popup(id) {
        let i = `containerList${id}`;
        this.$refs[i][0].open_popup();
      },
    },
  };
</script>
<style lang="scss">
  .detail-items {
    border-bottom: 1px solid #eee;
    padding: 1.5rem 2rem;
  }

</style>

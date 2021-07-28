<template>
  <div>
    <div class="modal" :class="{ 'is-active': activeModal }">
      <div class="modal-background"></div>
      <div class="modal-card create-card">
        <section class="modal-card-body">
          <div class="create-card-header">
            <div class="is-semiBold-20-600-000">New Schedule</div>
            <div class="is-pointer" @click="activeModal = false">
              <sh-icon :name="'ticket-create-modal-close'" class="is-14x14" />
            </div>
          </div>
          <div class="create-card-icon">
            <sh-icon :name="'ticket-create-schedule'" class="is-100x100" />
          </div>
          <div class="create-card-content">
            <div class="create-card-input">
              <input id="searchAsset" class="search-input-text is-regular-16-00-00" type="text" v-model="searchAssetItem" placeholder="Ticket Name" />
            </div>
            <div class="create-card-input mt-30">
              <input id="searchAsset" class="search-input-text is-regular-16-00-00" type="text" v-model="searchAssetItem" placeholder="Description" />
            </div>

            <div class="is-flex mt-30">
              <div style="width:50%">
                <div>
                  Priority
                </div>
                <div v-if="!priority">
                  <sh-icon :name="'ticket-add-priotity'" class="is-36x36 mt-10" />
                </div>
                <div>
                  <priority-dropdown class="is-medium-16-500-19" :is_details="true" :priority="priority"></priority-dropdown>
                </div>
              </div>
              <div style="width:50%">
                <div>
                  Assignee
                </div>
                <div v-if="!userAssignee">
                  <sh-icon :name="'ticket-add-priotity'" class="is-36x36 mt-10" />
                </div>
                <div class="is-flex align-center mt-10">
                  <user-avatar :user="userAssignee" :pxsize="24" :custom_class="'tiny-user-avatar'"></user-avatar>
                  <p class="is-medium-16-500-19 ml-8"></p>
                </div>
              </div>
            </div>

            <div class="is-flex mt-30">
              <div style="width:50%">
                <div class="is-flex align-center">
                  User
                  <sh-icon
                    :name="'add-users-teams'"
                    class="is-22x22 ml-5 is-pointer add-user-assignee"
                    v-tooltip="{ content: `Add users to this ticket` }"
                    @click.native="add_users"
                    :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
                  />
                </div>
                <div v-if="!dummyuser">
                  <sh-icon :name="'ticket-add-priotity'" class="is-36x36 mt-10" />
                </div>
                <div class="is-flex mt-10">
                  <user-tag
                    :custom_class="'tiny-user-avatar '"
                    :custom_size="36"
                    :users="dummyuser"
                    :tagsCountToShow="3"
                    :no_access="true"
                    :is_precense_component="true"
                  ></user-tag>
                </div>
              </div>
              <div style="width:50%">
                <div class="is-flex align-center">
                  Team
                  <sh-icon
                    :name="'add-users-teams'"
                    class="is-22x22 ml-5 is-pointer add-user-assignee"
                    v-tooltip="{ content: `Add users to this ticket` }"
                    @click.native="add_users"
                    :class="[ticket && !ticket.writeAccess ? 'has-no-access' : null]"
                  />
                </div>
                <div v-if="!dummyteams">
                  <sh-icon :name="'ticket-add-priotity'" class="is-36x36 mt-10" />
                </div>
                <div>
                  <primary-tags :tags="dummyteams" :toShowCount="2" :no_access="true" :type="'team'" :no_wrap="true" :truncate_length="10" />
                </div>
              </div>
            </div>
            <div class="mt-30 is-medium-18-500-22">Tags</div>
            <div class="create-card-input is-flex align-center">
              <span class="mr-10 create-card-input-image">
                <sh-icon :name="'nav-search'" />
              </span>
              <span class="search-input">
                <input
                  id="searchAsset"
                  class="search-input-text is-regular-16-00-00"
                  type="text"
                  v-model="searchAssetItem"
                  placeholder="Search / Add Tags"
                />
              </span>
            </div>

            <div class="mt-30 is-medium-18-500-22">Checklists</div>
            <div class="create-card-input is-flex align-center">
              <span class="mr-10 create-card-input-image">
                <sh-icon :name="'nav-search'" />
              </span>
              <span class="search-input">
                <input
                  id="searchAsset"
                  class="search-input-text is-regular-16-00-00"
                  type="text"
                  v-model="searchAssetItem"
                  placeholder="Search Checklists"
                />
              </span>
            </div>

            <div class="mt-30 is-medium-18-500-22">Recurrence</div>
            <div class="create-card-input is-flex align-center">
              <span class="mr-10 create-card-input-image">
                <sh-icon :name="'ticket-dashboard-recurrence'" class="has-opacity-6 is-23x19" />
              </span>
              <span class="search-input">
                <input id="searchAsset" class="search-input-text is-regular-16-00-00" type="text" v-model="searchAssetItem" placeholder="Select" />
              </span>
            </div>

            <div class="create-card-content__body">
              <div class="mt-20 is-medium-18-500-22">Checklist</div>
              <div class="mt-5 has-opacity-5 is-regular-16-00-19">
                Not found any checklists. Please select ticket.
              </div>
            </div>
            <div class="create-card-content__button">
              <span class="is-semiBold-16-600-19"> Create Schedule</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

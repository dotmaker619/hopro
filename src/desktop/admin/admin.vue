<template>
  <div class="project-management">
    <router-view class="router-user-management-top-section" name="top-section" />
    <!-- <keep-alive> -->
    <router-view class="router-project-management-main" />
    <!-- </keep-alive> -->
  </div>

  <!-- <div class="admin-home">
    <page-header :pageTitle="title" :pageSubtitle="subtitle"></page-header>
    <div class="dashboard-wrapper">
      <div class="columns">
        <div v-for="item in subtitle" :key="item.name" class="column">
          <div class="flex-card card-overflow light-bordered light-raised">
            <div class="icon-header">
              <i class="material-icons primary">{{item.icon}}</i>
            </div>
            <div class="content">
              <div class="card-title is-tile is-styled has-text-right">
                <span>{{item.text}}</span>
                <div class="card-stat has-text-right">{{item.value || 0}}</div>
              </div>
            </div>
            <div class="more">
              <a class="primary">
                <span
                  v-if="item.text == 'Organizations'"
                  @click="$router.push({name: 'admin', query: {organizations:true}})"
                >See all</span>
                <span
                  v-else-if="item.text == 'Applications'"
                  @click="$router.push({name: 'admin', query: {applications:true}})"
                >See all</span>
                <span v-else @click="$router.push({name: 'admin', query: {users:true}})">See all</span>
              </a>
            </div>
          </div>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="navigation-tabs animated-tabs">
          <div class="tabs">
            <ul>
              <li
                class="tab-link"
                :class="{'is-active':active_tab=='organizations'}"
                @click="$router.push({name: 'admin', query: {organizations:true}})"
                data-tab="tab-a1"
              >
                <a>Organizations</a>
              </li>
              <li
                class="tab-link"
                :class="{'is-active':active_tab=='entities'}"
                @click="$router.push({name: 'admin', query: {entities:true}})"
                data-tab="tab-a2"
              >
                <a>Entity</a>
              </li>
              <li
                class="tab-link"
                :class="{'is-active':active_tab=='users'}"
                @click="$router.push({name: 'admin', query: {users:true}})"
                data-tab="tab-a3"
              >
                <a>Users</a>
              </li>
              <li
                class="tab-link"
                :class="{'is-active':active_tab=='applications'}"
                @click="$router.push({name: 'admin', query: {applications:true}})"
                data-tab="tab-a4"
              >
                <a>Applications</a>
              </li>
              <li
                class="tab-link"
                :class="{'is-active':active_tab=='jobs'}"
                @click="$router.push({name: 'admin', query: {jobs:true}})"
                data-tab="tab-a5"
              >
                <a>Jobs</a>
              </li>
            </ul>
          </div>
          <div
            id="tab-a1"
            :class="{'is-active':active_tab=='organizations'}"
            class="navtab-content"
          >
            <keep-alive>
              <router-view></router-view>
            </keep-alive>
          </div>
          <div
                  id="tab-a2"
                  :class="{'is-active':active_tab=='entities'}"
                  class="navtab-content"
                >
                  <keep-alive>
                    <entity-list v-if="active_tab=='entities'"></entity-list>
                  </keep-alive>
          </div>
          <div id="tab-a3" :class="{'is-active':active_tab=='users'}" class="navtab-content">
                  <keep-alive>
                    <user-list
                      v-if="active_tab=='users'"
                      :isInsideDetailsPage="isInsideDetailsPage"
                    ></user-list>
                  </keep-alive>
          </div>
          <div
                  id="tab-a4"
                  :class="{'is-active':active_tab=='applications'}"
                  class="navtab-content"
                >
                  <keep-alive>
                    <application-list v-if="active_tab=='applications'"></application-list>
                  </keep-alive>
          </div>
          
                <div id="tab-a5" :class="{'is-active':active_tab=='jobs'}" class="navtab-content">
                  <keep-alive>
                    <job-list v-if="active_tab=='jobs'"></job-list>
                  </keep-alive>
          </div>
        </div>
      </div>
    </div>
  </div>-->
</template>
<script>
import topSection from "./top-section";
import { mapState } from "vuex";
export default {
  components: {
    topSection
  }
};
</script>

<style lang="scss" scoped>
.dashboard-wrapper .flex-card .icon-header i.primary {
  background-color: #445566;
  box-shadow: 0 14px 26px -12px rgba(68, 85, 102, 0.42),
    0 4px 23px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(68, 85, 102, 0.2) !important;
}
</style>



 
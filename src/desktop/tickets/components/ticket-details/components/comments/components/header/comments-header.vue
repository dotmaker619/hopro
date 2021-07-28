<template>
  <nav class="level">
    <!-- Left side -->
    <div class="level-left">
      <div class="level-item">
        <div class="field">
          <p class="searchbar control has-icons-left has-icons-right">
            <input
              v-model="search_keyword"
              class="searchbar__input input"
              placeholder="Search..."
              autocomplete="off"
              @keypress.enter="search"
              style="border:0;box-shadow:none;"
            />
            <span class="icon is-large is-left">
              <sh-icon :name="'search'" :file="'helper_sprite'" class="is-20x20"></sh-icon>
            </span>
            <span
              v-if="search_keyword && search_keyword.length > 2"
              style="height:3.25em;z-index:1;pointer-events:all"
              @click.stop.prevent="search_keyword = ''"
              class="icon is-pointer is-large is-right"
            >
            <sh-icon :name="'remove-user-blue-bg'" class="is-20x20" style="width:2rem;height:2rem;"></sh-icon>
            </span>
          </p>
        </div>
      </div>
    </div>
    <div class="level-right">
      <div class="is-flex">
        <label class="level-item is-medium-14-500-17 has-opacity-7 mr-5">Filters:</label>
        <div class="sh-dropdown" v-click-outside="() => (active = false)">
          <div v-if="active" @click="active = false" class="backdrop"></div>
          <div @click.prevent.stop="active = !active" class="is-semiBold-14-600-17 is-flex is-pointer mr-40 ml-5">
            <p class="is-flex is-vcenter">
              <span>{{ filterText }}</span>
              <sh-icon :name="'chevron-down'" class="is-10x10 ml-5"></sh-icon>
            </p>
          </div>
          <ul style="right:0%;left:unset" class="sh-dropdown-content" v-if="active" @click.stop>
            <li style="display:block" class="sh-dropdown-content__item">
              <b>Commented by</b>
              <div>
                <user-select
                  :ticket="ticket"
                  :ticket_watchers="users"
                  @update-watchers="
                    users = $event;
                    filters();
                  "
                ></user-select>
              </div>
            </li>
            <li
              @click="
                attachments = !attachments;
                filters();
              "
              class="sh-dropdown-content__item is-flex is-between"
            >
              <div>Attachments</div>
              <input type="checkbox" name="checkbox" class="sh-custom-checkbox is-green is-marginless" :checked="attachments" />
            </li>
            <li
              @click="
                mentions = !mentions;
                filters();
              "
              class="sh-dropdown-content__item is-flex is-between"
            >
              <div>Mentions</div>
              <input type="checkbox" name="checkbox" class="sh-custom-checkbox is-green is-marginless" :checked="mentions" />
            </li>
          </ul>
        </div>
      </div>
      <div class="is-flex">
        <label class="level-item is-medium-14-500-17 has-opacity-7 mr-5">Show:</label>
        <dropdown
          @clicked="
            show.action = show.actions[$event];
            filters();
          "
          :items="show.items"
          v-model="show.selection"
        ></dropdown>
      </div>
    </div>
  </nav>
</template>
<script>
  import Dropdown from "./comments-dropdown.vue";
  import UserSelect from "./user-select.vue";

  export default {
    props: ["items", "value"],
    data() {
      return {
        search_keyword: "",
        active: false,
        attachments: false,
        mentions: false,
        users: [],
        filter: {
          selection: "All",
          items: ["All", "Attachments", "Mentions"],
          actions: [null, { attachment_upload: { $gt: 0 } }, { mentioned_user_list: { $gt: 0 } }],
        },
        show: {
          selection: "All",
          items: ["All", "Threads", "Pinned"],
          actions: [null, { reply_count: { $gt: 0 } }, { pinned: true }],
        },
      };
    },
    watch: {
      search_keyword: function(val) {
        if (val === "") {
          this.$emit("clearFilter");
        }
      },
    },
    computed: {
      filterText() {
        let arr = [];
        if (this.mentions) {
          arr.push("Mentions");
        }
        if (this.attachments) {
          arr.push("Attachments");
        }
        if (this.users && this.users.length) {
          arr.push(this.users.length + " Users");
        }
        if (arr.length > 0) {
          return arr.toString();
        } else return "All";
      },
    },
    methods: {
      filterAction() {
        let arr = [];
        if (this.users && this.users.length > 0) {
          this.checkAndUpdate(
            this.users.length > 0,
            this.users.length > 1
              ? { $or: this.users.map((d) => ({ owner: d.uid })) }
              : {
                  owner: this.users[0].uid,
                },
            arr
          );
        }
        this.checkAndUpdate(this.mentions, { mentioned_user_list: { $gt: 0 } }, arr);
        this.checkAndUpdate(this.attachments, { attachment_upload: { $gt: 0 } }, arr);
        if (arr.length > 0) return arr.length > 1 ? { $or: arr } : arr[0];
        else return undefined;
      },
      search() {
        this.filter.selection = "All";
        this.show.selection = "All";
        if (this.search_keyword === "") this.$emit("clearFilter");
        else this.$emit("filter", this.search_keyword);
      },
      filters(f) {
        let arr = [];
        this.checkAndUpdate(this.filterAction(), this.filterAction(), arr);
        this.checkAndUpdate(this.show.action, this.show.action, arr);
        if (arr.length > 0) {
          this.$emit("filter", arr.length > 1 ? { $and: arr } : arr[0]);
        } else {
          this.$emit("clearFilter");
        }
      },
      checkAndUpdate(condition, value, arr) {
        if (condition) {
          arr.push(value);
        }
      },
    },
    components: {
      Dropdown,
      UserSelect,
    },
  };
</script>

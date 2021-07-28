<template>
  <div class="card assign-group-dropdown">
    <header class="card-header">
      <p class="card-header-title">
        <!-- <i class="fa fa-search ml-10"></i> -->
        <span class="ml-15">
          <img src="@/assets/icons/search.svg" alt="" srcset="">
        </span>
        <input type="text" class="search-input" placeholder="Search Feature Type Groups" v-model="filter_key" />
      </p>
    </header>
    <div class="card-contentt">
      <div class="content has-slimscroll" style="overflow-y:scroll;height:200px">
        <div class="is-bottom-border" v-for="(group,i) in filtered_data" :key="i">
          <label class="item" :for="group.uid">
            <input
            v-model="selected"
            :id="group.uid"
            type="checkbox"
            :value="group.uid"
            class="sh-custom-checkbox"
          />
          <p
            class="name is-medium-16-500-50"
            style="color: #171e48;"
          >{{group.name}}</p>
          </label>
        </div>
      </div>
    </div>
    <footer class="card-footer">
      <a
        @click="$emit('close')"
        class="assign-group-dropdown-cancel is-medium-16-500-19 mr-20"
      >Cancel</a>
      <a @click="assign_ftg()" class="assign-group-dropdown-save is-medium-16-500-19">Assign Group</a>
    </footer>
  </div>
</template>

<script>
import { featureTypeGroupService } from "@/desktop/shared/services/";


export default {
  props: ["details"],
  data() {
    return {
      selected: [],
      data: [],
      filter_key: ""
    };
  },
  created() {
    this.getData();
  },
  computed: {
    filtered_data() {
      if (!this.data) return [];
      return _.filter(this.data, item => item.name.toLowerCase().includes(this.filter_key));
    }
  },
  methods: {
    async getData() {
      this.data = await featureTypeGroupService.getAll({
        query: `pk=true&exclude_containers=${this.$route.params.id}&org=${
          this.details ? this.details.organization : ""
        }`
      });
    },
    async assign_ftg() {
      await featureTypeGroupService.assign_to_view({
        id: this.$route.params.id,
        body: {
          featureTypeGroups: this.selected
        }
      });
      this.getData();
      this.$emit("groups_added");
      this.$emit("close");
    },
    toggle(uid) {
      let index = this.selected.findIndex(i => i == uid);
      if (index) {
        this.selected.splice(index, 1);
      } else {
        this.selected.push(uid);
      }
    }
  }
};
</script>
<style lang="scss">
.card.assign-group-dropdown {
  position: absolute;
  width: 70%;
  right: 0;
  top: -5px;
  z-index: 10;
  border-radius: 6px;
  box-shadow: 0 30px 30px 0 rgba(0, 0, 0, 0.16);
  border: solid 0.5px rgba(23, 30, 72, 0.3);
  .search-input {
    width: 100%;
    border: 0;
    padding: 1rem;
    font-size: 1.6rem;
    &::placeholder{
      color: #171e48;
      opacity: 0.5;
    }
    &:active,
    &:focus {
      outline: none;
    }
  }
  .item {
    cursor: pointer;
    margin: 0rem 2rem;
    padding: 1rem 0rem;
    text-transform: capitalize;
    font-weight: 500;
    font-size: 1.4rem;
    line-height: 2;
    display: flex;
    align-items: center;
    &:hover {
      margin: 0;
      padding: 1rem 2rem;
      background: #eef2ff;
    }
    .name {
      margin-left: 1rem;
    }
  }
  .card-footer {
    padding: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .assign-group-dropdown-cancel {
    color: #171e48;
    opacity: 0.6;
  }
  .assign-group-dropdown-save {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 121px;
    height: 44px;
    border-radius: 6px;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
    background-color: $primary;
    color: #fff;
  }
}

</style>
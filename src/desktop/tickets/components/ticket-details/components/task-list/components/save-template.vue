<template>
  <div :style="isButton?'display:inline-block;':''" class="sh-dropdown">
    <span
      v-if="isButton"
      class="is-medium-16-500-19  is-pointer has-opacity-8"
      style="color:#5c7ef7"
      @click="active = !active;show_result=false;search_templates()"
    >
      <sh-icon
        name="magic-load"
        class="is-16x16 mr-5"
        style="display:inline;"
      />
      Save as template
    </span>
    <div
      v-click-outside="() => (active = show_result?show_result:false)"
      :style="`top:-25rem`"
      class="sh-dd-content"
      v-if="active"
    >
      <div class="search-field">
        <p
          class="control has-icons-left"
          @click="show_result = true"
        >
          <input
            v-model="search_keyword"
            @input="selected_template = null"
            class="input"
            placeholder="Select Template  "
          />
          <span class="icon is-small is-left">
            <sh-icon :name="'search'" class="is-16x16" />
          </span>
        </p>
      </div>
      <div class="mt-20 mb-20">
        <div class="sh-dd-content-heading">
          Include
        </div>
        <div class="mt-15">
          <label for="assignee" class="is-pointer">
            <input class="sleek-checkbox" id="assignee" v-model="assignee" type="checkbox" />
            Assignee
          </label>
          <label for="attachments" class="is-pointer ml-30">
            <input id="attachments" class="sleek-checkbox" v-model="attachment" type="checkbox" />
            Attachments
          </label>
        </div>
      </div>
      <div class="sh-dropdown-buttons">
        <div @click="active = false" class="cancel-button button">
          Cancel
        </div>
        <div v-if="!selected_template" @click="save_as_template" class="load-button button" :class="[
            search_keyword
              ? null
              : 'is-disabled has-no-access'
          ]">Save as template</div>
        <div v-else @click="update_template" class="load-button button">
          Update template
        </div>        
      </div>
    </div>
    <div
        class="results has-slimscroll-xs"
        v-click-outside="() => (show_result = false)"
        v-if="active&&show_result&&search_results && search_results.length"
        :class="[
          selected_template && selected_template.name == search_keyword
            ? 'is-hidden'
            : null
        ]"
      >
        <div class="result_item_list">
          <div
            v-for="list in search_results"
            :key="list.uid"
            class="results_items sh-dropdown-content__list--item"
            @click.stop="select_template(list)"
            :class="[
              selected_template && selected_template.uid == list.uid
                ? 'selected_template'
                : null
            ]"
          >
            <p>{{ list.name }}</p>
          </div>
        </div>
      </div>
  </div>
</template>

<script>

export default {
  props: ["ticket","checklist","isButton","service"],
  data() {
    return {
      search_keyword: "",
      all_templates: null,
      selected_template: null,
      show_result: false,
      active: false,
      assignee:false,
      attachment:false
    };
  },
  watch:{
    active:function(val){
      if(!val){
        this.$emit("closed")
      }
    }
  },
  mounted() {
    this.isButton=!!this.isButton;
    if(!this.isButton){
      this.active=true;
    }
    this.$modal.show(`load-template-modal`);
     this.search_templates();
  },
  computed: {
    search_results() {
      if (this.all_templates) {
        return this.all_templates.filter(checklist =>
          _.includes(
            checklist.name.toLowerCase(),
            this.search_keyword.toLowerCase()
          )
        );
      }
    }
  },
  methods: {
    async search_templates() {
    let { data } = await this.service
        .get_checklist_template({
          id: this.ticket.uid,
          query: `isTemplate=true`
        })
        .catch(err => console.log(err)); 
      this.all_templates = data;
    },
    select_template(template) {
      this.selected_template = template;
      this.search_keyword = this.selected_template.name;
    },
    async save_as_template() {
        let { data } = await this.service
          .checklist_template({
            id: this.ticket.uid,
            body: {"checklists": [{
              "action": "saveTemplate",
              "include": {
                "assignee": this.assignee,
                "attachments": this.attachment
              },
              "name": this.search_keyword,
              "checklistUid": this.checklist.uid
            }]}
          })
          .catch((err) => this.handleErrors(err));
          this.active=false;  
           this.$modal.hide(`template-${this.checklist.uid}`);
        // this.$emit("added_template");
      },
      async update_template() {
        let { data } = await this.service
          .update_checklist({
            id: this.ticket.uid,
            checklist_id: this.selected_template.uid,
            body: {
              items: this.checklist.items,
            },
          })
          .catch((err) => this.handleErrors(err));
        this.active=false;
        this.$modal.hide(`template-${this.checklist.uid}`);
        this.$toast.show("Checklist template updated successfully", "", this.$store.state.izitoast_options.appSuccess);
      },
    async add_template() {
      this.show_result=false;
      this.active=false;
      if (this.items_only) {
        let { data } = await this.service
          .load_template_items({
            id: this.ticket.uid,
            checklist_id: this.current_checklist.uid,
            body: {
              "templateUid":this.selected_template.uid  
            }
          })
          .catch(err => console.log(err));
        this.$modal.hide(`load-template-modal`);
        this.$store.dispatch("checklist/add_checklists", { id: this.ticket.uid });
        this.$toast.show(
          "Tasks added to the checklist",
          "Success: ",
          this.$store.state.izitoast_options.appSuccess
        );
      } else {
        let checklist = this.selected_template;
        checklist.isTemplate = false;
        let { data } = await this.service
          .checklist_template({
            id: this.ticket.uid,
            body: {
              "action": "loadTemplate",
              "include": {
                "assignee": true,
                "attachments": false
              },
              "name": this.search_keyword,
              "templateUid": this.selected_template.uid
            }
          })
          .catch((err) => this.handleErrors(err));
        this.$modal.hide(`load-template-modal`);
        this.$emit("update");
        this.$toast.show(
          "Checklist added",
          "",
          this.$store.state.izitoast_options.appSuccess
        );
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.sh-dd-content,.results {
  width: 378px;
  left: 2rem;
  max-height: 235px;
  position: absolute;
  overflow: hidden;
  overflow-y: auto;
  padding: 25px;
  background: white;
  border-radius: 10px;
  box-shadow: -10px 20px 50px 0 rgba(23, 30, 72, 0.2);
  z-index: 1000;
}

.sh-dd-content-heading {
  opacity: 0.7;
  font-family: Barlow;
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  text-align: left;
  color: #171e48;
}

.sh-dropdown-buttons {
  text-align: right;
  margin-top: 30px;
}

input {
  border: 0;
  border-bottom: 1px solid #ccc;
  box-shadow: none;
}

.load-button {
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px #2585d3;
  color: #2585d3;
  line-height: 1.19;
  background-color: var(--white);
}

.cancel-button {
  font-size: 16px;
  font-weight: 500;
  border: 0;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.19;
  letter-spacing: normal;
  text-align: center;
  color: #747891;
}

.results {
  left:4rem;
  top:-18rem;
}

.result_item_list{
  overflow:hidden;
}

.sh-dropdown-content__list {
  margin: 0rem 2rem;
  &--item {
    padding: 1rem;
    border-radius: 2rem;

    &:hover {
      background-color: $primary-background;
      cursor: pointer;
    }
  }
}

</style>

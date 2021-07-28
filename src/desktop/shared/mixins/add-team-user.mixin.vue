<script>
export default {
  data(){
    return {
      is_saving: false
    }
  },
  computed: {
    existing_uids() {
      return this.existing.map(u => u.uid);
    }
  },
  methods: {
    toggle(item) {
      if (this.selected[item.uid]) {
        delete this.selected[item.uid];
      } else {
        this.selected[item.uid] = { ...item, access: "read" };
      }
      this.selected = Object.assign({}, this.selected);
    },

    change_access(item, access) {
      if (this.selected[item.uid]) this.selected[item.uid].access = access;
      else {
        this.selected[item.uid] = { ...item, access };
      }
      this.selected = Object.assign({}, this.selected);
    },

    update() {
      this.is_saving = true;
      let items = Object.values(this.selected).concat(this.existing || []);
      let body = {};
      if (this.type == "labels") {
        items = items.map(u => _.pick(u, ["uid", "name","access"]));
        body.labels = items;
      } else {
        items = items.map(u => _.pick(u, ["uid", "email","access"]));
        body.users = items;
      }
      if (!this.service) {
        this.complete(items);
        this.is_saving  = false;
        this.$emit("close");
        return;
      }
      this.service
        .patch({
          id: this.item_uid,
          body
        })
        .then(res => {
          this.show_success(res.message);
          this.complete(items);
          this.is_saving  = false;
          this.$emit("close");
        })
        .catch(err => this.handleErrors(err));
    }
  }
};
</script>

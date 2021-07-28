<script>
  import { folderService, fileService } from "@/desktop/shared/services/";
  const queryString = require("query-string");
  import OrderMixin from "@/desktop/shared/mixins/order.mixin.vue";
  export default {
    mixins: [OrderMixin],
    computed: {
      recent_data() {
        // TODO
        return _.groupBy(_.orderBy([...(this.vault_folders || []), ...(this.vault_files || [])], "accessed", "desc"), (record) =>
          this.determineGroup(moment(record.accessed))
        );
      },
    },
    methods: {
      async get_recents() {
        this.is_loading = true;
        this.$store.commit("vault/SET_VAULT_FOLDERS", []);
        this.$store.commit("vault/SET_VAULT_FILES", []);

        let p1 = new Promise((resolve) => {
          this.$store.state.firebase_database
            .ref(
              `/userProfile/${this.$store.state.claims.user_id}/organizations/${this.$store.state.current_organization.uid}/recentlyAccessed/vault-folders/`
            )
            .once("value", async (snapshot) => {
              resolve(await this.getRecentsFolders(snapshot.val() || []));
            });
        });

        let p2 = new Promise((resolve) => {
          this.$store.state.firebase_database
            .ref(
              `/userProfile/${this.$store.state.claims.user_id}/organizations/${this.$store.state.current_organization.uid}/recentlyAccessed/vault-files/`
            )
            .once("value", async (snapshot) => {
              resolve(await this.getRecentsFiles(snapshot.val() || []));
            });
        });

        let data = await Promise.all([p1, p2]);

        this.$store.commit("vault/SET_VAULT_FOLDERS", data[0]);
        this.$store.commit("vault/SET_VAULT_FILES", data[1]);
      },
      async getRecentsFolders(recents_uids) {
        try {
          this.is_loading = true;
          let query = {
            page_size: 10,
            page_num: 1,
            tags: true,
          };

          let recents_data = [];
          if (recents_uids.length) {
            let data = await folderService
              .getAll({
                query: `${recents_uids.map((item) => "&uid=" + item.uid).join("")}` + "&is_root=false",
              })
              .catch((err) => this.handleErrors(err));
            recents_data = this.maintain_order(
              recents_uids.map((u) => u.uid),
              data
            );
          }
          let recesnts_hash = _.keyBy(recents_uids, "uid");
          recents_data = recents_data.map((u) => ({
            accessed: recesnts_hash[u.uid].time,
            ...u,
          }));

          let sorted_data = [];
          this.is_loading = false;
          return _.uniqBy([...(recents_data || []), ...(sorted_data || [])], (d) => d.uid);
        } catch (err) {
          console.log(err);

          this.is_loading = false;
          return [];
        }
      },
      async getRecentsFiles(recents_uids) {
        try {
          this.is_loading = true;
          this.isTicketsLoading = true;
          let query = {
            page_size: 10,
            page_num: 1,
            tags: true,
          };

          let recents_data = [];
          if (recents_uids.length) {
            let data = await fileService
              .getAll({
                query: `${recents_uids.map((item) => "&uid=" + item.uid).join("")}` + "&is_root=false",
              })
              .catch((err) => this.handleErrors(err));
            recents_data = this.maintain_order(
              recents_uids.map((u) => u.uid),
              data
            );
          }
          let recesnts_hash = _.keyBy(recents_uids, "uid");
          recents_data = recents_data.map((u) => ({
            accessed: recesnts_hash[u.uid].time,
            ...u,
          }));

          let sorted_data = [];
          this.is_loading = false;
          return _.uniqBy([...(recents_data || []), ...(sorted_data || [])], (d) => d.uid);
        } catch (err) {
          this.is_loading = false;
          return [];
        }
      },
      determineGroup(value) {
        const now = moment(
          // Date.now() + Math.round(Math.random() * 10) * 3600000

          Date.now()
        ).startOf("day");
        if (value.isSame(now, "day")) {
          return "today";
        }
        if (
          value.isAfter(
            now
              .clone()
              .subtract(1, "days")
              .startOf("day")
          )
        ) {
          return "yesterday";
        }
        if (
          value.isAfter(
            now
              .clone()
              .subtract(7, "days")
              .startOf("day")
          )
        ) {
          return "last 7 days";
        }
        if (value.isSame(now, "month")) {
          return "last 30 days";
        }
        // return value.format("MM");
        return "earlier";
      },
    },
  };
</script>

<style></style>

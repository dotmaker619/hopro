<script>
  import AddUsers from "@/desktop/shared/components/add-users-modal";
  import AddTeams from "@/desktop/shared/components/add-teams-modal";
  export default {
    methods: {
      add_teams(info, service) {
        this.$modal.show(
          AddTeams,
          {
            ...info,
            complete: (e) => {
              if (info && info.service) {
                this.$emit("update");
              } else {
                this.handle_teams(e, info.item_uid, service);
              }
            },
          },
          { height: "80%", width: "40%" }
        );
      },
      add_users(info, service) {
        this.$modal.show(
          AddUsers,
          {
            ...info,
            complete: (e) => {
              if (info && info.service) {
                if (info.role) this.getDetails();
                if (info.team) this.getDetails();

                this.$emit("update");
              } else {
                this.handle_users(e, info.item_uid, service);
              }
            },
          },
          { height: "80%", width: "40%" },
          {
            'closed': ()=> {
              this.$eventHub.$emit("refresh-user-list");
            }
          }
        );
      },
      async handle_teams(e, uid, service) {
        let readLabels = e.filter((u) => u.access === "read").map((u) => u.uid);
        let writeLabels = e.filter((u) => u.access === "write").map((u) => u.uid);
        await service
          .patch({
            id: uid,
            body: {
              readLabels,
              writeLabels,
            },
          })
          .then((res) => {
            if (this.getData) {
              this.getData();
            }
            this.$eventHub.$emit("refresh-details");
          })
          .catch((err) => this.handleErrors(err));
      },
      async handle_users(e, uid, service) {
        let readUsers = e.filter((u) => u.access === "read");
        let writeUsers = e.filter((u) => u.access === "write");
        await service
          .patch({
            id: uid,
            body: {
              readUsers,
              writeUsers,
            },
          })
          .then((res) => {
            if (this.getData) {
              this.getData();
            }
            this.$eventHub.$emit("refresh-details");
          })
          .catch((err) => this.handleErrors(err));
      },
    },
  };
</script>

<style></style>

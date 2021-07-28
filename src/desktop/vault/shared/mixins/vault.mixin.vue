<script>
import {
  userService,
  teamService,
  fileService,
  folderService,
} from "@/desktop/shared/services/";
import { mapMutations } from "vuex";
import AddUsers from "@/desktop/shared/components/add-users-modal";
import AddTeams from "@/desktop/shared/components/add-teams-modal";

export default {
  methods: {
    ...mapMutations("vault", ["UPDATE_FOLDER_DETAILS", "UPDATE_FILE_DETAILS"]),
    add_users(details, type) {
      this.$modal.show(
        AddUsers,
        {
          users: [
            ...(details.readUsers || []).map((u) => ({
              ...u,
              access: "read",
            })),
            ...(details.writeUsers || []).map((u) => ({
              ...u,
              access: "write",
            })),
          ],
          complete: async (e) => {
            let readUsers = e.filter((u) => u.access === "read");
            let writeUsers = e.filter((u) => u.access === "write");

            await (type === "file" ? fileService : folderService)
              .patch_({
                id: details.uid,
                body: {
                  readUsers,
                  writeUsers,
                },
                attribute: "users",
                headers: this.get_password_header(
                  details.rootFolder ? details.rootFolder : details.uid
                ),
              })
              .then((res) => {
                let updates = { ...details, ...res.data };

                if (type === "file") {
                  this.UPDATE_FILE_DETAILS(updates);
                } else if (type === "folder") {
                  // if (details.rootFolder) {
                  //   this.$eventHub.$emit("update_children", details.rootFolder);
                  // } else {
                  this.UPDATE_FOLDER_DETAILS(updates);
                  // }
                }
              })
              .catch((err) => this.handleErrors(err));
          },
        },
        { height: "80%" },
        { name: "add-vault-users" }
      );
    },
    add_teams(details, type) {
      this.$modal.show(
        AddTeams,
        {
          teams: [
            ...(details.readLabels || []).map((u) => ({
              uid: u,
              access: "read",
            })),
            ...(details.writeLabels || []).map((u) => ({
              uid: u,
              access: "write",
            })),
          ],
          asset_id: details.targetElement ? details.targetElement.asset : null,
          complete: async (e) => {
            let readLabels = e
              .filter((u) => u.access === "read")
              .map((u) => u.uid);
            let writeLabels = e
              .filter((u) => u.access === "write")
              .map((u) => u.uid);

            await (type === "file" ? fileService : folderService)
              .patch_({
                id: details.uid,
                body: {
                  readLabels,
                  writeLabels,
                },
                attribute: "labels",
                headers: this.get_password_header(
                  details.rootFolder ? details.rootFolder : details.uid
                ),
              })
              .then((res) => {
                let updates = { ...details, ...res.data };

                if (type === "file") {
                  this.UPDATE_FILE_DETAILS(updates);
                } else if (type === "folder") {
                  // if (details.rootFolder) {

                  //   this.$eventHub.$emit("update_children", details.rootFolder);
                  // } else {

                  this.UPDATE_FOLDER_DETAILS(updates);
                  // }
                }
              })
              .catch((err) => this.handleErrors(err));
          },
        },
        { height: "80%" }
      );
    },
  },
};
</script>
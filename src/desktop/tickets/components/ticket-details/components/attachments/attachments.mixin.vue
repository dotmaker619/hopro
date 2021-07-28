
<script>
import { ticketService } from "@/desktop/shared/services/";
export default {
    methods: {
    deselect_all(){
      this.$eventHub.$emit(`deselect-${this.deselectUid}`)
    },
    async bulk_delete_attachments(){
      let req = {
        body: {
          tickets:{}
        }
      }
      req.body.tickets[this.ticket.uid||'']={attachments: []};
      req.body.tickets[this.ticket.uid||''].attachments = this.selected;
      await ticketService
        .bulk_delete_attachments(req)
        .then(()=>{
          this.deselect_all();
          this.$emit("refresh_attachments");
        }).catch(err=>console.log(err));
    },
    async favorite_selected() {
      let attachmentUids = this.selected;
      let req = {
        body: {
          tickets:{}
        }
      }
      req.body.tickets[this.ticket.uid||'']={attachments: {}};
      attachmentUids.forEach(uid=>{
        req.body.tickets[this.ticket.uid||''].attachments[uid]={pinned:true};
      })
      await ticketService
        .bulk_update_attachments(req)
        .then(()=>{
          this.deselect_all();
          this.$emit("refresh_attachments");
          }).catch(err=>console.log(err)); 
    },
    download_files(type) {
      let all_files = [];
      if (type == "selected") {
        all_files = this.selected.map(uid =>
          this.existing_files.find(f => f.uid == uid)
        );
      } else if (type == "favorite") {
        all_files = this.existing_files.filter(file => file.pinned);
      } else {
        all_files = this.existing_files;
      }
      all_files.forEach(
        attachment => (attachment["name"] = attachment.fileName)
      );
      let data = {
        attachments: all_files.map(attachment =>
          _.pick(attachment, ["name", "url"])
        ),
        name: this.ticket.name,
        type: "ticket"
      };
      this.$eventHub.$emit("download_zip", data);
    }
    }
}
</script>

<style>

</style>
<template>
  <div class="has-text-centered"></div>
</template>
<script>
import { fileService } from "@/desktop/shared/services/";

export default {
  created() {
    fileService
      .get_shared_file_download_url({
        share_id: this.$route.params.uid,
        id: "frQhMwLqpcmO"
      })
      .then(res => {
        window.open(res.data);
      })
      .catch(this.handleErrors);
  }
};
</script>

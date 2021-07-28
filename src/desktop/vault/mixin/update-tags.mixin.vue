<script>
    export default {
        methods: {
            determine_item_type (item) {
                return item.hasOwnProperty("parent") ? 'Folder': 'File';
            },
            async update_tags_for_item (update, list_of_assigned_tags, item) {
                if (update && list_of_assigned_tags) {
                    let result = await this.apiService
                        .patch_({
                            group_id: this.$route.params.group_id,
                            id: item.uid ? item.uid : this.$route.params.id,
                            body: {
                                tags: list_of_assigned_tags
                            },
                            attribute: "tags"
                        })
                        .then(() => {
                            this.$store.commit(`vault/UPDATE_${this.determine_item_type(item).toUpperCase()}_DETAILS`, {uid: item.uid, tags: list_of_assigned_tags});
                        })
                        .catch((err) => {
                            this.handleErrors(err);
                        });
                }
            }
        }
    }
</script>
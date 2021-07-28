<template>
  
</template>

<script>
import { mapState } from "vuex";
export default {
    data(){
        return {
            maxPinnedTabs: 10
        }
    },
    computed: {
        ...mapState(["PINNED_TABS", "current_organization","claims"]),
        pinnedTabsRef(){
            return this.$store.state.firebase_database.ref(`/userProfile/${this.claims.user_id}/organizations/${this.current_organization.uid}/pinnedTabs`)
        }
    },
    methods: {
        // same method for create,edit,unpin
        async edit_or_unpin(pin_collection){
            return await this.pinnedTabsRef
            .set(pin_collection)
            .then(() => {
                this.$eventHub.$emit("refetch-pinned-tabs");
                this.$emit("closed");
            })
            .catch(err => this.handleErrors(err));
        },
    }
}
</script>

<style>

</style>
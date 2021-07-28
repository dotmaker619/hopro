<template>
  <div>
    <div class="padding-30 card" style="margin-bottom:20rem">
      <div class="">
        <p class="is-medium-16-500-19">Note</p>

        <p class="is-regular-14-500-17 mt-10">
          Configure the default values for the items created under the asset here. By default, any ticket/vault item created for the asset will use
          the pre-defined values set unless overridden. Please note that the changes are applied only to the new items created.
        </p>
      </div>
      <ticket-config
        @update="save_configuration"
        :asset_id="details && details.uid"
        :config="(details && details.properties && details.properties.ticket) || {}"
      ></ticket-config>
      <div class="my-20">
        <div class="divider "></div>
      </div>
      <vault-config
        @update="save_configuration"
        :asset_id="details && details.uid"
        :config="(details && details.properties && details.properties.vault) || {}"
      ></vault-config>
    </div>
  </div>
</template>

<script>
  import { ticketService, assetService } from "@/desktop/shared/services/";
  import TicketConfig from "./components/ticket-config";
  import VaultConfig from "./components/vault-config";

  export default {
    props: ["details"],
    data() {
      return {
        ticketService: ticketService,
      };
    },
    components: {
      TicketConfig,
      VaultConfig,
    },
    methods: {
      async save_configuration(value) {
        let updated = {
          ticket: {},
          vault: {},
        };
        updated = _.merge(this.details.properties, value);
        console.log("updated_proper", updated);
        let res = await assetService.patch({
          body: {
            properties: updated,
          },
          id: this.$route.params.id,
        });
        this.$eventHub.$emit("refresh-asset-details");
      },
    },
  };
</script>

<style></style>

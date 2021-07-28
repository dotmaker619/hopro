function ticketsSync() {
  return new Promise(async function(resolve, reject) {
    let tokenData = await idbKeyval.get("token"),
      organization = await idbKeyval.get("organization"),
      offlineStorage = {
        tickets: await idbKeyval.get("offline_tickets"),
        checklists: await idbKeyval.get("offline_checklist"),
        elements: await idbKeyval.get("Element"),
        attachments: await idbKeyval.get("attachments"),
      };
    try {
      let newToken = await api.getNewToken(tokenData);
      await api.initialize(newToken.access_token);
      await ticketsHelper.syncItems.elements(
        "terra",
        api.terra,
        offlineStorage,
        organization
      );
      await ticketsHelper.syncItems.elements(
        "therm",
        api.therm,
        offlineStorage,
        organization
      );
      await store.Element.delete();
      await ticketsHelper.bulkUpdates({
        type: "update_tickets",
        create: {
          url: "/tickets/bulkCreate" + `?organization=${organization}`,
          data: offlineStorage.tickets.create,
        },
        update: {
          url: "/tickets/bulkUpdate" + `?organization=${organization}`,
          data: (map) => offlineStorage.tickets.update,
        },
        clearStore: ticketsHelper.clearItems.tickets(offlineStorage),
      });
      await store.offline_tickets.delete();
      if (Object.keys(offlineStorage.checklists).length == 0) {
        self.clients.matchAll({ type: "window" }).then((clients) => {
          if (clients && clients.length)
            clients[0].postMessage({ type: "syncAttachments" });
        });
        resolve();
        return;
      }
      await ticketsHelper.bulkUpdates({
        type: "update_checklists",
        create: {
          url:
            "/tickets/checklists/bulkCreate" + `?organization=${organization}`,
          data: Object.keys(offlineStorage.checklists).reduce((c, d) => {
            c[d] = offlineStorage.checklists[d].create;
            return c;
          }, {}),
        },
        clearStore: ticketsHelper.clearItems.checklists(offlineStorage),
        update: {
          url:
            "/tickets/checklists/bulkUpdate" + `?organization=${organization}`,
          data: (map) =>
            Object.keys(offlineStorage.checklists).reduce((c, d) => {
              c[d] = Object.keys(offlineStorage.checklists[d].update).reduce(
                (f, g) => {
                  f.push(offlineStorage.checklists[d].update[g]);
                  return f;
                },
                []
              );
              return c;
            }, {}),
        },
      });
      await store.offline_checklist.delete();
      self.clients.matchAll({ type: "window" }).then((clients) => {
        if (clients && clients.length) {
          clients[0].postMessage({ type: "syncAttachments" });
        }
      });
      resolve();
    } catch (e) {
      console.log(e);
      ticketsHelper.sendStatusToClient("error");
      reject();
    }
  });
}

var ticketsHelper = (function() {
  const util = {
    setElementData: async (type, data) => {
      await store.Element.setData((db) => {
        db[type].push(data);
        return db;
      });
    },
    parseURLPattern: (url, pattern) => api.urlParser(url).getID(pattern)[1],
    craftResponseFromID: (response, ...data) => response(...data),
    updateData: (data, id, response) =>
      data[id] ? Object.assign(data[id], response) : response,
    applyOfflineData: (response, create, update) =>
      response
        .concat(create)
        .map((d) => (update[d.uid] ? { ...d, ...update[d.uid] } : d)),
    checkAndExecuteFunction: (data, id, fn) => {
      if (data[id]) {
        fn(data[id]);
      }
    },
    updateTickets: (predicate, tickets, store, fn) => {
      if (predicate) {
        let value = fn();
        tickets = tickets.concat(value);
      }
      tickets = tickets.map((d) => {
        return store[d.uid] ? { ...d, ...store[d.uid] } : d;
      });
      return tickets;
    },
    fetchChecklistForTickets: (ticketIDs, orgID) => {
      let checklist = api.ticket("/tickets/checklists?organization=" + orgID, {
        tickets: ticketIDs,
      });
      checklist.then((d) => {
        store.Checklist.setData((db) => Object.assign(db, d.data));
      });
    },
  };

  Object.freeze(util);

  let syncItems = {
    elements: async (type, api, offlineStorage, organization) => {
      if (offlineStorage.elements[type].length > 0) {
        let data = await api(
          `/elements/feature/?organization=${organization}`,
          {
            uids: offlineStorage.elements[type].map((d) => d.uid),
          }
        );
        if (data.status || data.error) {
          throw Error();
        }
        let asset_configuration = await store.asset_configuration.get();
        offlineStorage.tickets.create.forEach((d, i) => {
          if (data[d.targetElement.uid]) {
            d.targetElement = data[d.targetElement.uid];
            if (d.targetElement.asset) {
              let asset = _.find(
                asset_configuration,
                (a) => a.uid == d.targetElement.asset
              );
              let properties =
                (asset && asset.properties && asset.properties.ticket) || null;
              d = _.mergeWith({}, properties, d, (a, b) =>
                b === null ? a : undefined
              );
              offlineStorage.tickets.create[i] = d;
            }
          }
        });
        store.offline_tickets.setData((db) => {
          return Object.assign(db, offlineStorage.tickets);
        });
        await store.Element.setData((db) => {
          db[type] = [];
          return db;
        });
      }
    },
  };

  Object.freeze(syncItems);

  let clearItems = {
    tickets: (offlineStorage) => async (map) => {
      offlineStorage.tickets.update = Object.keys(
        offlineStorage.tickets.update
      ).reduce((f, g) => {
        f[map[g] ? map[g] : g] = offlineStorage.tickets.update[g];
        return f;
      }, {});
      offlineStorage.tickets.create = [];
      store.offline_tickets.setData((db) => {
        return Object.assign(db, offlineStorage.tickets);
      });
      offlineStorage.checklists = Object.keys(offlineStorage.checklists).reduce(
        (c, d) => {
          c[map[d] ? map[d] : d] = offlineStorage.checklists[d];
          return c;
        },
        {}
      );
      store.offline_checklist.setData((db) => {
        return Object.assign({}, offlineStorage.checklists);
      });
      offlineStorage.attachments = Object.keys(
        offlineStorage.attachments
      ).reduce((f, g) => {
        f[map[g] ? map[g] : g] = offlineStorage.attachments[g];
        return f;
      }, {});
      store.attachments.setData((db) => {
        return Object.assign({}, offlineStorage.attachments);
      });
    },
    checklists: (offlineStorage) => async (map) => {
      offlineStorage.checklists = Object.keys(offlineStorage.checklists).reduce(
        (c, d) => {
          c[d] = {};
          c[d].create = [];
          c[d].update = Object.keys(offlineStorage.checklists[d].update).reduce(
            (f, g) => {
              f[map[g] ? map[g] : g] = offlineStorage.checklists[d].update[g];
              f[map[g] ? map[g] : g].uid = map[g] ? map[g] : g;
              return f;
            },
            {}
          );
          return c;
        },
        {}
      );
      store.offline_checklist.setData((db) => {
        return Object.assign({}, offlineStorage.checklists);
      });
    },
  };

  Object.freeze(clearItems);

  async function sendStatusToClient(val) {
    const status = {
      start: { type: "syncStarted", code: 1 },
      end: { type: "syncEnded", code: 0 },
      error: { type: "syncError", code: -1 },
    };
    let { type, code } = status[val];
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ type }));
    });
    await idbKeyval.set("syncStatus", code);
  }

  async function bulkUpdates({ type , create, update, clearStore, postApi }) {
    let response = await api.ticket(create.url, {
      strict: true,
      tickets: create.data,
    });
    if (response.status || response.error) {
      throw Error("BulkUpdate Failed");
    }
    let map = response.data.reduce((c, d) => {
      c[d.meta.tempUid] = d.uid;
      return c;
    }, {});
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ type,map}));
    });
    clearStore(map);
    let updateData = update.data(map);
    if (Object.keys(updateData).length !== 0) {
      response = await api.ticket(update.url, {
        strict: true,
        tickets: updateData,
      });
    }
    if (response.status || response.error) {
      throw Error("BulkUpdate Failed");
    } else return map;
  }

  return {
    util,
    clearItems,
    syncItems,
    sendStatusToClient,
    bulkUpdates,
  };
})();

var store = (function storage() {
  let idbStore = {
    Ticket: {},
    TicketList: [],
    Checklist: {},
    syncStatus: 0,
    attachments: {},
    organization: null,
    offline_tickets: {
      update: {},
      create: [],
    },
    offline_checklist: {},
    offline_client: false,
    asset_configuration: [],
    Element: {
      terra: [],
      therm: [],
    },
  };

  async function clearData(key, initialData) {
    let data = JSON.parse(JSON.stringify(initialData));
    await idbKeyval.set(key, data);
  }

  return {
    init: async () => {
      for (key in idbStore) {
        let data = await idbKeyval.get(key);
        if (!data) {
          clearData(key, idbStore[key]);
        }
      }
    },
    clear: () => {
      for (key in idbStore) {
        clearData(key, idbStore[key]);
      }
    },
    ...Object.keys(idbStore).reduce((acc, c) => {
      acc[c] = {
        delete: async () => {
          await clearData(c, idbStore[c]);
        },
        set: async (val) => {
          await idbKeyval.set(c, val);
        },
        get: async () => {
          return await idbKeyval.get(c);
        },
        setData: async (fn) => {
          let data = fn(await idbKeyval.get(c));
          await idbKeyval.set(c, data);
        },
      };
      return acc;
    }, {}),
  };
})();

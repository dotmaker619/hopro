function ticketRoutes() {
  routes("terra", {
    storeName: "Element",
    responseData: (id) => ({
      element: { uid: id, type: "feature", stage: "TERRA" },
      model: "feature",
      uid: id,
    }),
    get: {
      url:
        "(https://(?:terra-stage-server|terra-server).sensehawk.com/elements/feature/.*?.*)",
      pattern: /https:\/\/(?:terra-stage-server|terra-server)\.sensehawk\.com\/elements\/feature\/(.*)\/\?.*/g,
      successCallback: ({ data }) => data,
      failedCallback: async ({ url, responseData, pattern }) => {
        const id = ticketsHelper.util.parseURLPattern(url, pattern);
        const data = ticketsHelper.util.craftResponseFromID(responseData, id);
        await ticketsHelper.util.setElementData("terra", data);
        return data;
      },
    },
  });

  routes("therm", {
    storeName: "Element",
    responseData: (id) => ({
      element: { uid: id, type: "feature", stage: "THERM" },
      model: "feature",
      uid: id,
    }),
    get: {
      url:
        "(https://(?:therm-stage-server|therm-server).sensehawk.com/elements/feature/.*)",
      pattern: /https:\/\/(?:therm-stage-server|therm-server)\.sensehawk\.com\/elements\/feature\/(.*)\?.*/g,
      successCallback: ({ data }) => data,
      failedCallback: async ({ url, responseData, pattern }) => {
        const id = ticketsHelper.util.parseURLPattern(url, pattern);
        const data = ticketsHelper.util.craftResponseFromID(responseData, id);
        await ticketsHelper.util.setElementData("therm", data);
        return data;
      },
    },
  });

  routes("checklists", {
    storeName: "offline_checklist",
    responseData: (id, data) => {
      return {
        message: "checklist created successfully",
        uid: id,
        data: data,
      };
    },
    get: {
      url:
        "(https://(?:tickets-stage-server|tickets-server).sensehawk.com/tickets/.*/checklists.*)",
      pattern: /https:\/\/(?:tickets-stage-server|tickets-server)\.sensehawk\.com\/tickets\/(.*)\/checklists.*/g,
      successCallback: ({ data }) => {
        return data;
      },
      failedCallback: async ({ storeData, url, pattern }) => {
        const id = ticketsHelper.util.parseURLPattern(url, pattern);
        let finalData = [];
        ticketsHelper.util.checkAndExecuteFunction(
          await store.Checklist.get(),
          id,
          (data) => (finalData = finalData.concat(data))
        );
        ticketsHelper.util.checkAndExecuteFunction(
          storeData,
          id,
          (data) =>
            (finalData = ticketsHelper.util.applyOfflineData(
              finalData,
              data.create,
              data.update
            ))
        );
        finalData.forEach((d) =>
          d.items.forEach((f) => (f.status = f.status ? f.status : null))
        );
        return { error: true, data: finalData };
      },
    },
    patch: {
      url:
        "(https://(?:tickets-stage-server|tickets-server).sensehawk.com/tickets/.*/checklists/.*/?.*)",
      pattern: /https:\/\/(?:tickets-stage-server|tickets-server)\.sensehawk\.com\/tickets\/(.*)\/checklists\/(.*)\/\?.*/g,
      callback: ({ storeData, url, data, pattern }) => {
        const id = ticketsHelper.util.parseURLPattern(url, pattern);
        storeData[id] = storeData[id]
          ? storeData[id]
          : { update: {}, create: [] };
        storeData[id].update[data.uid] = ticketsHelper.util.updateData(
          storeData[id].update,
          data.uid,
          data
        );
        return storeData;
      },
    },
    post: {
      url:
        "(https://(?:tickets-stage-server|tickets-server).sensehawk.com/tickets/.*/checklists/?.*)",
      pattern: /https:\/\/(?:tickets-stage-server|tickets-server)\.sensehawk\.com\/tickets\/(.*)\/checklists.*/g,
      callback: ({ storeData, url, data, pattern }) => {
        const id = ticketsHelper.util.parseURLPattern(url, pattern);
        storeData[id] = storeData[id]
          ? storeData[id]
          : { update: {}, create: [] };
        storeData[id].create.push(data);
        return storeData;
      },
    },
  });

  routes("tickets", {
    storeName: "offline_tickets",
    responseData: (id, data) => {
      return {
        message: "ticket created successfully",
        uid: id,
        error: false,
        data: data,
      };
    },
    get: {
      url:
        "(https://(?:tickets-stage-server|tickets-server).sensehawk.com/tickets/((?!attachments).)*$)",
      pattern: /https:\/\/(?:tickets-stage-server|tickets-server)\.sensehawk\.com\/tickets\/([a-zA-Z0-9-~_]*)\/?.*/g,
      successCallback: ({ url, data }) => {
        const params = api.urlParser(url).getParams();
        try {
          if (Array.isArray(data)) {
            if (!params.element && !params.polygon) {
              store.TicketList.setData((db) => {
                return Object.assign(db, data);
              });
            }
            store.Ticket.setData((db) => {
              data.forEach((d) => {
                if (d.targetElement.uid) {
                  if (!db[d.targetElement.uid]) {
                    db[d.targetElement.uid] = {};
                  }
                  db[d.targetElement.uid][d.uid] = d;
                }
              });
              return db;
            });
            ticketsHelper.util.fetchChecklistForTickets(
              data.map((d) => d.uid),
              params.organization
            );
          }
        } catch (e) {
          console.log(e);
        }
        return data;
      },
      failedCallback: async ({ storeData, url, pattern }) => {
        try {
          const params = api.urlParser(url).getParams();
          tickets = storeData.create;
          let elements = await store.Ticket.get();
          const id = ticketsHelper.util.parseURLPattern(url, pattern);
          if (id) {
            let elements = {};
            Object.values(await store.Ticket.get()).reduce((a, c) => {
              Object.assign(a, c);
              return a;
            }, elements);
            storeData.create.reduce((a, c) => {
              Object.assign(a, { [c.uid]: c });
              return a;
            }, elements);
            if (elements[id])
              return storeData.update[id]
                ? { ...elements[id], ...storeData.update[id] }
                : elements[id];
            else return Response.error();
          }
          if (!params.element && !params.polygon) {
            let list = await store.TicketList.get();
            tickets.forEach((d) => {
              d.tags = [];
              d.createdAt = new Date().toISOString();
            });
            return ticketsHelper.util.applyOfflineData(
              tickets,
              list,
              storeData.update
            );
          }
          if (params.element) {
            tickets = tickets.filter(
              (d) => params.element == d.targetElement.uid
            );
            tickets = ticketsHelper.util.updateTickets(
              elements[params.element],
              tickets,
              storeData.update,
              () => {
                return Object.values(elements[params.element]).reduce(
                  (c, a) => c.concat(a),
                  []
                );
              }
            );
            return tickets;
          }
          if (params.polygon) {
            let coordinates = JSON.parse(atob(params.polygon)).coordinates;
            polygon = turf.polygon(coordinates);
            tickets = ticketsHelper.util.updateTickets(
              elements && Object.keys(elements).length > 0,
              tickets,
              storeData.update,
              () => {
                return Object.keys(elements).reduce(
                  (c, d) => c.concat(Object.values(elements[d])),
                  []
                );
              }
            );
            return tickets.filter((d) =>
              d.location
                ? turf.booleanPointInPolygon(d.location.coordinates, polygon)
                : false
            );
          }
        } catch (e) {
          console.log(e);
        }
        return Response.error();
      },
    },
    patch: {
      url:
        "(https://(?:tickets-stage-server|tickets-server).sensehawk.com/tickets/.*/?.*)",
      pattern: /https:\/\/(?:tickets-stage-server|tickets-server)\.sensehawk\.com\/tickets\/(.*)\?.*/g,
      callback: ({ storeData, url, data, pattern }) => {
        const id = ticketsHelper.util.parseURLPattern(url, pattern);
        storeData.update[id] = ticketsHelper.util.updateData(
          storeData.update,
          id,
          data
        );
        return storeData;
      },
    },
    post: {
      url:
        "(https://(?:tickets-stage-server|tickets-server).sensehawk.com/tickets/?.*)",
      callback: ({ storeData, data, url }) => {
        if (url.indexOf("attachments/bulkCreate") > 0) {
          throw "Wrong Request";
          return storeData;
        }
        data.writeAccess = true;
        data.tags = [];
        storeData.create.push(data);
        return storeData;
      },
    },
  });
}

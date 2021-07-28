//offline functionality
async function routes(type, { storeName, get, post, patch, responseData }) {
  //Helper methods

  let createOfflineResponse = async (data) => {
    var blob = new Blob([JSON.stringify(await data, null, 2)], {
      type: "application/json",
    });
    var init = { status: 200, statusText: "Offline" };
    return new Response(blob, init);
  };

  let callback = async ({ event, method }) => {
    let clone = event.request.clone();
    if (await store.offline_client.get()) {
      return new workbox.strategies.CacheOnly()
        .handle({ event })
        .then((res) => res)
        .catch((e) => {
          return createOfflineResponse(method(event.request.url, clone));
        });
    } else {
      return new workbox.strategies.NetworkOnly()
        .handle({ event })
        .then((res) => res)
        .catch((e) => {
          if (
            self &&
            self.registration &&
            self.registration.sync &&
            self.registration.sync.register
          ) {
            self.registration.sync.register("ticketSync").catch((err) => {
              console.log("Sync registration failed :(", err);
            });
          }
          return createOfflineResponse(method(event.request.url, clone));
        });
    }
  };

  let createCallback = (method) => {
    return ({ event }) => {
      return callback({ event, method: method });
    };
  };

  // --------------End of helper methods

  //--------------Routes
  if (get) {
    workbox.routing.registerRoute(new RegExp(get.url), async ({ event }) => {
      var isOffline = await store.offline_client.get();
      return new workbox.strategies[isOffline ? "CacheOnly" : "NetworkOnly"]({
        cacheName: "api-cache",
        networkTimeoutSeconds: 3,
      })
        .handle({ event })
        .then(async (res) =>
          createOfflineResponse(
            get.successCallback({
              storeData: await store[storeName].get(),
              url: event.request.url,
              data: await res.json(),
              pattern: get.pattern,
            })
          )
        )
        .catch(async (e) => {
          return createOfflineResponse(
            await get.failedCallback({
              storeData: await store[storeName].get(),
              url: event.request.url,
              responseData,
              pattern: get.pattern,
            })
          );
        });
    });
  }

  if (post) {
    let postCallback = async (url, request) => {
      let data = await request.json();
      data.uid = uuidv4();
      data = { ...data, meta: { tempUid: data.uid } };
      let value = post.callback({
        storeData: await store[storeName].get(),
        url,
        data,
        responseData,
        pattern: post.pattern,
      });
      store[storeName].setData((db) => (db = value));
      return responseData(data.uid, data);
    };
    workbox.routing.registerRoute(
      new RegExp(post.url),
      createCallback(postCallback, type),
      "POST"
    );
  }

  if (patch) {
    let patchCallback = async (url, request) => {
      let data = await request.json();
      let storeData = await store[storeName].get();
      store[storeName].setData(
        (db) =>
          (db = patch.callback({
            storeData,
            url,
            data,
            responseData,
            pattern: patch.pattern,
          }))
      );
      return data;
    };
    workbox.routing.registerRoute(
      new RegExp(patch.url),
      createCallback(patchCallback, type),
      "PATCH"
    );
  }
}

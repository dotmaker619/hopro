// const broadcast = new BroadcastChannel("sw-init");

var api = (function controller() {
  return {
    initialize: async (token) => {
      let data = await idbKeyval.get("token");
      data.token = token ? token : data.token;
      api.ticket = createPostApi(data.url, data.token);
      api.core = createPostApi(data.core_url, data.token);
      api.terra = createPostApi(data.terra_url, data.token);
      api.therm = createPostApi(data.therm_url, data.token);
    },
    urlParser: (url) => {
      return {
        getParams: () => {
          const params = {};
          const hashes = url.slice(url.indexOf("?") + 1).split("&");
          hashes.map((hash) => {
            const [key, val] = hash.split("=");
            params[key] = decodeURIComponent(val);
          });
          return params;
        },
        getID: (pattern) => {
          pattern.lastIndex = 0;
          return pattern.exec(url);
        },
      };
    },
    getNewToken: (data) => {
      return new Promise((res, rej) => {
        (function callCoreApi(i = 0) {
          ticketsHelper.sendStatusToClient("start");
          fetch(data.core_url + "/token/lifetime/extend/", {
            method: "POST",
            headers: {
              Authorization: "jwt " + data.token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              redirect_uri: "/",
            }),
          })
            .then((d) => {
              ticketsHelper.sendStatusToClient("end");
              if (d.status === 200) {
                res(d.json());
              } else {
                if (i > 3) rej(d);
                else setTimeout(callCoreApi, 10000, ++i);
              }
            })
            .catch((e) => {
              ticketsHelper.sendStatusToClient("error");
              if (i > 3) rej(e);
              else setTimeout(callCoreApi, 10000, ++i);
            });
        })();
      });
    },
  };
  function createPostApi(prefix, token) {
    return async (url, data) => {
      ticketsHelper.sendStatusToClient("start");
      try {
        const response = await fetch(prefix + url, {
          method: "POST",
          headers: {
            Authorization: "jwt " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        ticketsHelper.sendStatusToClient("end");
        return response.json();
      } catch (e) {
        ticketsHelper.sendStatusToClient("error");
        throw e;
      }
    };
  }
})();

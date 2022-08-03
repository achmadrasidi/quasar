import axios from "axios";
import { Notify, Loading, QSpinnerHourglass } from "quasar";
import User from "./User";

const loadingOptions = {
  spinner: QSpinnerHourglass,
  spinnerColor: "white",
  spinnerSize: 100,
  backgroundColor: "blue-grey-10",
  message: "Some important process is in progress. Hang on...",
  messageColor: "white",
};

class RestService {}

RestService.get = (parameters) => {
  parameters = serializeParameters(parameters);
  return new Promise((resolve, reject) => {
    get(parameters)
      .then((res) => resolve(res))
      .catch((err) => {
        if (needRefreshToken(parameters, err)) {
          if (isAuthenticated()) {
            refreshToken(() => {
              return get(parameters)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
            });
          } else {
            reject(err);
          }
        } else {
          reject(err);
        }
      });
  });
};

RestService.post = (parameters) => {
  parameters = serializeParameters(parameters);
  return new Promise((resolve, reject) => {
    post(parameters)
      .then((res) => resolve(res))
      .catch((err) => {
        if (needRefreshToken(parameters, err)) {
          if (isAuthenticated()) {
            refreshToken(() => {
              return post(parameters)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
            });
          } else {
            reject(err);
          }
        } else {
          reject(err);
        }
      });
  });
};

RestService.put = (parameters) => {
  parameters = serializeParameters(parameters);
  return new Promise((resolve, reject) => {
    put(parameters)
      .then((res) => resolve(res))
      .catch((err) => {
        if (needRefreshToken(parameters, err)) {
          if (isAuthenticated()) {
            refreshToken(() => {
              return put(parameters)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
            });
          } else {
            reject(err);
          }
        } else {
          reject(err);
        }
      });
  });
};

RestService.patch = (parameters) => {
  parameters = serializeParameters(parameters);
  return new Promise((resolve, reject) => {
    patch(parameters)
      .then((res) => resolve(res))
      .catch((err) => {
        if (needRefreshToken(parameters, err)) {
          if (isAuthenticated()) {
            refreshToken(() => {
              return put(parameters)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
            });
          } else {
            reject(err);
          }
        } else {
          reject(err);
        }
      });
  });
};

RestService.delete = (parameters) => {
  parameters = serializeParameters(parameters);
  return new Promise((resolve, reject) => {
    remove(parameters)
      .then((res) => resolve(res))
      .catch((err) => {
        if (needRefreshToken(parameters, err)) {
          if (isAuthenticated()) {
            refreshToken(() => {
              return remove(parameters)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
            });
          } else {
            reject(err);
          }
        } else {
          reject(err);
        }
      });
  });
};

/* ******************************************** REST Functions ******************************************** */

function get(parameters) {
  return new Promise((resolve, reject) => {
    if (parameters.loading) Loading.show(loadingOptions);
    axios
      .get(serializePath(parameters.path), {
        headers: getHeaders(),
        params: parameters.params,
      })
      .then((res) => {
        if (parameters.loading) Loading.hide();
        resolve(res);
      })
      .catch((err) => {
        if (parameters.loading) Loading.hide();
        const error =
          err && err.response && err.response.data ? err.response.data : err;
        if (parameters.errorNotification) handleError(error);
        reject(error);
      });
  });
}

function post(parameters) {
  return new Promise((resolve, reject) => {
    if (parameters.loading) Loading.show(loadingOptions);
    axios
      .post(serializePath(parameters.path), parameters.data, {
        headers: getHeaders(),
      })
      .then((res) => {
        if (parameters.loading) Loading.hide();
        resolve(res);
      })
      .catch((err) => {
        if (parameters.loading) Loading.hide();
        const error =
          err && err.response && err.response.data ? err.response.data : err;
        if (parameters.errorNotification) handleError(error);
        reject(error);
      });
  });
}

function put(parameters) {
  return new Promise((resolve, reject) => {
    if (parameters.loading) Loading.show(loadingOptions);
    axios
      .put(serializePath(parameters.path), parameters.data, {
        headers: getHeaders(),
      })
      .then((res) => {
        if (parameters.loading) Loading.hide();
        resolve(res);
      })
      .catch((err) => {
        if (parameters.loading) Loading.hide();
        const error =
          err && err.response && err.response.data ? err.response.data : err;
        if (parameters.errorNotification) handleError(error);
        reject(error);
      });
  });
}

function patch(parameters) {
  return new Promise((resolve, reject) => {
    if (parameters.loading) Loading.show(loadingOptions);
    axios
      .patch(serializePath(parameters.path), parameters.data, {
        headers: getHeaders(),
      })
      .then((res) => {
        if (parameters.loading) Loading.hide();
        resolve(res);
      })
      .catch((err) => {
        if (parameters.loading) Loading.hide();
        const error =
          err && err.response && err.response.data ? err.response.data : err;
        if (parameters.errorNotification) handleError(error);
        reject(error);
      });
  });
}

function remove(parameters) {
  return new Promise((resolve, reject) => {
    if (parameters.loading) Loading.show(loadingOptions);
    axios
      .delete(serializePath(parameters.path), {
        headers: getHeaders(),
        params: parameters.params,
      })
      .then((res) => {
        if (parameters.loading) Loading.hide();
        resolve(res);
      })
      .catch((err) => {
        if (parameters.loading) Loading.hide();
        const error =
          err && err.response && err.response.data ? err.response.data : err;
        if (parameters.errorNotification) handleError(error);
        reject(error);
      });
  });
}

/* ******************************************** Refresh Token ******************************************** */

function needRefreshToken(parameters, err) {
  const allowed1 = err.statusCode === 401 && err.message === "Token Expired";
  const allowed2 =
    err.statusCode === 401 && parameters.path.indexOf(process.env.CORE) > -1;

  return allowed1 || allowed2;
}

function refreshToken(callback) {
  axios
    .get(
      serializePath("auth/refresh/" + localStorage.getItem("refresh_token")),
      { headers: getHeaders() }
    )
    .then((res) => {
      if (res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);
        callback();
      } else {
        User.logout();
      }
    })
    .catch(() => {
      User.logout();
    });
}

/* ******************************************** Additional Functions ******************************************** */

function getHeaders() {
  return {
    authorization: "Bearer " + localStorage.getItem("access_token") || null,
  };
}

function isAuthenticated() {
  return localStorage.getItem("access_token");
}

function serializePath(path) {
  if (!path) return;

  const rules = [path.indexOf("http://") === 0, path.indexOf("https://") === 0];
  const isExternalResources = rules.some((el) => el);
  const serializedURL = isExternalResources ? path : process.env.API + path;

  return serializedURL.replace(/([^:]\/)\/+/g, "$1");
}

function serializeParameters(args) {
  return {
    path: args.path ? args.path : null,
    params: args.params ? args.params : {},
    data: args.data ? args.data : {},
    loading: Object.prototype.hasOwnProperty.call(args, "loading")
      ? args.loading
      : true,
    errorNotification: Object.prototype.hasOwnProperty.call(
      args,
      "errorNotification"
    )
      ? args.errorNotification
      : true,
  };
}

function handleError(error) {
  if (error && error.statusCode) {
    switch (error.statusCode) {
      case 401:
        if (
          error.message === "Token Expired" ||
          error.message === "Token is null or Invalid Signature"
        ) {
          localStorage.clear();
          document.location = "/";
          return false;
        }

        break;
    }
  }

  let errorMessage = "Unknown Errors";

  errorMessage =
    typeof error === "string" || error instanceof String ? error : errorMessage;
  if (typeof error === "object" && error.statusCode) {
    const message = Array.isArray(error.message)
      ? error.message.map((el) => `<li>${el}</li>`).join("")
      : error.message;
    errorMessage = `<b>${error.statusCode} ${
      error.error ? error.error + "</b><br>" : ""
    }${message}`;
  }

  Notify.create({
    type: "negative",
    position: "top-right",
    message: errorMessage,
    html: true,
  });
}

export default RestService;

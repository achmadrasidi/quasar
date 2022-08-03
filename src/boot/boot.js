import { boot } from "quasar/wrappers";
import jwt_decode from "jwt-decode";
import RestService from "src/services/RestService";

export default boot(async (/* { app, router, ... } */) => {
  const coreToken = localStorage.accessToken;
  if (coreToken) {
    localStorage.setItem("access_token", coreToken);

    const { data } = await RestService.get({ path: "auth/generate/token" });

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(jwt_decode(data.access_token)));
  }
});

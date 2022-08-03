<template>
  <div class="container">
    <div class="login-box shadow-3">
      <div class="info text-white">
        <div class="txt-title">{{ productName }}</div>
        <div class="txt-subtitle">{{ description }}</div>
        <div class="txt-version">Version: {{ version }}</div>
      </div>
      <div class="login">
        <img alt="Quasar logo" src="/images/logo.png" style="width: 200px" />
        <div class="text-h4 text-center q-pt-md">Login</div>
        <div class="q-pa-lg full-width">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              rounded
              outlined
              dense
              v-model="data.username"
              label="Username"
              hide-bottom-space
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'This field is required!',
              ]"
            />

            <q-input
              type="password"
              rounded
              outlined
              dense
              v-model="data.password"
              label="Password"
              hide-bottom-space
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'This field is required!',
              ]"
            />

            <div class="text-right">
              <q-btn
                rounded
                class="full-width"
                label="Login"
                type="submit"
                color="positive"
              />
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pkg from "../../package.json";
import { defineComponent, ref } from "vue";
import RestService from "src/services/RestService";
import jwt_decode from "jwt-decode";

export default defineComponent({
  name: "PageLogin",
  setup() {
    const productName = pkg.productName;
    const description = pkg.description;
    const version = pkg.version;
    const data = ref({});
    return { productName, description, version, data };
  },
  methods: {
    async onSubmit() {
      try {
        const { data } = await RestService.post({
          path: "users/login",
          data: this.data,
          errorNotification: false,
        });

        if (data && data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);

          localStorage.setItem(
            "user",
            JSON.stringify(jwt_decode(data.accessToken))
          );

          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect);
          } else {
            this.$router.push("/");
          }
        }
      } catch (e) {
        console.log(e);
        let message = e.message;
        if (Array.isArray(e.message)) {
          message = e.message.map((el) => `<li>${el}</li>`).join("");
        }

        this.$q.notify({
          html: true,
          type: "negative",
          position: "center",
          message: message,
          actions: [{ label: "Dismiss", color: "white" }],
        });
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: $blue-grey-1;

  .login-box {
    display: grid;
    grid-template-areas: "info login";
    grid-template-columns: 3fr 2fr;
    width: 80%;
    max-width: 1000px;
    height: 80vh;
    border-radius: 8px;
    background: #fff;

    .info {
      grid-area: info;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: url("/images/background.jpg") no-repeat center;
      -webkit-background-size: cover;
      -moz-background-size: cover;
      -o-background-size: cover;
      background-size: cover;
      border-radius: 8px 0px 0px 8px;
    }

    .login {
      grid-area: login;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
}

.txt-title {
  background: #000000cc;
  border-radius: 8px;
  padding: 8px 16px;
  margin-top: 16px;
  font-size: 20px;
  font-weight: bold;
}

.txt-subtitle {
  background: #000000cc;
  border-radius: 8px;
  padding: 8px 16px;
  margin-top: 16px;
  font-size: 16px;
}

.txt-version {
  background: #000000cc;
  border-radius: 8px;
  padding: 8px 16px;
  margin-top: 16px;
  font-size: 16px;
}

@media (max-width: $breakpoint-xs-max) {
  .container {
    .login-box {
      grid-template-areas: "login" !important;
      grid-template-columns: 1fr !important;
      width: calc(100% - 40px);
      height: calc(100vh - 40px);

      .info {
        display: none !important;
      }
    }
  }
}
</style>

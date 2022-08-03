<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="shadow-1">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> Application </q-toolbar-title>
        <q-space />
        <div>{{ date }}</div>
        &nbsp; | &nbsp;
        <div class="text-weight-bold">
          {{ user.name }}
          <q-btn flat round dense icon="arrow_drop_down">
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list style="min-width: 100px">
                <q-item clickable @click="logout">
                  <q-item-section>Logout</q-item-section>
                  <q-item-section avatar>
                    <q-icon color="primary" name="logout" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      :width="270"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="main-menu"
    >
      <div class="text-center">
        <a href="/">
          <img class="logo" src="/images/logo.png" />
        </a>
      </div>
      <div class="scroll list-menu">
        <SideMenu :menu="menu" />
      </div>
      <q-item class="version">
        <q-item-section bordered>
          <q-item-label class="text-center text-weight-light"
            >Version {{ version }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import pkg from "../../package.json";
import { defineComponent, ref } from "vue";
import SideMenu from "./SideMenu.vue";
import User from "src/services/User";
import moment from "moment";

export default defineComponent({
  name: "MainLayout",
  components: { SideMenu },
  setup() {
    const version = pkg.version;
    const date = moment().format("dddd, DD MMMM YYYY");
    const api = process.env.API;
    const user = User.get();
    const leftDrawerOpen = ref(false);
    const toggleLeftDrawer = () =>
      (leftDrawerOpen.value = !leftDrawerOpen.value);

    const menu = [
      { title: "Navigations" },
      { title: "Home", icon: "home", link: "#/" },
      { title: "New Request", icon: "add_circle", link: "#/request/new" },
      {
        title: "Requests",
        icon: "format_list_bulleted",
        items: [
          { title: "Need My Attention", link: "#/requests/nma" },
          { title: "My Draft", link: "#/requests/draft" },
          { title: "My Request", link: "#/requests/my" },
          { title: "All Request", link: "#/requests" },
        ],
      },
      { title: "Configurations" },
      {
        title: "Parameters",
        caption: "Application Parameters",
        icon: "tune",
        link: "#/configuration/parameter",
      },
    ];

    return { version, date, api, user, menu, leftDrawerOpen, toggleLeftDrawer };
  },
  methods: {
    logout() {
      User.logout("/");
    },
  },
});
</script>
<style lang="scss" scoped>
img.logo {
  width: 200px;
  height: auto;
}

.main-menu {
  overflow: hidden !important;
}

.list-menu {
  max-height: calc(100vh - 114px);
}

.version {
  position: fixed;
  background: #fff;
  bottom: 0px;
  width: 269px;
}
</style>

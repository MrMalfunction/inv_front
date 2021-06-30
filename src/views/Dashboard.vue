<template>
  <div>
    <md-toolbar md-elevation="0" style="margin-top: 10px">

      <h3 class="md-title" style="flex: 1; text-align: center">Welcome to {{ this.shopName }}</h3>
    </md-toolbar>
    Welcome {{ username }}
    <div class="mainMenu">
      <span v-for="(check, roleName) in roles" :key="roleName" >
        <router-link :to="roleName">
          <md-button class="menu" v-if='check === "true"'>{{ roleName | replace('_',' ') }}</md-button>
        </router-link>
      </span>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";

const cookieExpiry = "100s";


export default {
  name: "Dashboard",
  data() {
    return {
      roles: [],
      username: null,
      shopName: null
    }
  },
  filters: {
    replace: function (st, rep, repWith) {
      const result = st.split(rep).join(repWith)
      return result;
    }
  },
  methods: {
    async CC() {
      if (!Vue.$cookies.get("CC")) {
        const self = this;
        this.sending = true
        var shopid = Vue.$cookies.get("shopid");
        if (!(shopid === null)) {
          var data = JSON.stringify({
            "shopid": Vue.$cookies.get("shopid"),
            "username": Vue.$cookies.get("username"),
            "cookie": Vue.$cookies.get("shopid"),
            "type": "CC"
          });

          var config = {
            method: 'post',
            url: 'https://inv.amolbohora.com/auth',
            headers: {
              'Content-Type': 'application/json'
            },
            data: data
          };

          await axios(config)
              .then(function (response) {
                Vue.$cookies.set("CC", "true", cookieExpiry)
                Vue.$cookies.set("Roles", response.data['role'], cookieExpiry)
              })
              .catch(function () {
                Vue.$cookies.remove("cookie")
                Vue.$cookies.remove("username")
                Vue.$cookies.remove("shopid")
                Vue.$cookies.remove("CC")
                self.$router.push("/")
              });
        } else {
          this.$router.push("/")
        }
      }
    },

    roleCheck() {
      if (!Vue.$cookies.isKey("Roles")) {
        Vue.$cookies.remove("cookie")
        Vue.$cookies.remove("username")
        Vue.$cookies.remove("shopid")
        Vue.$cookies.remove("CC")
        this.$router.push("/")
      }
      this.roles = Vue.$cookies.get("Roles")
      this.username = Vue.$cookies.get("username")
      this.shopName = Vue.$cookies.get("shopid")
    }
  },
  beforeMount() {
    this.CC();
    this.roleCheck()
  }
}
</script>

<style scoped>

.menu {
  background: #E10032;
  border-radius: 12px;
  color: white;
  min-width: 300px;
  min-height: 70px;
}

.mainMenu {
  margin-top: 10%;
  margin-left: 9vw;
  margin-right: 10vw;
}

</style>
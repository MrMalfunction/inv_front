<template>
  <div>
    <md-toolbar md-elevation="0" style="margin-top: 10px">

      <h3 class="md-title" style="flex: 1; text-align: center">Welcome to {{ this.shopName }}</h3>
    </md-toolbar>
    Welcome {{ username }}<br>
    <div class=" mainArea md-small-size-100 md-elevation-15">
      <span class="md-display-1">Enter the year for export of annual data</span>
      <md-field>
        <label>Year</label>
        <md-input v-model="fetchYear" type="number" aria-valuemin="2000"></md-input>
      </md-field>
      <md-field>
        <label>Email-id</label>
        <md-input v-model="email" type="email"></md-input>
      </md-field>
      <md-button type="submit" class="md-accent" @click="submit">Export</md-button>
    </div>
    <md-dialog-alert
        :md-active.sync="success_Visibilty"
        md-content= "Export Request Sent, will arrive on the mentioned email"
        md-confirm-text="Close"/>
    <md-snackbar :md-duration="2000" :md-active.sync="showSnackbar" md-persistent>
      <span> {{ this.errorMessage }} </span>
      <md-button class="md-primary" @click="showSnackbar = false">Close</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";

const cookieExpiry = "100s";


export default {
  name: "Export",
  components: {},
  computed: {},
  data() {
    return {
      username: null,
      shopName: null,
      fetchYear: null,
      email: null,
      showSnackbar: false,
      errorMessage: null,
      success_Visibilty: false
    }
  },

  methods: {

    async submit() {
      var data = JSON.stringify({
        "shopid": Vue.$cookies.get('shopid'),
        "username": Vue.$cookies.get("username"),
        "year": this.fetchYear,
        "email": this.email,
        "cookie": Vue.$cookies.get('cookie')
      });
      console.log(data);
      var config = {
        method: 'post',
        url: 'https://inv.amolbohora.com/export',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      var that = this;
      axios(config)
          .then(function(response){
            if (response.status === 200){
              that.success_Visibilty = true
            }
          })
          .catch(function (error) {
            that.showSnackbar = true;
            that.errorMessage = error.response.data['Message'];
            console.log(error);
            window.setTimeout(() => {
              if (error.response.data['Message'] === "Cookie not matched") {
                Vue.$cookies.remove("cookie")
                Vue.$cookies.remove("username")
                Vue.$cookies.remove("shopid")
                Vue.$cookies.remove("CC")
                that.$router.replace("/")
              }
            }, 1000)
          });

    },

    async CC() {
      if (!Vue.$cookies.isKey("CC")) {
        const self = this;
        this.sending = true
        var shopid = Vue.$cookies.get("shopid");
        if (!(shopid === null)) {
          var data = JSON.stringify({
            "shopid": Vue.$cookies.get("shopid"),
            "username": Vue.$cookies.get("username"),
            "cookie": Vue.$cookies.get("cookie"),
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
      if (!Vue.$cookies.get("Roles")["Export"] === "true") {
        Vue.$cookies.remove("cookie")
        Vue.$cookies.remove("username")
        Vue.$cookies.remove("shopid")
        Vue.$cookies.remove("CC")
        this.$router.push("/")
      }
      this.username = Vue.$cookies.get("username")
      this.shopName = Vue.$cookies.get("shopid")
    }
  },
  beforeMount() {
    this.CC();
    this.roleCheck();
    this.autoOn = localStorage.getItem("auto") === 'true';
    this.active = localStorage.getItem("auto") === 'true';
  }
}
</script>

<style scoped>

.mainArea {
  min-width: 50vw;
  margin: 20px 0 0 0;
  padding: 20px;
  display: inline-block;
  vertical-align: center;
  border-radius: 10px;
}

</style>
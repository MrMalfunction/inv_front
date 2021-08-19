<template>
  <div>
    <md-toolbar md-elevation="0" style="margin-top: 10px">
      <h3 class="md-title" style="flex: 1; text-align: center">Welcome to {{ this.shopName }}</h3>
    </md-toolbar>
    Welcome {{ username }}<br>
    <form novalidate @submit.prevent="">
      <div class=" mainArea md-small-size-100 md-elevation-15">
        <md-field>
          <label>Employee Name</label>
          <md-input v-model="employeeName"></md-input>
        </md-field>
        <div class="roles">
          <md-checkbox v-model="roles" value="SignUp">SignUp</md-checkbox>
          <md-checkbox v-model="roles" value="View_Past">View Past</md-checkbox>
          <md-checkbox v-model="roles" value="Return">Return</md-checkbox>
          <md-checkbox v-model="roles" value="Data_In">Data In</md-checkbox>
          <md-checkbox v-model="roles" value="Data_Out">Data Out</md-checkbox>
          <md-checkbox v-model="roles" value="View_Live">View Live</md-checkbox>
          <md-checkbox v-model="roles" value="Reset">Reset</md-checkbox>
        </div>
        <md-field>
          <label>Employee Password</label>
          <md-input v-model="employeePassword"></md-input>
        </md-field>
        <md-field>
          <label>Your Password</label>
          <md-input v-model="password" type="password"></md-input>
        </md-field>
        <md-button type="submit" class="md-accent" @click="submit">Submit</md-button>
      </div>
    </form>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";

const cookieExpiry = "100s";


export default {
  name: "SignUp",
  components: {},
  computed: {},
  data() {
    return {
      employeeName: null,
      employeePassword: null,
      roles: [],
      password: null
    }
  },

  methods: {
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
      if (!(Vue.$cookies.get("Roles")["SignUp"] === "true")) {
        Vue.$cookies.remove("cookie")
        Vue.$cookies.remove("username")
        Vue.$cookies.remove("shopid")
        Vue.$cookies.remove("CC")
        this.$router.push("/")
      }
      this.username = Vue.$cookies.get("username")
      this.shopName = Vue.$cookies.get("shopid")
    },
    submit(){
      var data = JSON.stringify({
        "shopid": Vue.$cookies.get('shopid'),
        "username": Vue.$cookies.get("username"),
        "new_username": this.employeeName,
        "new_password": this.employeePassword,
        "roles": this.roles,
        "password": this.password,
        "type": "SignUp"
      });
      console.log(data);
      var config = {
        method: 'post',
        url: 'https://inv.amolbohora.com/auth',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      var that = this;
      axios(config)
          .then(function (response) {
            console.log(response.data);
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
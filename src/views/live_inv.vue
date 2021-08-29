<template>
  <div>
    <md-toolbar md-elevation="0" style="margin-top: 10px">
      <h3 class="md-title" style="flex: 1; text-align: center">Welcome to {{ this.shopName }}</h3>
    </md-toolbar>
    Welcome {{ username }}<br>
    <form class="form" novalidate @submit.prevent="">
      <div class=" mainArea md-small-size-100 md-elevation-10">
        <div style="text-align: center;" class="md-headline">View Live Inventory</div>
        <md-autocomplete v-model="itemName"  :md-options="itemList" :md-open-on-focus="false">
          <label>Item Name</label>
          <template slot="md-autocomplete-item" slot-scope="{ item, term }">
            <md-highlight-text :md-term="term">{{ item }}</md-highlight-text>
          </template>
        </md-autocomplete>
        <md-button type="submit" class="md-accent md-raised" @click="getLive">Fetch Data</md-button>
        <md-dialog-alert
            :md-active.sync="liveVisiblity"
            :md-content= liveText
            md-confirm-text="Close"/>
      </div>
    </form>
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
  name: "Live_Inventory",
  components: {},
  computed: {
    liveText : function (){
      return this.itemName + " has a live count of <b> " + this.livecount + "</b>";
    }
  },
  data() {
    return {
      username: null,
      shopName: null,
      itemName: '',
      itemList : [],
      livecount: null,
      liveVisiblity: false,
      showSnackbar: false,
      errorMessage: null
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
      if (!(Vue.$cookies.get("Roles")["View_Live"] === "true")) {
        Vue.$cookies.remove("cookie")
        Vue.$cookies.remove("username")
        Vue.$cookies.remove("shopid")
        Vue.$cookies.remove("CC")
        this.$router.push("/")
      }
      this.username = Vue.$cookies.get("username")
      this.shopName = Vue.$cookies.get("shopid")
    },
    async getLive() {
      if (this.itemName === ''){
        alert('Please Provide ItemName');
        return;
      }
      var data = JSON.stringify({
        'username': Vue.$cookies.get('username'),
        'shopid': Vue.$cookies.get('shopid'),
        'cookie': Vue.$cookies.get('cookie'),
        'item': this.itemName
      })
      var config = {
        method: 'post',
        url: 'https://inv.amolbohora.com/invLive',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      }
      var that = this;
      await axios(config)
          .then(function (response) {
            if (response.data['Items'].length === 0){
              alert("Item Not Found");
              return;
            }
            that.livecount = response.data['Items'][0]['liveCount']
            that.liveVisiblity = true
          })
          .catch(function (error) {
            console.log(error);
          })
    },
  listChecker(){
    let local_data = localStorage.getItem("Merchant");
    console.log(local_data)
    if (local_data === null){
      var data = JSON.stringify({
        "shopid" : Vue.$cookies.get("shopid"),
        "type" : "Merchant",
        "selection" : "Retrieve",
        "len" : 0
      })
      var config = {
        method: 'post',
        url: 'https://inv.amolbohora.com/auto',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      var that = this;
      axios(config)
          .then(function (response) {
            console.log(response.data['Data'])
            that.merchantList = response.data['Data']
            localStorage.setItem("Merchant", JSON.stringify(that.merchantList))
          })
          .catch(function (error){
            that.showSnackbar = true;
            that.errorMessage = error.response.data['Message'];
            console.log(error);
          });
    }
    else {
      this.merchantList  = JSON.parse(localStorage.getItem("Merchant"))
    }

    local_data = localStorage.getItem("Items");
    console.log(local_data)
    if (local_data === null){
      data = JSON.stringify({
        "shopid" : Vue.$cookies.get("shopid"),
        "type" : "Items",
        "selection" : "Retrieve",
        "len" : 0
      })
      config = {
        method: 'post',
        url: 'https://inv.amolbohora.com/auto',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      that = this;
      axios(config)
          .then(function (response) {
            console.log(response.data['Data'])
            that.itemList = response.data['Data']
            localStorage.setItem("Items", JSON.stringify(that.itemList))
          })
          .catch(function (error){
            that.showSnackbar = true;
            that.errorMessage = error.response.data['Message'];
            console.log(error);

          });
    }
    else {
      this.itemList = JSON.parse(localStorage.getItem("Items"))
    }
  }
  },
  beforeMount() {
    this.CC();
    this.roleCheck();
    this.listChecker();
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

@media screen and (max-width: 765px) {
  .mainArea {
    min-width: 90vw;
    padding: 5px;
  }
}

</style>
<template>
  <div>
    <md-toolbar md-elevation="0" style="margin-top: 10px">

      <h3 class="md-title" style="flex: 1; text-align: center">Welcome to {{ this.shopName }}</h3>
    </md-toolbar>
    Welcome {{ username }}<br>
    <div class="Form">
      <form novalidate @submit.prevent="">
        <div class=" mainArea md-small-size-100 md-elevation-15">
          <span class="md-display-2">View Past Transactions</span><br>
          <div class="date_picker">
            <md-datepicker v-model="fromDate" md-immediately>
              <label>From Date</label>
            </md-datepicker>
          </div>
          <div class="date_picker">
            <md-datepicker v-model="toDate" md-immediately>
              <label>To Date</label>
            </md-datepicker>
          </div>
          <div class="md-layout-item">
            <md-field>
              <md-select v-model="type" placeholder="Type of Transaction">
                <md-option value="IN" aria-selected="true">IN</md-option>
                <md-option value="OUT">OUT</md-option>
              </md-select>
              <span class="md-helper-text">Default Value IN</span>
            </md-field>
          </div>
          <md-autocomplete v-model="merchant" :md-options="merchantList" :class="{ 'md-invalid': merchantNameCheck }" :md-open-on-focus="false" :md-fuzzy-search="true">
            <label>Merchant Name</label>
            <template slot="md-autocomplete-item" slot-scope="{ item, term }">
              <md-highlight-text :md-term="term">{{ item }}</md-highlight-text>
            </template>
            <span class="md-helper-text">Optional</span>
          </md-autocomplete>
          <div>
            <md-button type="submit" class="md-accent" @click="submit">Submit</md-button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";

const cookieExpiry = "100s";


export default {
  name: "pastTransactions",
  components: {},
  computed: {},
  data() {
    let now = new Date()
    let past = (d => new Date(d.setDate(d.getDate() - 7)))(new Date)
    return {
      username: null,
      shopName: null,
      merchantName: null,
      merchantList: [],
      type: "",
      fromDate: Number(now),
      toDate: Number(past),
      tableData: null,
      lastKey: null

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
    listChecker() {
      let local_data = localStorage.getItem("Merchant");
      console.log(local_data)
      if (local_data === null) {
        var data = JSON.stringify({
          "shopid": Vue.$cookies.get("shopid"),
          "type": "Merchant",
          "selection": "Retrieve",
          "len": 0
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
            .catch(function (error) {
              that.showSnackbar = true;
              that.errorMessage = error.response.data['Message'];
              console.log(error);
            });
      } else {
        this.merchantList = JSON.parse(localStorage.getItem("Merchant"))
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
      if (!Vue.$cookies.get("Roles")["Data_In"] === "true") {
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
    this.listChecker();
    this.autoOn = localStorage.getItem("auto") === 'true';
    this.active = localStorage.getItem("auto") === 'true';
  }
}
</script>

<style scoped>

.date_picker {
  display: inline-flex;
  min-width: 25vw;
}

.mainArea {
  min-width: 50vw;
  margin: 20px 0 0 0;
  padding: 20px;
  display: inline-block;
  vertical-align: center;
  border-radius: 10px;
}

.Form {
  padding: 10px;
}
</style>
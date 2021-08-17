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
          <md-autocomplete v-model="merchantName" :md-options="merchantList" :md-open-on-focus="false"
                           :md-fuzzy-search="true">
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


    <md-table v-model="finalTableData" md-card class="tableArea" v-if="tableVisibilty" >
      <md-table-toolbar>
        <h1 class="md-title">Retrieved Data</h1>

      </md-table-toolbar>
      <md-table-row slot="md-table-row" slot-scope="{ item }" >
        <md-table-cell md-label="Timestamp"   class="tableRows">{{ item.timestamp }}</md-table-cell>
        <md-table-cell md-label="Transaction Id" class="tableRows">{{ item.Transaction_Id }}</md-table-cell>
        <md-table-cell md-label="Merchant" class="tableRows">{{ item.merchant }}</md-table-cell>
        <md-table-cell md-label="Total, Discount"  class="tableRows">{{ item.total }}</md-table-cell>
        <md-table-cell md-label="Data(Item Name, Item Count, Item Price)"   class="tableRows"> <pre>{{ item.data }}</pre> </md-table-cell>
      </md-table-row>

    </md-table>
    <div >
      <md-button  v-if="paginate === true" class="md-raised md-accent" @click="submit">Go to next Page</md-button>
    </div>
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
  name: "pastTransactions",
  components: {},
  computed: {
    tableVisibilty: function () {
      return (this.finalTableData !== null);

    }
  },
  data() {
    let now = new Date()
    let past = (d => new Date(d.setDate(d.getDate() - 7)))(new Date)
    return {
      username: null,
      shopName: null,
      merchantName: null,
      merchantList: [],
      type: "",
      fromDate: Number(past),
      toDate: Number(now),
      tableData: {
      },
      finalTableData: null,
      lastKey: "NULL",
      errorMessage: null,
      showSnackbar: false,
      paginate: false
    }
  },

  watch:{
    lastKey: function (){
      this.paginate = this.lastKey !== "NULL";
    },
    fromDate: function (){
      if (this.lastKey !== "NULL")
        this.lastKey = "NULL"
    },
    toDate: function (){
      if (this.lastKey !== "NULL")
        this.lastKey = "NULL"
    }
  },

  methods: {

    submit() {
      this.merchantName = this.merchantName === null ? "NULL" : this.merchantName;
      this.type = this.type === "" ? "IN" : this.type;

      var data = JSON.stringify({
        "shopid": Vue.$cookies.get('shopid'),
        "merchant": this.merchantName,
        "data": this.dataIn,
        "username": Vue.$cookies.get("username"),
        "cookie": Vue.$cookies.get("cookie"),
        "type": this.type,
        "time_start": (this.fromDate / 1000).toString(),
        "time_end": (this.toDate / 1000).toString(),
        "Last_Key": this.lastKey
      });
      console.log(data);
      var config = {
        method: 'post',
        url: 'https://inv.amolbohora.com/dataView',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      var that = this;
      axios(config)
          .then(function (response) {
            console.log(response.data);
            that.tableData = response.data;
            that.modifier();
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
    listChecker() {
      let local_data = localStorage.getItem("Merchant");
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
      if (!(Vue.$cookies.get("Roles")["View_Past"] === "true")) {
        Vue.$cookies.remove("cookie")
        Vue.$cookies.remove("username")
        Vue.$cookies.remove("shopid")
        Vue.$cookies.remove("CC")
        this.$router.push("/")
      }
      this.username = Vue.$cookies.get("username")
      this.shopName = Vue.$cookies.get("shopid")
    },
    modifier() {
      var temp = this.tableData['Items'];
      var MainItems = [];
      console.log(temp);
      for (var i = 0; i < temp.length; i++) {
        var Line = {
          "merchant": null,
          "cgst": null,
          "sgst": null,
          "igst": null,
          "timestamp": null,
          "Transaction_Id": null,
          "total": null,
          "data": ""
        }
        Line['merchant'] = temp[i]['merchant']
        Line['cgst'] = temp[i]['cgst'] === null ? '0' : temp[i]['cgst']
        Line['sgst'] = temp[i]['sgst'] === null ? '0' : temp[i]['sgst']
        Line['igst'] = temp[i]['igst'] === null ? '0' : temp[i]['igst']
        if (temp[i]['timestamp'] === "")
          Line['timestamp'] = "";
        else
          Line['timestamp'] = this.convertTimestamp(temp[i]['timestamp']);
        Line['Transaction_Id'] = temp[i]['transaction-id']
        Line['total'] = temp[i]['total'] + "," + temp[i]['discount'];
        let dataString = "";
        for (var j = 0; j < temp[i]['data'].length; j++) {
          if(temp[i]['data'][j]['itemName'] === "")
            continue;
          dataString += temp[i]['data'][j]['itemName'] + "," + temp[i]['data'][j]['itemCount'] + "," + temp[i]['data'][j]['itemPrice'] + '\n';
        }
        Line['data'] = dataString;
        MainItems.push(Line);
      }
      this.finalTableData = MainItems;
      this.lastKey = this.tableData['Last_Key']
      console.log(MainItems);
    },
    convertTimestamp(timestamp) {
      var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
          yyyy = d.getFullYear(),
          mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
          dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
          hh = d.getHours(),
          h = hh,
          min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
          ampm = 'AM',
          time;

      if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
      } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
      } else if (hh === 0) {
        h = 12;
      }

      // ie: 2013-02-18, 8:35 AM
      time = dd + '/' + mm + '/' + yyyy + ', ' + h + ':' + min + ' ' + ampm;

      return time;
    }
  },
  beforeMount() {
    this.modifier();
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


.tableArea{
  min-width: 30vw;
  padding: 20px;
  border-radius: 10px;
}

.tableRows{
  border-style: dashed;
  border-width: thin;
  text-align: left;
}
</style>
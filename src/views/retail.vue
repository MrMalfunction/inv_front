<template>
  <div>
    <md-toolbar md-elevation="0" style="margin-top: 10px">

      <h3 class="md-title" style="flex: 1; text-align: center">Welcome to {{ this.shopName }}</h3>
    </md-toolbar>
    Welcome {{ username }}<br>
    <md-switch v-model="autoOn" class="md-accent auto" @change="updateAutoOn">Camera Automatically</md-switch>
    <md-dialog-alert
        :md-active.sync="orderCheck"
        md-title="Order Id"
        :md-content= order_id_message />
    <div class="Form">
      <form novalidate @submit.prevent="">
        <div class=" mainArea md-small-size-100 md-elevation-15">

          <div class=" md-small-size-100">
            <div class=" item" v-for="(item, index) in dataIn" :key="index">
              <div class="cut md-accent" @click="remove(index)" v-show="index || ( !index && dataIn.length > 1)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                     class="bi bi-x-square" viewBox="0 0 16 16">
                  <path
                      d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                  <path
                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
              <md-autocomplete v-model="item.itemName" :md-options="itemList" :class="{ 'md-invalid': dataCheck[index]['itemName'] }" :md-open-on-focus="false"  @input="inputUpdate(index,'itemName')">
                <label >Item Name </label>
                <template slot="md-autocomplete-item" slot-scope="{ item, term }">
                  <md-highlight-text :md-term="term">{{ item }}</md-highlight-text>
                </template>

                <template slot="md-autocomplete-empty">
                  <a @click="update()">Create a new</a> one!
                </template>
                <span class="md-error">Item Name is Required</span>

              </md-autocomplete>
              <md-field :class="{ 'md-invalid': dataCheck[index]['itemCount'] }">
                <label >Item Count</label>
                <md-input  v-model="item.itemCount" @input="inputUpdate(index,'itemCount')"
                           type="number"/>
                <span class="md-error">Item Count is required</span>
              </md-field>
              <md-field :class="{ 'md-invalid': dataCheck[index]['itemPrice'] }">
                <label >Item Price</label>
                <md-input  v-model="item.itemPrice" @input="inputUpdate(index,'itemPrice')"
                           type="number"/>
                <span class="md-error">Item Price is required</span>
              </md-field>
              <span>
                <div class="cut" :md-ripple="false" @click="add(index)" v-show="index === dataIn.length-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                       class="bi bi-plus-square" viewBox="0 0 16 16">
                    <path
                        d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path
                        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                </div>
            </span>
            </div>
            <md-button @click="scan()" v-if="!active">Start Scanning for above item</md-button>
            <md-button @click="stop()" v-if="active">Stop Scanning</md-button>
            <StreamBarcodeReader v-if="active" @decode="(a, b, c) => onDecode(a)"></StreamBarcodeReader>
          </div>
          <div class="md-layout md-gutter md-alignment-center GST">
            <md-field class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100 gst-module ">
              <label>SGST %</label>
              <md-input type="number" v-model="sgst_percent" min=0 />
            </md-field>
            <md-field class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100 gst-module ">
              <label>CGST %</label>
              <md-input type="number" v-model="cgst_percent" min=0 />
            </md-field>
            <md-field class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100 gst-module ">
              <label>IGST %</label>
              <md-input type="number" v-model="igst_percent" min=0 />
            </md-field>
            <md-field class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100 gst-module ">
              <label>Discount %</label>
              <md-input type="number" v-model="discount" min=0 />
            </md-field>
          </div>
          <div class="TOT_SG">
            <div class="total_heading">TOTAL SGST</div>
            <div class="total_value">₹ {{ sgst }}</div>

            <div class="total_heading">TOTAL CGST</div>
            <div class="total_value">₹ {{ cgst }}</div>

            <div class="total_heading">TOTAL IGST</div>
            <div class="total_value">₹ {{ igst }}</div>
          </div>
          <div class="TOTAL md-title">
            <div class="total_heading">TOTAL</div>
            <div class="total_value">₹ {{ total }}</div>
          </div>
          <div>
            <md-button type="submit" class="md-accent" @click="submit">Submit</md-button>
          </div>
        </div>
      </form>
    </div>
    <md-snackbar :md-duration="2000" :md-active.sync="showSnackbar" md-persistent>
      <span> {{ this.errorMessage }} </span>
      <md-button class="md-primary" @click="showSnackbar = false">Close</md-button>
    </md-snackbar>
    <ReqMerger ref="ReqMerger"/>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";

const cookieExpiry = "100s";
import {StreamBarcodeReader} from "vue-barcode-reader";
import ReqMerger from "../components/ReqMerger";

export default {
  name: "Retail",
  components: {
    StreamBarcodeReader,
    ReqMerger
  },
  computed: {
    order_id_message : function (){
      return "Order Success <br> Order Id is <strong>" + this.order_id + " </strong>"
    },
    total_pre_tax: function () {
      var temp = 0
      for (var i = 0; i < this.dataIn.length; i++) {
        if (this.dataIn[i]['itemPrice'] !== '' && this.dataIn[i]['itemCount'] !== '')
          temp += parseFloat(this.dataIn[i]['itemPrice']) * (this.dataIn[i]['itemCount'])
      }
      return (temp.toFixed(2));
    },
    sgst: function () {
      if (this.sgst_percent > 0)
        return ((this.sgst_percent / 100.0) * this.finalPrice).toFixed(2)
      return 0.0
    },
    cgst: function () {
      if (this.cgst_percent > 0)
        return ((this.cgst_percent / 100.0) * this.finalPrice).toFixed(2)
      return 0.0
    },
    igst: function () {
      if (this.igst_percent > 0)
        return ((this.igst_percent / 100.0) * this.finalPrice).toFixed(2)
      return 0.0
    },
    total: function () {
      let discount;
      if (this.discount >=0) {
        discount = (this.discount / 100) * parseFloat(this.total_pre_tax);
        this.updateTotal(this.total_pre_tax - discount);
       this.updateDiscount(discount);
      }
      return  (parseFloat(this.finalPrice) + parseFloat(this.sgst) + parseFloat(this.cgst) + parseFloat(this.igst)).toFixed(2);
    }
  },
  data() {
    return {
      errorMessage: null,
      showSnackbar: false,
      merchantList: [],
      itemList : [],
      username: null,
      shopName: null,
      autoOn: false,
      barcode: [],
      finalPrice: 0,
      discount: 0,
      discountAmount: 0,
      dataIn: [
        {
          itemName: '',
          itemCount: '',
          itemPrice: ''
        }
      ],
      dataCheck: [
        {
          itemName: false,
          itemCount: false,
          itemPrice: false
        }
      ],
      data: [],
      active: false,
      sgst_percent: '',
      cgst_percent: '',
      igst_percent: '',
      order_id: '',
      orderCheck: false
    }
  },
  watch:{
    orderCheck : function (){
      if (this.orderCheck === false)
        this.$router.go();
    }
  },

  methods: {
    updateTotal(price){
      this.finalPrice = price;
    },
    updateDiscount(discount){
      this.discountAmount = discount;
    },
    updateAutoOn() {
      localStorage.setItem("auto", this.autoOn)
    },
    inputUpdate(index, type) {
      this.dataCheck[index][type] = false
    },

    add(index) {
      console.log(index)
      if (this.dataIn[index].itemName === '') {
        this.dataCheck[index].itemName = true
        return
      }

      if (this.dataIn[index].itemCount === '') {
        this.dataCheck[index].itemCount = true
        return
      }

      if (this.dataIn[index].itemPrice === '') {
        this.dataCheck[index].itemPrice = true
        return
      }

      this.dataIn.push({
        itemName: '',
        itemCount: '',
        itemPrice: ''
      })
      this.dataCheck.push({
        itemName: '',
        itemCount: '',
        itemPrice: ''
      })
      console.log(this.dataIn)
      if (this.autoOn === true)
        this.active = true
    },

    remove(index) {
      this.dataIn.splice(index, 1)
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
      if (!Vue.$cookies.get("Roles")["Data_Out"] === "true") {
        Vue.$cookies.remove("cookie")
        Vue.$cookies.remove("username")
        Vue.$cookies.remove("shopid")
        Vue.$cookies.remove("CC")
        this.$router.push("/")
      }
      this.username = Vue.$cookies.get("username")
      this.shopName = Vue.$cookies.get("shopid")
    },
    scan() {
      console.log(this.dataIn.length)
      this.active = true;
    },
    stop() {
      this.active = false;
    },
    onDecode(a) {
      console.log(a);
      this.barcode.push(a);
      if (this.barcode.length >= 1)
        this.setCode()
    },
    setCode() {
      this.dataIn[this.dataIn.length - 1]['itemName'] = this.barcode[0]
      this.barcode = []
      this.stop()
    },
    submit() {
      for (var i = 0; i < this.dataIn.length; i++){
        if (this.dataIn[i]['itemName'] === ''){
          this.dataCheck[i]['itemName'] = true
          return;
        }
        else {
          this.dataCheck[i]['itemName'] = false
        }
        if (this.dataIn[i]['itemCount'] === ''){
          this.dataIn[i]['itemCount'] = true
          return;
        }
        else {
          this.dataCheck[i]['itemCount'] = false
        }
        if (this.dataIn[i]['itemPrice'] === ''){
          this.dataCheck[i]['itemPrice'] = true
          return;
        }
        else {
          this.dataCheck[i]['itemPrice'] = false
        }
      }
      this.$refs.ReqMerger.transaction(this.dataIn,this.sgst,this.igst,this.cgst,this.total,this.discountAmount);
      this.dataIn = [
            {
              itemName: '',
              itemCount: '',
              itemPrice: ''
            }]
      this.dataCheck = [{
        itemName: false,
        itemCount: false,
        itemPrice: false
      }]
      this.discount = 0;
      /*var data = JSON.stringify({
        "merchant": this.merchant,
        "data": this.dataIn,
        "username": Vue.$cookies.get("username"),
        "shopid": Vue.$cookies.get("shopid"),
        "cookie": Vue.$cookies.get("cookie"),
        "type" : "OUT",
        "pre_tax" : this.total_pre_tax,
        "sgst" : this.sgst,
        "cgst" : this.cgst,
        "igst" : this.igst,
        "total" : this.total,
        "discount": this.discount
      });
      var config = {
        method: 'post',
        url: 'https://inv.amolbohora.com/dataIn',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      var order = '';
      var that = this;
      axios(config)
          .then(function (response) {
            order = response.data['Order Id']
            that.order_id = order;
            that.orderCheck = true;
          })
          .catch(function (error){
            that.showSnackbar = true;
            that.errorMessage = error.response.data['Message'];
            console.log(error);
            window.setTimeout(() => {
              if (error.response.data['Message'] === "Cookie not matched"){
                Vue.$cookies.remove("cookie")
                Vue.$cookies.remove("username")
                Vue.$cookies.remove("shopid")
                Vue.$cookies.remove("CC")
                that.$router.replace("/")
              }
            }, 1000)
          });*/
    },
    update(){
      this.merchantList.push(this.merchant)
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

.Form {
  padding: 10px;
}

.item {
  border-bottom: 1px dotted grey;
}

.auto {
  display: flex;
  justify-content: flex-end;
}

.GST {
  padding: 20px;
}

.gst-module {
  margin-left: 10px;
  margin-right: 10px;
}

.cut {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 10px;
  padding-top: 5px;
}

.total_heading {
  display: inline-block;
  text-align: left;
  padding: 10px;
}

.total_value {
  display: inline-block;
  vertical-align: baseline;
  text-align: end;
  padding: 10px;
}

</style>
<template>
  <div>
    <md-toolbar md-elevation="0" style="margin-top: 10px">

      <h3 class="md-title" style="flex: 1; text-align: center">Welcome to {{ this.shopName }}</h3>
    </md-toolbar>
    Welcome {{ username }}<br>
    <div class="Form">
      <form novalidate>
        <div class=" mainArea md-small-size-100 md-elevation-15">
          <div class=" md-small-size-100">
            <div class=" item" v-for="(item, index) in dataIn" :key="index">
              <md-button class="cut md-accent" @click="remove(index)" v-show="index || ( !index && dataIn.length > 1)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                     class="bi bi-x-square" viewBox="0 0 16 16">
                  <path
                      d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                  <path
                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </md-button>
              <md-field :class="{ 'md-invalid': dataCheck[index]['itemName'] }">
                <label for="shopName">Item Name </label>
                <md-input id="shopName" v-model="item.itemName" @input="inputUpdate(index,'itemName')"/>
                <span class="md-error">Item Name is required</span>
              </md-field>
              <md-field :class="{ 'md-invalid': dataCheck[index]['itemCount'] }">
                <label for="itemCount">Item Count</label>
                <md-input id="itemCount" v-model="item.itemCount" @input="inputUpdate(index,'itemCount')"/>
                <span class="md-error">Item Count is required</span>
              </md-field>
              <md-field :class="{ 'md-invalid': dataCheck[index]['itemPrice'] }">
                <label for="itemPrice">Item Price</label>
                <md-input id="itemPrice" v-model="item.itemPrice" @input="inputUpdate(index,'itemPrice')"/>
                <span class="md-error">Item Price is required</span>
              </md-field>
              <span>
                <md-button class="cut" :md-ripple="false" @click="add(index)" v-show="index === dataIn.length-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                       class="bi bi-plus-square" viewBox="0 0 16 16">
                    <path
                        d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path
                        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                </md-button>
            </span>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div>
      <v-quagga :onDetected="logIt" :readerSize="readerSize" :readerTypes="['ean_reader']"></v-quagga>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";

const cookieExpiry = "100s";


export default {
  name: "data_in",
  data() {
    return {
      username: null,
      shopName: null,
      dataIn: [
        {
          itemName: '',
          itemCount: '',
          itemPrice: ''
        }
      ],
      readerSize: {
        width: 100,
        height: 100
      },
      dataCheck: [
        {
          itemName: false,
          itemCount: false,
          itemPrice: false
        }
      ]
    }
  },

  computed: {},

  methods: {
    logIt (data) {
      console.log('detected', data)
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
    },

    remove(index) {
      this.dataIn.splice(index, 1)
    },


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
    this.roleCheck()
    navigator.permissions.query({name: 'camera'})
        .then((permissionObj) => {
          alert(permissionObj.state);
        })
        .catch((error) => {
          alert('Got error :', error);
        })
  }
}
</script>

<style scoped>

.mainArea {
  min-width: 40vw;
  margin: 20px 0 0 0;
  padding: 20px;
  display: inline-block;
  vertical-align: center;
  border-radius: 10px;
}

.item {
  border-bottom: 1px dotted grey;
}



.cut {
  right: -45%;
}

</style>
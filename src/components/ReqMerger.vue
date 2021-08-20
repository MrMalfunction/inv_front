<template>
  <div></div>
</template>

<script>
import Vue from "vue";
import axios from "axios";

export default {
  name: "ReqMerger",
  data() {
    return {
      finalData: [],
      total_sgst: 0,
      total_igst: 0,
      total_cgst: 0,
      totalAmount: 0,
      total_discount: 0
    }
  },
  methods: {
    transaction(data,sgst,igst,cgst,total,discount) {
      for (var j = 0; j < data.length; j++) {
        var flag = true;
        for (var i = 0; i < this.finalData.length; i++) {
          if (this.finalData[i]['itemName'] === data[j]['itemName'] && this.finalData[i]['itemPrice'] === data[j]['itemPrice']) {
            this.finalData[i]['itemCount'] += parseInt(data[j]['itemCount'])
            flag = false;
            break;
          }
        }
        if (flag === true) {
          var temp = {
            itemName: data[j]['itemName'],
            itemCount: parseInt(data[j]['itemCount']),
            itemPrice: data[j]['itemPrice']
          }
          this.finalData.push(temp);
        }
      }
      this.total_cgst += parseInt(cgst);
      this.total_igst += parseInt(igst);
      this.total_sgst += parseInt(sgst);
      this.totalAmount += parseInt(total);
      this.total_discount += parseInt(discount);
      console.log(JSON.stringify(this.finalData));
      if (this.finalData.length >= 2){
        var data_send = JSON.stringify({
          "merchant": "RETAIL",
          "data": this.finalData,
          "username": Vue.$cookies.get("username"),
          "shopid": Vue.$cookies.get("shopid"),
          "cookie": Vue.$cookies.get("cookie"),
          "type" : "OUT",
          "pre_tax" :parseInt(this.totalAmount) ,
          "sgst" : this.total_sgst,
          "cgst" : this.total_cgst,
          "igst" : this.total_igst,
          "total" : this.totalAmount,
          "discount": this.total_discount
        });
        var config = {
          method: 'post',
          url: 'https://inv.amolbohora.com/dataIn',
          headers: {
            'Content-Type': 'application/json'
          },
          data: data_send
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
            });
      }
    }
  }
}
</script>
<style scoped>

</style>
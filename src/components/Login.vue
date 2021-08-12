<template>
  <div class="Form">
    <form novalidate class="" @submit.prevent="">
      <md-card class="md-small-size-100 md-elevation-15">
        <md-card-header>
          <div class="md-display-1">Login</div>
        </md-card-header>
        <md-card-content>
          <div class="">
            <div class="">
              <md-field :class="getValidationClass('shopName')">
                <label for="shopName">Shop Name</label>
                <md-input name="shopName" id="shopName" v-model="form.shopName"
                          :disabled="sending"/>
                <span class="md-error" v-if="!$v.form.shopName.required">Shop Name is required</span>
              </md-field>
            </div>
          </div>
        </md-card-content>
        <md-card-content>
          <div class="">
            <div class="">
              <md-field :class="getValidationClass('username')">
                <label for="username">User Name</label>
                <md-input name="username" id="username" autocomplete="given-name" v-model="form.username"
                          :disabled="sending"/>
                <span class="md-error" v-if="!$v.form.username.required">User Name is required</span>
              </md-field>
            </div>
          </div>
        </md-card-content>
        <md-card-content>
          <div class="">
            <div class="">
              <md-field :class="getValidationClass('password')">
                <label for="password">Password</label>
                <md-input name="password" id="password" type="password" autocomplete="password" v-model="form.password"
                          :disabled="sending"/>
                <span class="md-error" v-if="!$v.form.password.required">Password is required</span>
              </md-field>
            </div>
          </div>
        </md-card-content>

        <md-button type="submit" class="md-raised md-accent login" :disabled="sending" @click="validateData">Login</md-button>
        <br>
        <md-progress-spinner class="md-accent" :md-stroke="3" :md-diameter="30" md-mode="indeterminate"
                             v-show="this.sending"></md-progress-spinner>
      </md-card>
      <md-snackbar :md-duration="2000" :md-active.sync="showSnackbar" md-persistent>
        <span> {{ this.errorMessage }} </span>
        <md-button class="md-primary" @click="showSnackbar = false">Close</md-button>
      </md-snackbar>
    </form>
  </div>
</template>

<script>
import {validationMixin} from 'vuelidate'

import {
  required,
} from 'vuelidate/lib/validators'

import axios from "axios";
import Vue from "vue";

const cookieExpiry = "100min";
export default {
  name: 'FormValidation',
  mixins: [validationMixin],
  data() {
    return {
      form: {
        shopName: null,
        username: null,
        password: null
      },
      sending: false,
      showSnackbar: false,
      errorMessage: "",
    }
  },
  validations: {
    form: {
      shopName: {
        required
      },
      username: {
        required,
      },
      password: {
        required,
      }
    }
  },
  methods: {
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },

    async cookieCheck(){
      const self = this;
      this.sending = true
      var cookie = Vue.$cookies.get("cookie");
      if(!(cookie === null)){
        var data = JSON.stringify({
          "shopid": Vue.$cookies.get("shopid"),
          "username": Vue.$cookies.get("username"),
          "cookie": cookie,
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
            .then(function () {
              Vue.$cookies.set("CC" , "true", cookieExpiry)
              self.$router.push('dashboard');
            })
            .catch(function (error){
              self.showSnackbar = true
              console.log(error.response.data['Message']);
              self.errorMessage = error.response.data['Message']
              Vue.$cookies.remove("cookie")
              Vue.$cookies.remove("username")
              Vue.$cookies.remove("shopid")
              Vue.$cookies.remove("CC")
            });
      }
      this.sending = false
    },

    async Login() {
      const self = this;
      this.sending = true
      var data = JSON.stringify({
        "shopid": this.form.shopName,
        "username": this.form.username,
        "password": this.form.password,
        "type": "Login"
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
            Vue.$cookies.set('cookie', response.data['cookie'], cookieExpiry);
            Vue.$cookies.set('shopid', self.form.shopName, cookieExpiry);
            Vue.$cookies.set('username', self.form.username, cookieExpiry);
            Vue.$cookies.set("CC" , "true", cookieExpiry);
            self.showSuccess = true
            if (response.data['role']['Data_Out'] === "true"){
              response.data['role']['Retail'] = "true";
            }
            Vue.$cookies.set("Roles", response.data['role'],cookieExpiry)
            self.$router.push('dashboard');
          })
          .catch(function (error){
            self.showSnackbar = true
            console.log(error.response.data['Message']);
            self.errorMessage = error.response.data['Message']
          });
    },
    validateData() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.Login();
        window.setTimeout(() => {
          this.sending = false
        }, 10)
      }
    }
  },
  beforeMount() {
    this.cookieCheck();
  }
}
</script>

<style scoped>

.Form {
}

.md-card {
  min-width: 40vw;
  margin: 20px 0 0 0;
  padding: 20px;
  display: inline-block;
  vertical-align: center;
  border-radius: 10px;
}

@media screen and (max-width: 1024px) {
  .md-card {
    min-width: 90vw;
    padding: 5px;
  }
}


.md-progress-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
}
</style>
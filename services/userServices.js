const BASE_URL = window.location.origin + '/users';

  var request = require('request-promise-native');

  export default {
    register : (email, password) => {
      return request({
        uri : BASE_URL,
        method: 'POST',
        json : true,
        body : {
          email : email,
          password : password
        }
      });
    },

    login : (email, password) => {
      return request({
        uri : BASE_URL + '/login',
        method: 'POST',
        body : {
          email : email,
          password : password
        },
        json : true
      });
    },

    getCurrentUser: () => {
      return request({
        uri : BASE_URL + '/current',
        method: 'GET',
        json : true
      });
    },

    logout : () => {
      return request({
        uri : BASE_URL + '/logout',
        method: 'PUT',
        json : true
      });
    },

  }

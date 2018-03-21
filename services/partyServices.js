const BASE_URL = window.location.origin + '/party';

  var request = require('request-promise-native');

  export default {
    getPartiesForUser : (email) => {
      return request({
        uri : BASE_URL + `/user/${email}`,
        method: 'GET',
        json : true
      });
    },

    clearPayments : (partyId, userId) => {
      return request({
        uri: BASE_URL + `/${partyId}/clearPayments/${userId}`,
        method: 'POST'
      });
    },

    addCost : (partyId, itemId, cost) => {
      return request({
        uri: BASE_URL + `/${partyId}/cost/${itemId}`,
        method: 'PUT',
        body : {
          cost: cost,
        },
        json : true,
      });
    },

    closeOutParty : (partyId) => {
      return request({
        uri: BASE_URL + `/${partyId}/closeout`,
        method: 'POST'
      });
    },

    createParty : (party) => {
      return request({
        uri : BASE_URL,
        method: 'POST',
        body: {
          party: party
        },
        json : true
      });
    },

    deleteParty : (partyId) => {
      return request({
        uri : BASE_URL + `/${partyId}`,
        method: 'DELETE'
      });
    },

    addItem : (partyId, name, quantity, unit) => {
      return request({
        uri: BASE_URL + `/${partyId}/supplies`,
        method: 'POST',
        body: {
          name: name,
          quantity: quantity,
          unit: unit,
        },
        json: true,
      });
    },

    addGuest : (partyId, email) => {
      return request({
        uri: BASE_URL + `/${partyId}/guests`,
        method: 'POST',
        body: {
          email: email,
        },
        json: true,
      });
    },

    deleteItem : (partyId, itemId) => {
      return request({
        uri: BASE_URL + `/${partyId}/supplies/${itemId}`,
        method: 'DELETE'
      });
    },

    deleteGuest : (partyId, email) => {
      return request({
        uri: BASE_URL + `/${partyId}/guests/${email}`,
        method: 'DELETE'
      });
    },

    claimItem : (partyId, itemId, quantity) => {
      return request({
        uri: BASE_URL + `/${partyId}/supplies/${itemId}`,
        method: 'PUT',
        body: {
          quantity: quantity,
        },
        json : true,
      });
    },

    rsvp : (partyId, attending) => {
      return request({
        uri: BASE_URL + `/${partyId}/guests`,
        method: 'PUT',
        body: {
          attending: attending,
        },
        json : true
      });
    },

    sendEmails : (partyId) => {
      return request({
        uri: BASE_URL + `/${partyId}/sendReminders`,
        method: 'PUT',
      });
    }

  }

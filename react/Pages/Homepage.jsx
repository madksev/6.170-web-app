import { Component } from 'react';
import React from 'react';
import PartyList from '../Elements/PartyList.jsx';
import PartyForm from '../Elements/PartyForm.jsx';
import partyServices from '../../services/partyServices';


export default class Homepage extends Component {
    constructor(props){
        super(props);
        this.state = {
          parties: [],
          user: undefined
        }
        this.addItem = this.addItem.bind(this);
        this.claimItem = this.claimItem.bind(this);
        this.addCost = this.addCost.bind(this);
        this.clearPayments = this.clearPayments.bind(this);
        this.closeOutParty = this.closeOutParty.bind(this);
        this.rsvp = this.rsvp.bind(this);
        this.createParty = this.createParty.bind(this);
        this.deleteGuest = this.deleteGuest.bind(this);
        this.addGuest = this.addGuest.bind(this);
        this.removeItem = this.removeItem.bind(this);
    }

    componentWillMount() {
      Services.user.getCurrentUser()
        .then((res) => {
          if (res.content.loggedIn) {
            this.setState({
              user: res.content.user
            });
        }});
    }


    /*
      Update the Currently Rendering Parties

      Inputs:
        - request: a promise from a request that somehow updated the parties
        in the party model
      Callback:
        - success: update the state of the homepage component by adding in the
          newly updated parties
        - cannot find this item: send message 'Item does not exist!'
        - err: on failure, an error message and alert
     */
    updateParties(request) {
      request.then((response) => {
        this.setState({
          parties : response.content.parties
        })
      }).catch((err) => {
        console.log(err);
        alert("There was an error updating parties: ", err);
      })
    }

    /*
      Get all the parties that the current user is either invited to, attending
      or hosting.

      - inputs: email, the email of the user currently logged in
     */
    fetchAllPartiesForUser(email) {
      if(email) {
        partyServices.getPartiesForUser(this.state.user).then((resp) => {
          this.setState((prevState) => {
            prevState.parties = resp.content.parties;
            return prevState;
          });
        });
      }
    }

    /**
    Add an item to the parties supply list in the model

    -Params:
      partyId: the id of the party the item is being added to
      itemName: the string name of the item being added
      itemQuantity: the numeric quantity greater than 0 being added of the item
      item unit: the string unit the quantity of the item is measured in
    */
    addItem(partyId, itemName, itemQuantity, itemUnit) {
      var start = partyServices.addItem(partyId, itemName, itemQuantity, itemUnit).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      });
    }

    /**
    Remove an item off of a parties supply list

    -Params:
      partyId: the id of the party the item is being removed from
      itemId: the id of the item being removed
    */
    removeItem(partyId, itemId) {
      var start = partyServices.deleteItem(partyId, itemId).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      });
    }

    /**
    Remove an item off of a parties supply list

    -Params:
      partyId: the id of the party the item is being claimed from
      itemId: the id of the item being claimed
      claimedQuantity: the numeric amount of the item being claimed
    */
    claimItem(partyId, itemId, claimedQuantity) {
      var start = partyServices.claimItem(partyId, itemId, claimedQuantity).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      });
    }

    /**
    Remove an item off of a parties supply list

    -Params:
      partyId: the id of the party the item is on the supply list of
      itemId: the id of the item the cost is being entered for
      cost: the numeric cost of the item
    */
    addCost(partyId, itemId, cost) {
      var start = partyServices.addCost(partyId, itemId, cost).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      });
    }

    /**
    When this party is closed out, removes payments from the outstanding list
    of owed payments for attendees who indicate they have paid back or been
    paid back for money owed.

    -Params:
      partyId: the id of the party that payments are being cleared for
      currentUserId: the id of the current user of the application
    */
    clearPayments(partyId, currentUserId) {
      var start = partyServices.clearPayments(partyId, currentUserId).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      })
    }

    /**
    Notify that a party is being closed out, so payment calculations can be made

    -Params:
      id: the id of the party that is being closed out
    */
    closeOutParty(id) {
      var start = partyServices.closeOutParty(id).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      })
    }

    /**
    Send the RSVP of the current user

    -Params:
      partyId: the id of the party that the user is rsvp-ing for
      attending: the boolean value true if the current user is rsvp-ing yes and
      false if the current user is rsvp-ing no
    */
    rsvp(partyId, attending) {
      var stringPartyId = String(partyId);
      var start = partyServices.rsvp(partyId, attending).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      })
    }

    /**
    Create a party

    -Params:
      content: an object contiaing the content of the party to be made including
      host, invited, supply and guest lists, time, location, date and description
    */
    createParty(content) {
      var start = partyServices.createParty(content).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      })
    }

    /**
    Add a guest to the invited list of a party

    -Params:
      partyId: the id of the party that the guest is being invited to
      email: the email of the invited guest
    */
    addGuest(partyId, email) {
      var start = partyServices.addGuest(partyId, email).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      });
    }

    /**
    Remove a guest from the invited list of the party

    -Params:
      partyId: the id of the party that the guest is being removed from
      email: the email of the to-be removed guest 
    */
    deleteGuest(partyId, email) {
      var start = partyServices.deleteGuest(partyId, email).then((resp) => {
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      });
    }

    componentWillMount(){
      this.props.services.user.getCurrentUser()
        .then((res) => {
          if (res.content.loggedIn) {
            this.setState({
              user: res.content.user
            });
        }
      }).then((res) => {
        // Call the "getPartiesForUser" service to update this.props.parties with fresh data,
        // use the parameter from the URL to determine what username we should call with
        var request = this.props.services.party.getPartiesForUser(this.state.user.email);
        this.updateParties(request);
      });

    }

    render(){
      return (
          <div className='container' id='homepage-container'>
              <div className='col-md-3' id='namebox'>
                  <h1>Your Parties</h1>
                  <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#popup">
                    <span className="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Create a New Party
                  </button>
              </div>

              <div className='col-md-9'>

                  <PartyList parties={this.state.parties} currentUser={this.props.user}
                    addItem={this.addItem} claimItem={this.claimItem} addCost={this.addCost}
                    clearPayments={this.clearPayments} closeOutParty={this.closeOutParty}
                    rsvp={this.rsvp} addGuest={this.addGuest} deleteGuest={this.deleteGuest}
                    removeItem={this.removeItem}/>

              </div>
              <div id="popup" className="modal fade new-party-modal-lg" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
                  <PartyForm createParty={this.createParty}/>
              </div>
          </div>
      )
    }
}

Homepage.propTypes = {

};

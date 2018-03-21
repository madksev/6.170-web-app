import { Component } from 'react';
import React from 'react';
import partyServices from '../../services/partyServices.js';
import inputValidation from '../../utils/validation';
import Services from '../../services';

export default class GuestList extends Component {
    constructor(props){
        super(props);

        this.onAddGuestClick = this.onAddGuestClick.bind(this);
        this.updateNewGuestEmail = this.updateNewGuestEmail.bind(this);
        this.updateNewGuestName = this.updateNewGuestName.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
        this.deleteGuest = this.deleteGuest.bind(this);
        this.addGuest = this.addGuest.bind(this);
        this.renderAddGuestInputs = this.renderAddGuestInputs.bind(this);
        this.state = {
          hosting: this.props.currentUser.email == this.props.party.host.email,
          editing: false,
          addingGuest: false,
          inputsVisible: false,
          newGuestName: '',
          newGuestEmail: ''
        }
    }


    /*
      Toggles the state of adding a guest and whether the guest inputs should be visible
    */
    onAddGuestClick() {
      const adding = this.state.addingGuest;
      const visible = this.state.inputsVisible;
      this.setState({
        addingGuest: !adding,
        inputsVisible: !visible
      });
    }


    /*
      Updates the new guests name by the value in event.target.value

      Params:
        event: The event which has the new guests name in it.
    */
    updateNewGuestName(event){
        this.setState({
            newGuestName : event.target.value
        });
    }


    /*
      Updates the new guests email by the value in event.target.value

      Params:
        event: The event which has the new guests email in it.
    */
    updateNewGuestEmail(event){
        this.setState({
            newGuestEmail : event.target.value
        });
    }


    /*
      Adds a guest to the party using the current newGuestEmail.
    */
    addGuest() {
      const guestEmailOk = inputValidation.validateEmail(this.state.newGuestEmail);
      const guestNameOk = inputValidation.validateAlphaNumeric(this.state.newGuestName);
      if (!guestEmailOk || !guestNameOk) {
        alert('please enter a valid email and name');
        this.setState({
          editing: true,
        });
        return;
      }
      this.props.addGuest(this.props.party._id, this.state.newGuestEmail);
      this.setState({
        newGuestEmail: '',
        newGuestName: ''
      });
    }


    /*
      Toggles whether the guest list is being edited.
    */
    onEditClick() {
      const edit = this.state.editing;
      this.setState({
        editing: !edit,
      });
    }


    /*
      Deletes the guest in question from the party.

      Params:
        guest: The guest to be deleted.
    */
    deleteGuest(guest) {
      this.props.deleteGuest(this.props.party._id, guest);
    }


    /*
      Renders the edit invited button if the user is hosting and there
      are more than 0 guests invited.
    */
    renderEdit(){
      if (this.state.hosting && this.props.party.invited.length > 0){
        return (
          <span>
            <button className="btn btn-default add-guest-button" onClick={this.onEditClick}> Edit Guests </button>
          </span>
        )
      }
    }

    /*
      Renders the add guest button if user is hosting the party.
    */
    renderAddGuest() {
      if (this.state.hosting) {
        return(
          <div>
            <button className="btn btn-default add-guest-button button-margin" onClick={this.onAddGuestClick}>Add Guest</button>
            {this.renderAddGuestInputs()}
          </div>
        )
      }
    }

    /*
      Renders the inputs for adding a guest.
    */
    renderAddGuestInputs(){
      if (this.state.inputsVisible) {
        return(
          <div>
            <div className="input-group">
              <span className="input-group-addon" id="guestname-addon1">Guest Name</span>
              <input type="text" className="form-control" aria-describedby="guestname-addon1"
                value={this.state.newGuestName} onChange={this.updateNewGuestName}
                />
            </div>
            <div className="input-group">
              <span className="input-group-addon new-guest-email-button" id="guestemail-addon1">Guest Email</span>
              <input type="text" className="form-control" aria-describedby="guestemail-addon1"
                value={this.state.newGuestEmail} onChange={this.updateNewGuestEmail}
                    />
            </div>
            <button className="btn btn-default" onClick={this.addGuest}>+</button>
          </div>
        )
      }
    }


    /*
      Renders a guests email and a delete button if editing is happening.
    */
    renderGuest(guest, key){
      if(this.state.editing){
        return(
          <li key={key} id={guest}>{guest}
            <button className="btn btn-default" onClick={() => {this.deleteGuest(guest)}}>x</button>
          </li>)
      }
      return (<li key={key}>{guest}</li>);
    }


    /*
      Renders the list of guests.
    */
    renderElements() {
      return(
        <div>
          {this.props.party.invited.map(this.renderGuest)}
        </div>);
    }


    /*
      Renders the invited list of the guest list.
    */
    renderInvitedList() {
      if (this.props.party.invited.length > 0 || this.state.hosting) {
        return(
          <div>
            <p className='list-title'>Invited List</p>
            <ul className="list">
            {this.renderElements()}
            {this.renderEdit()}
            </ul>
            {this.renderAddGuest()}
          </div>
          )
      }
    }


    /*
      Renders the guest list.
    */
    render(){

        const attending = this.props.party.attending;
        return (
          <div>
            <div>
              {this.renderInvitedList()}
            </div>
            <div>
              <p className='list-title attending-list'>Attending List</p>
              <ul className="list">
              {attending.map((guest, key) => {
                return <li key={key}>{guest.email}</li>
              })}
              </ul>
            </div>
          </div>
        )
    }
}

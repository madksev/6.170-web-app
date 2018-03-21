import { Component } from 'react';
import React from 'react';
import InputTable from './InputTable.jsx';
import inputValidation from '../../utils/validation';
import partyServices from '../../services/partyServices';

export default class PartyForm extends Component {
    constructor(props){
        super(props);

        this.updateGuestEmail = this.updateGuestEmail.bind(this);
        this.updateGuestName = this.updateGuestName.bind(this);
        this.updatePartyTitle = this.updatePartyTitle.bind(this);
        this.updatePartyDate = this.updatePartyDate.bind(this);
        this.updatePartyLocation = this.updatePartyLocation.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.updateQuantity = this.updateQuantity.bind(this);
        this.updateUnit = this.updateUnit.bind(this);
        this.addToGuestList = this.addToGuestList.bind(this);
        this.addToItemList = this.addToItemList.bind(this);
        this.createParty = this.createParty.bind(this);
        this.updatePartyDescription = this.updatePartyDescription.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.removeGuest = this.removeGuest.bind(this);

        this.state = {
            partyTitle : '',
            partyLocation : '',
            partyDate : '',
            partyDescription : '',
            guestName: '',
            guestEmail: '',
            item: '',
            quantity: '',
            unit: '',
            guestList: [],
            itemList: []
        }

    };


    /*
      Updates the party's title by the value in event.target.value

      Params:
        event: The event which has the party's title in it.
    */
    updatePartyTitle(event){
        this.setState({
            partyTitle : event.target.value
        });
    }


    /*
      Updates the party's date by the value in event.target.value

      Params:
        event: The event which has the party's date in it.
    */
    updatePartyDate(event){
        this.setState({
            partyDate : event.target.value
        });
    }


    /*
      Updates the party's location by the value in event.target.value

      Params:
        event: The event which has the party's location in it.
    */
    updatePartyLocation(event){
        this.setState({
            partyLocation : event.target.value
        });
    }


    /*
      Updates the party's description by the value in event.target.value

      Params:
        event: The event which has the party's description in it.
    */
    updatePartyDescription(event){
        this.setState({
            partyDescription : event.target.value
        });
    }


    /*
      Updates the guest's name by the value in event.target.value

      Params:
        event: The event which has the guest's name in it.
    */
    updateGuestName(event){
        this.setState({
            guestName : event.target.value
        });
    }


    /*
      Updates the guest's email by the value in event.target.value

      Params:
        event: The event which has the guest's email in it.
    */
    updateGuestEmail(event){
        this.setState({
            guestEmail : event.target.value
        });
    }


    /*
      Updates the item's name by the value in event.target.value

      Params:
        event: The event which has the item's name in it.
    */
    updateItem(event){
        this.setState({
            item : event.target.value
        });
    }


    /*
      Updates the item's quantity by the value in event.target.value

      Params:
        event: The event which has the item's quantity in it.
    */
    updateQuantity(event){
        this.setState({
            quantity : event.target.value
        });
    }


    /*
      Updates the item's unit by the value in event.target.value

      Params:
        event: The event which has the item's unit in it.
    */
    updateUnit(event){
        this.setState({
            unit : event.target.value
        });
    }


    /*
      Clears the state of the party form to allow for another party to be added.
    */
    clearState() {
      this.setState({
        partyTitle : '',
        partyLocation : '',
        partyDate : '',
        partyDescription : '',
        guestName: '',
        guestEmail: '',
        item: '',
        quantity: '',
        unit: '',
        guestList: [],
        itemList: []
      });
    }


    /*
      Creates the party with the current information in the state.
    */
    createParty() {
      var content = {
        title: this.state.partyTitle,
        location: this.state.partyLocation,
        date: this.state.partyDate,
        description: this.state.partyDescription,
        guests: this.state.guestList,
        items: this.state.itemList
      };
      if (!inputValidation.validateTextInputLength(content.title)){

        alert('Title must be less than 100 characters and non empty');
        return;
      } else if (!inputValidation.validateTextInputLength(content.location)) {
        alert('Loction must be less than 100 characters and non empty');
        return;
      } else if (!inputValidation.validateTextInputLength(content.description)) {
        alert('Description must be less than 100 characters and non empty');
        return;
      } else if (content.date == '') {
        alert('Date must be non - empty');
        return;
      }
      $('.modal-lg .close').click();
      this.props.createParty(content);
      this.clearState();
    }


    /*
      Adds the current added guest to the guest list.
    */
    addToGuestList(){
      var newList = this.state.guestList;
      var newGuest = {entry1: this.state.guestName, entry2: this.state.guestEmail};
      var nameOk = inputValidation.validateAlphaNumeric(this.state.guestName);
      var emailOk = inputValidation.validateEmail(this.state.guestEmail);
      if (!nameOk || !emailOk) {
        alert('Name and Email must be valid');
        return;
      }
      newList.push(newGuest);
      this.setState({
        guestList : newList,
        guestName : '',
        guestEmail : '',
      });
    }


    /*
      Adds the currently added item to the item list.
    */
    addToItemList(){
      var okQuant = inputValidation.validateInputPositive(this.state.quantity);
      var okName = inputValidation.validateAlphaNumeric(this.state.item);
      var okUnit = inputValidation.validateAlphaNumeric(this.state.unit);
      if (!okName || !okUnit) {
        alert('Item and Unit must be non empty alpha numeric values.');
        return;
      } else if (!okQuant) {
        alert('quantity can not be negative');
        return;
      }
      var newList = this.state.itemList;
      var newItem = {
        entry1: this.state.item,
        entry2: this.state.quantity,
        entry3: this.state.unit,
      };

      newList.push(newItem);
      this.setState({
        itemList : newList,
        item : '',
        quantity : '',
        unit: '',
      });
    }


    /*
      Removes the item from the supply list.

      Params:
        Item: Item to remove from the supply list.
    */
    removeItem(item) {
      var index = this.state.itemList.indexOf(item);
      var newList = this.state.itemList.slice();
      newList.splice(index, 1);
      this.setState({
        itemList: newList
      });
    }


    /*
      Removes the guest from the guest list

      Params:
        guest: Guest to remove from the guest list.
    */
    removeGuest(guest) {
      var index = this.state.guestList.indexOf(guest);
      var newList = this.state.guestList.slice();
      newList.splice(index, 1);
      this.setState({
        guestList: newList
      });
    }


    /*
      Renders the party form.
    */
    render(){
        return (
        	<div className="modal-dialog modal-lg" role="document" id="party-modal">
      			<div className="modal-content" id="party-form-content">
  	    			<div className="modal-header" id="party-form-header">
  				        <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                    onClick={() => {this.clearState()}}><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title create-party-title" id="gridSystemModalLabel">Create a New Party</h4>
  				    </div>
  				    <div className="modal-body" id="party-form">
                <div id="main-info-forms">
                  <div className="row">
                    <div className="col-md-6 col-md-offset-3">
                      <div className="input-group">
                        <span className="input-group-addon title-input" id="title-addon1">Title</span>
                        <input type="text" className="form-control" aria-describedby="title-addon1"
                            value={this.state.partyTitle} onChange={this.updatePartyTitle} />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-md-offset-3">
                      <div className="input-group">
                        <span className="input-group-addon location-input" id="location-addon1">Location</span>
                        <input type="text" className="form-control" aria-describedby="location-addon1"
                            value={this.state.partyLocation} onChange={this.updatePartyLocation} />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-md-offset-3">
                      <div className="input-group">
                        <span className="input-group-addon date-input" id="date-addon1">Date</span>
                        <input type="datetime-local" className="form-control" aria-describedby="date-addon1"
                            value={this.state.partyDate} onChange={this.updatePartyDate} />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-md-offset-3">
                      <div className="input-group">
                        <span className="input-group-addon" id="description-addon1">Description</span>
                        <textarea rows="3" type="text" className="form-control" aria-describedby="description-addon1"
                            value={this.state.partyDescription} onChange={this.updatePartyDescription}></textarea>
                      </div>
                    </div>
                  </div>
                </div>




                <div className="row">
                  <div className="col-md-4 col-md-offset-1">
                    <div id="guest-inputs">
                      <div className="add-input-forms">
                        <div className="input-group">
                          <span className="input-group-addon" id="guestname-addon1">Guest Name</span>
                          <input type="text" className="form-control" aria-describedby="guestname-addon1"
                              value={this.state.guestName} onChange={this.updateGuestName} />
                        </div>
                        <div className="input-group">
                          <span className="input-group-addon guest-email-input" id="guestemail-addon1">Guest Email</span>
                          <input type="text" className="form-control" aria-describedby="guestemail-addon1"
                              value={this.state.guestEmail} onChange={this.updateGuestEmail} />
                        </div>
                      </div>
                      <button className="btn btn-default" onClick={this.addToGuestList}>Add to Guest List</button>
                    </div>
                    <InputTable inputs={this.state.guestList} title={'Guest List'} col1name={'Name'} col2name={'Email'}
                      removeInput={this.removeGuest}/>
                  </div>
                  <div className="col-md-4 col-md-offset-2">
                    <div className="add-input-forms">
                      <div className="input-group">
                        <span className="input-group-addon item-input" id="item-addon1">Item</span>
                        <input type="text" className="form-control" aria-describedby="item-addon1"
                            value={this.state.item} onChange={this.updateItem} />
                      </div>
                      <div className="input-group">
                        <span className="input-group-addon" id="quantity-addon1">Quantity</span>
                        <input type="number" className="form-control" aria-describedby="quantity-addon1"
                            value={this.state.quantity} onChange={this.updateQuantity} />
                      </div>
                      <div className="input-group">
                        <span className="input-group-addon unit-input" id="unit-addon1">Unit</span>
                        <input type="text" className="form-control" aria-describedby="unit-addon1"
                            value={this.state.unit} onChange={this.updateUnit} />
                      </div>
                    </div>
                    <button className="btn btn-default" onClick={this.addToItemList}>Add Item</button>
                    <InputTable inputs={this.state.itemList} title={'Supply List'}
                      col1name={'Item'} col2name={'Quantity'} col3name={'Unit'} removeInput={this.removeItem}/>
                  </div>
                </div>
  		        </div>
              <div className="modal-footer" id="party-form-footer">
                <div className="col-md-2 col-md-offset-5">
                  <button type="button" className="btn btn-default" onClick={this.createParty}>Create Party</button>
                </div>
              </div>
  		      </div>
            <button type="button" data-dismiss='modal' className='close'></button>
          </div>
        );
    }
}

import { Component } from 'react';
import React from 'react';
import moment from 'moment';
import GuestList from './GuestList.jsx';
import PartyList from './PartyList.jsx';
import SupplyList from './SupplyList.jsx';
import partyServices from '../../services/partyServices';


export default class Party extends Component {
    constructor(props){
        super(props);
        this.state = {
            expanded: false,
            hosting: this.props.currentUser.email == this.props.party.host.email,
        };
        this.expandParty = this.expandParty.bind(this);
        this.rsvpTrue = this.rsvpTrue.bind(this);
        this.rsvpFalse = this.rsvpFalse.bind(this);
        this.closeOutParty = this.closeOutParty.bind(this);
        this.clearPayments = this.clearPayments.bind(this);
        this.sendEmails = this.sendEmails.bind(this);
    }


    /*
      Clears the payments associated with this party and the current user.
    */
    clearPayments() {
      this.props.clearPayments(this.props.party._id, this.props.currentUser._id);
    }


    /*
      Closes out this party.
    */
    closeOutParty() {
      this.props.closeOutParty(this.props.party._id);
    }


    /*
      Toggles the party being expanded or not. Being expanded means showing the guest list and
      supply list.
    */
    expandParty(){
      const expanded = this.state.expanded;
      this.setState({expanded:!expanded});
    }


    /*
      Returns the title for the view more/less button.
    */
    getButtonTitle(){
      if(this.state.expanded){
        return 'View Less';
      }
      return 'View More';
    }


    /*
      Rsvp's false for this party for the current user.
    */
    rsvpFalse() {
      this.rsvp(false);
    }


    /*
      Rsvp's true for this party for the current user.
    */
    rsvpTrue() {
      this.rsvp(true);
    }


    /*
      Rsvp's for this party for the current user.

      Params:
        attending: boolean whether or not the user is attending.
    */
    rsvp(attending) {
      this.props.rsvp(this.props.party._id, attending);
    }


    /*
      Renders the guest and supply list.
    */
    renderLists() {
      if(this.state.expanded){
        return (
          <div>
            <div className="col-md-5">
              <GuestList
                party={this.props.party}
                currentUser={this.props.currentUser}
                deleteGuest={this.props.deleteGuest}
                addGuest={this.props.addGuest}/>
            </div>
            <div className="col-md-7">
              <SupplyList
                party={this.props.party}
                currentUser={this.props.currentUser}
                supplies={this.props.party.supplies}
                partyId={this.props.party._id}
                addItem={this.props.addItem}
                claimItem={this.props.claimItem}
                addCost={this.props.addCost}
                removeItem={this.props.removeItem}
                />
            </div>
          </div>
        )
      }
    }


    /*
      Renders the date of the party.
    */
    renderDate() {
      return moment.utc(this.props.party.date).format('MM/DD/YYYY [at] h:mm A');
    }


    /*
      Renders the sendEmails button for hosts.
    */
    renderSendEmails() {
      if (this.state.hosting) {
        return (
            <div>
              <button className="btn btn-default" onClick={this.sendEmails}>
                Send Reminder Emails to Guests
              </button>
            </div>
          )
      }
    }


    /*
      Sends reminder emails to the invited and attending guests to the party.
    */
    sendEmails() {
      partyServices.sendEmails(this.props.party._id).then((resp) => {
        return (
            alert('Successfully sent emails!')
          )
      });
    }


    /*
      Renders the close out button if the currentUser is hosting the party.
    */
    renderCloseout() {
      if (this.state.hosting){
        return (
          <div>Party over?
            <button className="btn btn-default closeout-button" onClick={this.closeOutParty}>
              <span className="glyphicon glyphicon-check"></span> Close out party!
            </button>
          </div>
        )
      } else {
        return;
      }
    }


    /*
      Renders the rsvp button for the party.
    */
    renderRsvp(){
      if(this.props.party.host.email == this.props.currentUser.email){
        return( <div></div>)
      }
      if(this.props.party.attending.map((guest, key) => {
        return guest.email}).indexOf(this.props.currentUser.email) == -1) {
        return (
          <div>
            <p><span className="glyphicon glyphicon-envelope"></span> Attending:</p>
            <button className="btn btn-default rsvp-buttons" onClick={this.rsvpTrue}>Yes</button>
            <button className="btn btn-default rsvp-buttons" onClick={this.rsvpFalse}>No</button>
          </div>
        )
      } else {
        return (
          <div>
            <p><span className="glyphicon glyphicon-envelope"></span> Still Attending?</p>
            <button className="btn btn-default" onClick={this.rsvpFalse}>No</button>
          </div>
        )
      }
    }


    /*
      Renders a closed out party with the payments for the currentUser
    */
    renderClosedOutParty() {
      const party = this.props.party;
      var payments = this.props.party.payments.filter((payment) => {
        return (payment.payee._id == this.props.currentUser._id || payment.payer._id == this.props.currentUser._id)
      });
      if (payments.length == 0) {
        return;
      }

      return (
        <div className='panel panel-default'>
            <div className='panel-body'>
              <h3 className="party-title">{party.title}</h3>

              <div className="col-md-4">
                <p className="date"><span className="glyphicon glyphicon-calendar"></span> Date: {this.renderDate()}</p>
                <p className="host"><span className="glyphicon glyphicon-user"></span> Host: {party.host.email}</p>
                <p className="location"><span className="glyphicon glyphicon-map-marker"></span> Location: {party.location}</p>
                <p className="description">{party.description}</p>
              </div>
              <div className='col-md-8'>
                <p>From this party, these payments involve you:</p>
                <ul>
                  { payments.map((payment, key) => {
                    var rounded_amount = Math.round(payment.amount*100)/100
                    if (payment.payer._id == this.props.currentUser._id) {
                      return (<li key={key}> You owe {payment.payee.email} {rounded_amount} dollars.</li>);
                    } else {
                      return (<li key={key}> {payment.payer.email} owes you {rounded_amount} dollars.</li>)
                    }
                  })}
                </ul>
                <p>Have the payments been completed by everyone?</p>
                <button className="btn btn-default" onClick={this.clearPayments}>Yes</button>
              </div>
            </div>
        </div>
      );
    }


    /*
      Renders the party.
    */
    render(){
      const party = this.props.party;
      if (party.closedOut) {
        return (
          <div className='party'>
            {this.renderClosedOutParty()}
          </div>
        );
      }
      return (
        <div className='party'>
            <div className='panel panel-default'>
                <div className='panel-body'>
                  <h3 className="party-title">{party.title}</h3>
                  <div className="party-information">
                    <div className="col-md-4">
                      <p className="date"><span className="glyphicon glyphicon-calendar"></span> Date: {this.renderDate()}</p>
                      <p className="host"><span className="glyphicon glyphicon-user"></span> Host: {party.host.email}</p>
                      <p className="location"><span className="glyphicon glyphicon-map-marker"></span> Location: {party.location}</p>
                      <p className="description">{party.description}</p>
                    </div>

                    <div className="col-md-4 attending">
                      {this.renderRsvp()}
                    </div>
                    <div className="col-md-3 closeout">
                      {this.renderCloseout()}
                      {this.renderSendEmails()}
                    </div>
                  </div>

                  <br/>
                  <div className="view-more-or-less">
                      <button className="btn btn-primary" onClick={this.expandParty}>{this.getButtonTitle()}</button>
                      <hr className="divider"></hr>
                  </div>
                  {this.renderLists()}
                </div>
            </div>
        </div>
      )
    }
}

Party.propTypes = {
    party: React.PropTypes.shape({
        title : React.PropTypes.string.isRequired,
        date : React.PropTypes.any.isRequired
    }).isRequired
};

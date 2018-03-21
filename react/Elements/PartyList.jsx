import { Component } from 'react';
import React from 'react';
import Party from './Party.jsx';

export default class PartyList extends Component {
    constructor(props){
        super(props);
    }

    /*
      Renders the list of parties for the current user.
    */
    render(){
        return (
            <div>
                { this.props.parties.map((party, key) => {
                  return (
                    <Party addItem={this.props.addItem} party={party} key={key}
                      currentUser={this.props.currentUser} claimItem={this.props.claimItem}
                      addCost={this.props.addCost} clearPayments={this.props.clearPayments}
                      closeOutParty={this.props.closeOutParty} rsvp={this.props.rsvp}
                      addGuest={this.props.addGuest} deleteGuest={this.props.deleteGuest}
                      removeItem={this.props.removeItem}
                      />
                  )
                }
              )}
            </div>
        );
    }
}

PartyList.propTypes = {
    parties : React.PropTypes.arrayOf(React.PropTypes.shape({
        date : React.PropTypes.any.isRequired
    })).isRequired
};

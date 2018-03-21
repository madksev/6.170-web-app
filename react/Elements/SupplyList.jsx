import { Component } from 'react';
import React from 'react';
import inputValidation from '../../utils/validation';
import partyServices from '../../services/partyServices';

export default class SupplyList extends Component {
    constructor(props){
        super(props);

        this.state = {
            inputsVisible: false,
            editing: false,
            newItemName: '',
            newItemQuantity: '',
            newItemCost: '',
            newItemUnit: '',
            quantityToClaim: '',
        };

        this.onAddSuppliesClick = this.onAddSuppliesClick.bind(this);
        this.updateNewItemName = this.updateNewItemName.bind(this);
        this.updateNewItemQuantity = this.updateNewItemQuantity.bind(this);
        this.updateNewItemCost = this.updateNewItemCost.bind(this);
        this.updateNewItemUnit = this.updateNewItemUnit.bind(this);
        this.updateQuantityToClaim = this.updateQuantityToClaim.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
    }

    /*
      Perform this action when user clicks 'Add Supplies'

      - Toggle state of editing and inputs being visible every time
        'Add Supplies' is clicked
    */
    onAddSuppliesClick() {
      const edit = this.state.editing;
      const visible = this.state.inputsVisible;
      this.setState({
        editing: !edit,
        inputsVisible: !visible
      });
    }

    /*
      Set state of new item name
    */
    updateNewItemName(event) {
      this.setState({
        newItemName : event.target.value
      });
    }

    /*
      Set state of new item quantity
    */
    updateNewItemQuantity(event) {
      this.setState({
        newItemQuantity : event.target.value
      });
    }

    /*
      Set state of quantity a person would like to claim
    */
    updateQuantityToClaim(event) {
      this.setState({
        quantityToClaim : event.target.value
      })
    }

    /*
      Set state of new item cost
    */
    updateNewItemCost(event) {
      this.setState({
        newItemCost : event.target.value
      });
    }

    /*
      Set state of new item units
    */
    updateNewItemUnit(event) {
      this.setState({
        newItemUnit : event.target.value
      })
    }


    /*
      Add a new item to supplies list.
    */
    addNewItem(){
      var okQuant = inputValidation.validateInputPositive(this.state.newItemQuantity);
      var okName = inputValidation.validateAlphaNumeric(this.state.newItemName);
      var okUnit = inputValidation.validateAlphaNumeric(this.state.newItemUnit);
      if(!okQuant || !okName || !okUnit) {
        alert('Not a valid name, quant or unit');
        return;
      }
      this.props.addItem(this.props.partyId, this.state.newItemName, this.state.newItemQuantity, this.state.newItemUnit);
      this.setState({
         newItemName: '',
         newItemQuantity: '',
         newItemUnit: '',
      });
    }

    /*
      Remove an item from the supplies list.
      Param: item to remove
    */
    removeItem(item) {
      this.props.removeItem(this.props.partyId, item._id);
    }

    /*
      Claim an item from supplies list.

      Params:
        - id: id of person claiming item
        - quantityToClaim: amount claimed
        - totalQuantity: quantity of item requested originally for party
      Alerts:
        - user not in attending list: alert 'You must RSVP attending in order to
          claim items.'
        - user requests to claim more than totalQuantity: send alert informing
          them of this
        - no quantity or negative quantity claimed: alert 'There must be some
          quantity claimed'
    */
    claimItem(id, quantityToClaim, totalQuantity) {

      var quantityToClaimOk = inputValidation.validateInputPositive(quantityToClaim);

      var attendingEmails = this.props.party.attending.map((user, key) => {
        return user.email;
      });
      if (attendingEmails.indexOf(this.props.currentUser.email) == -1) {
        alert('You must RSVP attending in order to claim items.');
        return;
      }
      if (totalQuantity < quantityToClaim){
        alert(`${quantityToClaim} is larger than the original ${totalQuantity} requested`);
        return;
      } else if (!quantityToClaimOk) {
        alert('There must be some quantity claimed');
        return;
      }
      $('#myModal'+id).modal('hide');

      this.props.claimItem(this.props.partyId, id, quantityToClaim);
      this.setState({
        quantityToClaim: '',
      })
    }


    /*
      Add cost of this item.

      Params:
        - itemId: id of item
        - cost: cost to add
    */
    addItemCost(itemId, cost) {
      var costOk = inputValidation.validateInputPositive(cost);
      if (!costOk) {
        alert('Costs must be positive and non zero');
        return;
      }
      $('#addModal'+itemId).modal('hide');
      this.props.addCost(this.props.partyId, itemId, cost);
      this.setState({
        newItemCost: '',
      })
    }

    /*
      Render inputs when state of inputsVisible is true.
    */
    renderInputs() {
      if (this.state.inputsVisible) {
        return (
            <div>
              <div className="row">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-addon item-input" id="item-name-addon1">Item</span>
                    <input type="text" className="form-control" aria-describedby="item-name-addon1"
                        value={this.state.newItemName} onChange={this.updateNewItemName} />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-addon" id="item-quantity-addon1">Quantity</span>
                    <input type="number" className="form-control" aria-describedby="item-quantity-addon1"
                        value={this.state.newItemQuantity} onChange={this.updateNewItemQuantity} />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-addon unit-input" id="item-quantity-addon1">Unit</span>
                    <input type="text" className="form-control" aria-describedby="item-quantity-addon1"
                        value={this.state.newItemUnit} onChange={this.updateNewItemUnit} />
                  </div>
                </div>
              </div>
              <button className="btn btn-default" onClick={this.addNewItem}>Add!</button>
            </div>
          )
      }
    }

    /*
      Render 'Add Cost' button.
    */
    renderAddCostButton(item) {
      return(
        <div>
          <button type="button" className="btn btn-default" data-toggle="modal" data-target={"#addModal"+item._id}>Add Cost</button>

          <div className="modal fade" id={"addModal"+item._id} role="dialog">
            <div className="modal-dialog">

              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                  <h4 className="modal-title">
                    Add cost for {item.quantity} {item.unit} of {item.name}
                  </h4>
                </div>
                <div className="modal-body">
                  <p>How much did {item.quantity} {item.unit} of {item.name} cost you&#63;</p>
                    <input type="number" className="form-control" aria-describedby="item-quantity-addon1"
                          placeholder={"$"} min="0" max="1000000000000"
                          value={this.state.newItemCost} onChange={this.updateNewItemCost} />

                </div>
                <div className="modal-footer">
                  <button className="btn btn-default" onClick={()=>{this.addItemCost(item._id, this.state.newItemCost)}}>
                    Add Cost of $ {this.state.newItemCost}
                  </button>
                  <button type="button" className="btn btn-default" id="cost-close" data-dismiss="modal" >Close</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      );
    }

    /*
      Render quantity modal to allow user to enter quantity they would like
      to contribute.
    */
    renderQuantityModal(item) {
      return (
          <div className="modal fade" id={"myModal"+item._id} role="dialog">
            <div className="modal-dialog">

              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                  <h4 className="modal-title">Claim Item - {item.name}</h4>
                </div>
                <div className="modal-body">
                  <p>How much of the item would you like to contribute &#63;</p>
                    <input type="number" min="0" max={item.quantity} className="form-control" aria-describedby="item-quantity-addon1"
                          value={this.state.quantityToClaim} onChange={this.updateQuantityToClaim} placeholder={item.unit}/>

                </div>
                <div className="modal-footer">
                  <button className="btn btn-default"
                    onClick={() => {this.claimItem(item._id, this.state.quantityToClaim, item.quantity)}}>
                    Claim {this.state.quantityToClaim} {item.unit} of {item.name}
                  </button>
                  <button type="button" className="btn btn-default" id="claim-close" data-dismiss="modal" >Close</button>
                </div>
              </div>

            </div>
          </div>
        )
    }

    /*
      Render claim button when a new item is added.
    */
    renderClaimButton(item) {
      return (
        <div>
          <div>
            <button type="button" className="btn btn-default" data-toggle="modal" data-target={"#myModal"+item._id}>Claim</button>
          </div>
          {this.renderQuantityModal(item)}
        </div>
      )
    }

    /*
      Render remove button to remove an item from the supplies list.
    */
    renderRemoveButton(item) {
      return (
        <td>
          <button className="btn btn-default" onClick={() => this.removeItem(item)}>x</button>
        </td>
      )
    }

    /*
      Render contributor of this item when they click claim.
    */
    renderContributor(item) {
      if (item.contributor == null) {
        return (
          <td>
            {this.renderClaimButton(item)}
          </td>
          )
      } else {
        return (
          <td>{item.contributor.email}</td>
          )
      }
    }

    /*
      Render cost contributor enters that they spent on item.
    */
    renderCost(item) {
      if (item.contributor == null) {
        return (<td>Not Yet Determined</td>);
      } else if (item.cost == null) {
        if (item.contributor.email == this.props.currentUser.email){
          return (<td>{this.renderAddCostButton(item)}</td>);
        }
        return (<td>Not Yet Determined</td>)
      }
      return (<td>$ {item.cost}</td>)
    }

    /*
      Render all items on supply list.
    */
    renderSupplyList() {
      if (this.props.supplies.length > 0) {
        return (
          <div>
            <table id="supplies">
              <tbody>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Contributor</th>
                  <th>Cost</th>
                  <th>Remove</th>
                </tr>
                {this.props.supplies.map((item, key) => {
                  return <tr key={key}>
                            <td>{item.name}</td>
                            <td>{item.quantity} {item.unit}</td>
                            {this.renderContributor(item)}
                            {this.renderCost(item)}
                            {this.renderRemoveButton(item)}
                        </tr>
                })}
              </tbody>
            </table>
          </div>
        )
      }
    }

    /*
      Render supply list.
    */
    render() {
      return (
          <div>
            <p className='list-title'>Supply List</p>
            {this.renderSupplyList()}
            <button className="btn btn-default button-margin" onClick={this.onAddSuppliesClick}>Add Supplies</button>
            {this.renderInputs()}
          </div>
      )
    }
}

/*
* Model representing our items.
* EXAMPLE ITEM:
*   { 'name': 'Diet Coke'
*     'quantity': 2
*     'contributor': userId
*     'unit': 'liters'
*     'cost': 4.50
*    }
* Name is the name of the item, quantity is how much of the item is
* being brought, and contributor is the name of the person who signed
* up to bring this item. Unit is the units of the item, which is item-specific,
* and cost is the cost of the contribution (for example, this 2 liters of Diet
* Coke costed the contributor $4.50). The default of contributor is null,
* because every item is initially unclaimed.
*/
var inputValidation = require('../utils/validation.js');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Parties = require('./Parties.js');

var itemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  contributor: {type: ObjectId, ref: "User", default: null},
  unit: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
  },
});

itemSchema.path("name").validate(function (inputName) {
   const ok =  inputValidation.validateAlphaNumeric(inputName);
   return ok;
 }, 'Name Validation error');

 itemSchema.path("unit").validate(function (inputUnit) {
   const ok = inputValidation.validateAlphaNumeric(inputUnit);
   return ok;
 }, 'Unit Validation error');

 itemSchema.path("quantity").validate(function (inputQuant) {
   const ok = inputValidation.validateInputPositive(inputQuant);
   return ok;
 }, 'Quantitiy Validation error');

 itemSchema.path("cost").validate(function (inputCost) {
   const ok = inputValidation.validateInputPositive(inputCost);
   return ok;
 }, 'Cost Validation error');

var itemModel = mongoose.model('Item', itemSchema);

var Items = (function(itemModel) {

  var that = {};

  /*
    Creates an item to place on the supply list

    Params:
      - name: name of the item
      - quantity: quantity of the item
      - unit: appropriate units for the item (ex: liters, cups, bags)
    Callback:
      - success: save item in Item collection, send null response along with
        item saved
      - err: on failure, an error message
  */
  that.createItem = function(name, quantity, unit, callback) {
    var item = new itemModel({
      name: name,
      quantity: quantity,
      unit: unit,
    });

    item.save(function(err, newItem) {
      if (err) callback({ msg: err });
      else {
        callback(null, newItem);
      }
    });
  }

  /*
    Add cost of an item

    Params:
      - partyId: id of the party
      - itemId: id of the item to update
      - cost: cost of the item
    Callback:
      - success: update the cost for this item, and send a null response
      - cannot find this item: send message 'Item does not exist!'
      - err: on failure, an error message
  */
  that.addCost = function(partyId, itemId, cost, callback) {
    itemModel.findByIdAndUpdate(itemId, {$set: { cost: cost }}, function(err, updatedDoc) {
      if (err) callback({ msg: err });
      else {
        if (updatedDoc == null) {
          callback({ msg: 'Item does not exist!'});
        } else {
          callback(null);
        }
      }
    })
  }

  /*
    Add contributor of an item

    Params:
      - partyId: id of the party
      - itemId: id of the item
      - userId: id of the user claiming this item
      - claimedQuant: amount of the item claimed
    Callback:
      - success: send a null response along with json of updated info
      - cannot find this item: send message 'Item does not exist!'
      - err: on failure, an error message
  */
  that.addContributor = function(partyId, itemId, userId, claimedQuant, callback) {
    itemModel.find({_id: itemId}, function(err, result) {
      if (!result) {
        callback({msg: 'Item does not exist!'});
      } else {
        var originalQuant = result[0].quantity;
        var intClaimedQuant = parseInt(claimedQuant);
        var updatedQuant = originalQuant - intClaimedQuant;
        var name = result[0].name;
        var unit = result[0].unit;
        itemModel.findByIdAndUpdate(itemId, { $set: { contributor: userId, quantity: claimedQuant}}, function(err, updatedDoc) {
          if (err) callback({ msg: err });
          else {
            if (updatedDoc == null) {
              callback({ msg: 'Item or User does not exist!'});
            } else {
              var resultToSend = {
                partyId: partyId,
                name: name,
                quantity: updatedQuant,
                unit: unit,
              }
              callback(null, resultToSend);
            }
          }
        });  
      }
    });
  }

  /*
    Creates items to place on the supply list

    Param:
      - items: item documents to insert into the collection
    Callback:
      - success: send null response along with documents inserted
      - err: on failure, an error message
  */
  that.createItems = function(items, callback) {
    itemModel.insertMany(items, function(err, docs) {
      if (err) callback({msg: err});
      callback(null, docs);
    });
  }

  /*
    Remove contributor of one or more items

    Params:
      - items: items with which to remove contributor
      - userId: id of the user who had claimed the items
    Callback:
      - success: send a null response
      - err: on failure, an error message
  */
  that.removeContributor = function(items, userId, callback) {
    var errOccurred = false;
    items.forEach(function(item) {
      if (item.contributor !== null) {
        if (item.contributor.id == userId.toString()) {
          itemModel.findByIdAndUpdate(item.id, { $set: {contributor: null, cost: null}}, function(err, updatedDoc) {
            if (err) {
              errOccurred = true;
              console.log(err);
            } else {
              if (updatedDoc == null) {
                errOccurred = true;
                console.log('Item does not exist');
              }
            }
          });
        }
      }
    });
    if (errOccurred) {
      callback({ msg: "Error occurred removing an item's contributor" });
    } else {
      callback(null);
    }
  }

  Object.freeze(that);
  return that;

})(itemModel);

module.exports = Items;

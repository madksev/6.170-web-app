// Cost splitting functionality for any list of lists where the list[0] is a string representing
// an entity and the list[1] is the amount that the entity has contributed to the event for each
// list within the outer list.

// This will output a list of payments that must be made for everything in the original list to
// equally split the cost. Its' set up will be of objects with 3 fields, payer payee and amount.
var costSplitting = (function() {
  var that = {};

  /*
    Splits the costs as described above.

    @param contributions A list of lists where the list[0] is a string representing an entity and the
      list[1] is the amount that the entity has contributed to the event for each list within
      contributions.

    @return A list of payments that must be made for the incoming lists payments to balance out.
      This list will be made up of objects with 3 fields, payer, payee, and amount.
  */
  that.splitCosts = function(contributions) {
    var perPersonCost = contributions.reduce((a,b) => a + b[1], 0)*1.0/contributions.length;

    var keepContribution = function(contribution, index, array) {
      return Math.abs(contribution[1] - perPersonCost) >= 0.01;
    }

    var paymentsToMake = [];

    while (contributions.length > 0) {
      contributions = contributions.sort(function(a,b) {
        return a[1] - b[1];
      });
      var toPay = perPersonCost - contributions[0][1];
      var checkIndex = contributions.length - 1;

      while (toPay > 0.01) {
        var toBePaid = contributions[checkIndex][1] - perPersonCost;
        if (toPay - toBePaid <= 0) {
          contributions[checkIndex][1] -= toPay;
          contributions[0][1] += toPay;
          paymentsToMake.push({'payer':contributions[0][0], 'payee':contributions[checkIndex][0], 'amount':toPay});
          toPay = 0;
        } else {
          contributions[checkIndex][1] = perPersonCost;
          contributions[0][1] += toBePaid
          toPay -= toBePaid;
          paymentsToMake.push({'payer':contributions[0][0], 'payee':contributions[checkIndex][0], 'amount':toBePaid});
          checkIndex -= 1;
        }
      }
      contributions = contributions.filter(keepContribution);
    }
    return paymentsToMake;
  };

  Object.freeze(that);
  return that;
});

module.exports = costSplitting();

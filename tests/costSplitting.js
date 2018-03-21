var assert = require('assert');

describe('CostSplitting', function() {
  var splitter = require('../utils/costSplitting.js');

  describe('splitCosts', function() {
    it('Should return an Array', function() {
      var payments = splitter.splitCosts([['a',1]]);
      assert.equal(true, Array.isArray(payments));
    });

    it('Should return empty array if there are no payments to make', function() {
      var payments = splitter.splitCosts([['Anna', 5],['Ryan',5],['Maddie',5]]);
      assert.equal(0, payments.length);
    });

    it('Should return non-empty array if there are payments to make', function() {
      var payments = splitter.splitCosts([['Anna', 2],['Ryan',3],['Maddie',5]]);
      assert.equal(true, payments.length > 0);
    });

    it('Should return correct number of payments to be made', function() {
      var payments = splitter.splitCosts([['Anna', 2],['Ryan',3],['Maddie',5]]);
      assert.equal(2, payments.length);
    });

    it('Should return correct payments', function() {
      var payments = splitter.splitCosts([['Anna', 2],['Ryan',3],['Maddie',7]]);
      assert.equal(2, payments[0].amount);
      assert.equal('Anna', payments[0].payer);
      assert.equal('Maddie', payments[0].payee);
      assert.equal(1, payments[1].amount);
      assert.equal('Ryan', payments[1].payer);
      assert.equal('Maddie', payments[1].payee);
    });

    it('Should deal with non-integer payments correctly', function() {
      var payments = splitter.splitCosts([['Anna', 3],['Ryan', 4]]);
      assert.equal(0.5, payments[0].amount);
    });

  })
})

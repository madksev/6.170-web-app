// Validating Inputs
// The following object is used to validate inputs for our app, to prevent
// injection attacks

var inputValidation = (function() {
  var that = {};

  /*
    Validate that a number is greater than 0

    @param numberInput The value from an input that recieves numbers

    @return a boolean which is true if the input was a valid number
    greater than 0 and false otherwise
  */
  that.validateInputPositive = function(numberInput) {
    
    var floating = parseFloat(numberInput);
    if(floating == null || floating == undefined || floating == NaN) {
      return false;
    }
    return (floating > 0);
  };

  /*
    Validate that a number is non empty and less than a hundred characters

    @param textInput The text from an input that recieves some string of characters

    @return a boolean which is true if the text was smaller than 100 characters a
    and not all whitespace. It is false otherwise.
  */
  that.validateTextInputLength = function(textInput) {
    var trimmed = textInput.trim();
    if (trimmed.length == 0) {
      return false;
    }
    return trimmed.length < 100;
  }

  /*
    Validate than an input is a valid emailInput

    @param emailInput The text from an input that recieves some string of characters
    that is supposed to be an email

    @return a boolean which is true if the input was a valid email according to
    a regex expression. False otherwise.
  */
  that.validateEmail = function(emailInput) {
    var trimmed = emailInput.trim();
    if (trimmed.length == 0) {
      return false;
    }
    var email = new RegExp(/[a-zA-Z0-9]+(?:(\.|_)[A-Za-z0-9!#$%&'*+/=?^`{|}~-]+)*@(?!([a-zA-Z0-9]*\.[a-zA-Z0-9]*\.[a-zA-Z0-9]*\.))(?:[A-Za-z0-9](?:[a-zA-Z0-9-]*[A-Za-z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/, 'g');
    if(!email.test(trimmed)){
      return false;
    }
    return true;
  }


  /*
    Validate that the inputted value contains only letters, numbers and minimal
    whitespace

    @param input the value inputted into the input form to be tested

    @return true if the input contains only letters, numbers and minimal
    whitespace and false otherwise
  */

  that.validateAlphaNumeric = function(input) {
    var trimmed = input.trim();
    if (trimmed.length == 0) {
      return false;
    }
    var valueList = trimmed.split(" ");
    var alphaNumeric = new RegExp(/^[a-zA-Z0-9]+$/);
    for (var val of valueList) {
      if (!alphaNumeric.test(val)) {
         return false;
       }
     }
     return true;
  }

  Object.freeze(that);
  return that;
});

module.exports = inputValidation();

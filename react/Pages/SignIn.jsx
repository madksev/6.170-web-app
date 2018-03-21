import { Component } from 'react';
import React from 'react';
import { withRouter } from 'react-router';
import inputValidation from '../../utils/validation';

class SignIn extends Component {
    constructor(props){
        super(props);
        this.state = {
            loginEmail : '',
            loginPass : '',
            registerEmail : '',
            registerPass : ''
        };
        this.updateFormVal = this.updateFormVal.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.registerUser = this.registerUser.bind(this);
    }


    /*
      Updates the form values with the name in event.target.name and the value in event.target.value

      Params:
        event: Event holding the name of the field and value of it.
    */
    updateFormVal(event){
        var updatedField = event.target.name;
        var updatedValue = event.target.value;
        this.setState((prevState) => {
            prevState[updatedField] = updatedValue;
            return prevState;
        })
    }


    /*
      Registers the user for Potluck.
    */
    registerUser(){
        var okEmail = inputValidation.validateEmail(this.state.registerEmail);
        if(!okEmail) {
          alert('Please register with a valid email');
          return;
        }
        this.props.registerUser(this.state.registerEmail, this.state.registerPass);
    }


    /*
      Logs in the user with the current credientals passed in.
    */
    loginUser(){
        var okEmail = inputValidation.validateEmail(this.state.loginEmail);
        if(!okEmail) {
          alert('Please log in with a valid email');
          return;
        }
        this.props.loginUser(this.state.loginEmail, this.state.loginPass);
    }


    /*
      Renders the sign in page.
    */
    render(){
        return (
          <div id="background-signin">
              <div className='container' id="signin-container">
                  <div className='col-md-4 col-md-push-1'>
                      <h1 id='white-text'>Sign In</h1>
                      <div className='form'>
                          <div className='form-group'>
                              <input className='form-control'
                                     name='loginEmail'
                                     placeholder='Email'
                                     value={this.state.loginEmail}
                                     onChange={this.updateFormVal}
                                  />
                          </div>
                          <div className='form-group'>
                              <input className='form-control'
                                     type='password'
                                     name='loginPass'
                                     placeholder='Password'
                                     value={this.state.loginPass}
                                     onChange={this.updateFormVal}
                                  />
                          </div>
                          <button className='btn btn-default' onClick={this.loginUser}>Sign In</button>
                      </div>
                  </div>
                  <div className='col-md-4 col-md-push-2'>
                      <h1 id='white-text'>Register</h1>
                      <div className='form'>
                          <div className='form-group'>
                              <input className='form-control'
                                     name='registerEmail'
                                     placeholder='Email'
                                     value={this.state.registerEmail}
                                     onChange={this.updateFormVal}
                                  />
                          </div>
                          <div className='form-group'>
                              <input className='form-control'
                                     type='password'
                                     name='registerPass'
                                     placeholder='Password'
                                     value={this.state.registerPass}
                                     onChange={this.updateFormVal}
                                  />
                          </div>
                          <button className='btn btn-default' onClick={this.registerUser}>Register</button>
                      </div>
                  </div>
              </div>
              <div id="description">
                Potluck is an application for all of your party planning needs.
                Create a party, invite guests, and coordinate who's bringing
                what with a shared supplies list. Use Potluck to plan your next
                party, event, or gathering!
              </div>
              <div id="food-pic"></div>
            </div>
        )
    }
}

export default withRouter(SignIn);

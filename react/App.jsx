import Services from '../services';
import NavBar from './Elements/NavBar.jsx';
import { Component } from 'react';
import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            user : undefined,
        };

        this.loginUser = this.loginUser.bind(this);
        this.logout = this.logout.bind(this);
        this.registerUser = this.registerUser.bind(this);

    }


    componentWillMount() {
      Services.user.getCurrentUser()
        .then((res) => {
          if (res.content.loggedIn) {
            this.setState({
              user: res.content.user
            });
        }});
    }


    /*
      Attemps to login the user with credientals that are passed in.

      Params:
        email: Email of the user who is trying to log in.
        password: Password of the user who is trying to log in.
    */
    loginUser(email, password){
        Services.user.login(email, password)
            .then((res) => {
                if (res.success){
                    this.setState({
                        user: res.content.user
                    });
                    this.props.router.push('/');
                }
            }).catch((err) => {
                alert("Login error: " + err.error.err);
            });
    }


    /*
      Logs out the currentUser.
    */
    logout(){
        Services.user.logout().then((res) => {
            if (res.success){
                this.setState((prevState) => {
                    prevState.user = 'Not Logged In';
                    return prevState;
                });
                this.props.router.push('/signin');
            }
        });
    }


    /*
      Registers a new user with the email and password passed in.

      Params:
        email: email to register the new user with.
        password: password to register the new user with.
    */
    registerUser(email, password){
        Services.user.register(email, password).then((res) => {
            if (res.success){
                this.loginUser(email, password);
            }
        }).catch((err) => {
            alert("Error on register user: " + err.error.err);
        });
    }


    /*
      Renders the whole application.
    */
    render(){
        return (
            <div id='reactRoot'>
                <NavBar
                    currentUser={this.state.user}
                    logout={this.logout}
                    services ={Services}
                    />
                <div id='page-content'>
                    {React.cloneElement(this.props.children, {
                        services : Services,
                        user : this.state.user,
                        loginUser : this.loginUser,
                        registerUser : this.registerUser,
                    })}
                </div>
            </div>
        );
    }
};

App.propTypes = {
    children : React.PropTypes.any.isRequired
};

export default withRouter(App);

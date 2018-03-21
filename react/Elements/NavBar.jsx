import { Component } from 'react';
import React from 'react';
import { IndexLink, Link, withRouter } from 'react-router';

class NavBar extends Component {
    constructor(props){
        super(props);

        this.defaultProps = {
            currentUser : 'Not Logged In'
        };

    }


    /*
      Renders the logoutItem if the user is logged in.
    */
    logoutItem() {
        if (!(this.props.currentUser === undefined || this.props.currentUser === null ||
            this.props.currentUser === 'Not Logged In')) {
            return (
                <li>
                    <a onClick={this.props.logout}>Log Out</a>
                </li>
            );
        }
    }


    /*
      Renders the currentUser's email if they are logged in.
    */
    currentUserItem() {
        if (!(this.props.currentUser === undefined || this.props.currentUser === null ||
            this.props.currentUser === 'Not Logged In')) {
            if (this.props.currentUser.email !== null && this.props.currentUser.email !== undefined) {
                return (
                    <li>
                        <a>{this.props.currentUser.email}</a>
                    </li>
                );
            }
        }
    }

    /*
      Renders the nav bar.
    */
    render(){

        return (
            <nav className='navbar navbar-default navbar-fixed-top' id='main-navbar'>
                <div className='container'>
                    <div className='navbar-header'>
                        <IndexLink to='/' className='navbar-brand'>Potluck</IndexLink>
                    </div>
                    <ul className='nav navbar-nav navbar-right'>
                        { this.currentUserItem() }
                        { this.logoutItem() }
                    </ul>
                </div>
            </nav>
        )
    }
};

NavBar.propTypes = {
    currentUser : React.PropTypes.any,
    logoutCallback : React.PropTypes.func,
    findUserCallback : React.PropTypes.func
};

export default withRouter(NavBar);

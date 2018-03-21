import App from './App.jsx';
import SignIn from './Pages/SignIn.jsx';
import Homepage from './Pages/Homepage.jsx';
import NotFound from './Pages/NotFound.jsx';
import services from '../services';
import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

// Stubbed out authCheck will automatically redirect to the signin route
// if there's no current user.  Example implementation online:
// https://github.com/ReactTraining/react-router/blob/master/examples/auth-flow/auth.js
const authCheck = (nextState, replace, callback) => {
    services.user.getCurrentUser().then((response) => {
        if (!response.content.loggedIn){
            replace('/signin');
        }
        callback();
    }).catch((err) => {
        console.log("Err on getCurrentUser() : ", err);
        callback();
    });
};

export default (
    <Router history={browserHistory} >
        <Route path='/' component={App}  >
            <IndexRoute component={Homepage}
                        onEnter={authCheck} />
            <Route path="signin"
                   component={SignIn} />
            <Route path="*"
                   component={NotFound} />
        </Route>
    </Router>
);

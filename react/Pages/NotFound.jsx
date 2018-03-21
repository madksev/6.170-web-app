import { Component } from 'react';
import React from 'react';

export default class NotFound extends Component {
    constructor(props){
        super(props);
    }


    /*
      Renders a not found page.
    */
    render(){
        return (
            <div className='container'>
                <h1>404 <small>We couldn't find the route you were looking for...</small></h1>
            </div>
        )
    }
}

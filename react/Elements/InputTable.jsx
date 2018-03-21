import { Component } from 'react';
import React from 'react';

export default class InputTable extends Component {
	constructor(props) {
		super(props);

		this.populateTable = this.populateTable.bind(this);
	}


	/*
		Removes the input in the table.
	*/
	removeInput(input) {
		this.props.removeInput(input);
	}


	/*
		Populates the table with the inputs that are passed in.
	*/
	populateTable(inputs) {

		return inputs.map((input, key) => {
			if (input.entry3 != null) {
				return (
					<tr key={input.entry1}>
						<td>{input.entry1}</td>
						<td>{input.entry2}</td>
						<td>{input.entry3}</td>
						<td><button onClick={() => {this.removeInput(input)}}>x</button></td>
					</tr>
				);
			} return (
					<tr key={input.entry1}>
						<td>{input.entry1}</td>
						<td>{input.entry2}</td>
						<td><button onClick={() => {this.removeInput(input)}}>x</button></td>
					</tr>
					);
		});
	}

	/*
		Renders the input table.
	*/
	render(){
		return (
			<table className="table">
				<caption>{this.props.title}</caption>
			  <thead>
			    <tr>
			    	<th>{this.props.col1name}</th>
						<th>{this.props.col2name}</th>
						<th>{this.props.col3name}</th>
			    </tr>
			  </thead>
			  <tbody>
			  	{this.populateTable(this.props.inputs)}
			  </tbody>
			 </table>
  );
	}
}

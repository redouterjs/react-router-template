// more easily mounted browser container
import React, { Component, PropTypes } from 'react';
const { object } = PropTypes;

export default class AppContainer extends Component {
	render() {
		const { props, context } = this;
		let title = 'No Title';


		if (context.store) {
			title = context.store.getState().title;
		}

		return (
			<div>
				<h1>{title}</h1>
				{props.children}
			</div>
		);
	}
}

AppContainer.contextTypes = {
	store: object
};
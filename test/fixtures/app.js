import React, { Component, PropTypes } from 'react';
const { object } = PropTypes;

export default class App extends Component {
	render() {
		const { props, context } = this;
		let title = 'No Title';


		if (context.store) {
			title = context.store.getState().title;
		}

		return (
			<html>
				<head>
					<title>{title}</title>
				</head>
				<body>
					<div>
						{props.children}
					</div>
				</body>
			</html>
		);
	}
}

App.contextTypes = {
	store: object
};
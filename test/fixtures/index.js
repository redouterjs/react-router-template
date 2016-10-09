import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';
import App from './app';
import Test from './test';

const { object } = PropTypes;

export const testRoutes = (
	<Route path="/" component={App}>
		<Route path="test" component={Test} />
	</Route>
);

export class TestProvider extends Component {
	constructor(props) {
		super(props);

		this.state = { ...(props.initialState || {}) };
		this.store = {
			getState: () => this.state,
		};
	}

	getChildContext() {
		return { store: this.store };
	}

	render() {
		return this.props.children; 
	}
}

TestProvider.contextProps = {
	store: object
};

TestProvider.childContextTypes = {
	store: object
};

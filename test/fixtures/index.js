import React, { Component, PropTypes } from 'react';
import { Route, Redirect } from 'react-router';
import App from './app';
import AppContainer from './app-container';
import Test from './test';

const { object } = PropTypes;

export const serverRoutes = (
	<Route path="/" component={App}>
		<Redirect path="redir" to="test" />
		<Route path="test" component={Test} />
	</Route>
);

export const clientRoutes = (
	<Route path="/" component={AppContainer}>
		<Redirect path="redir" to="test" />
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

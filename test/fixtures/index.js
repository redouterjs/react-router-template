import React, { Component, PropTypes } from 'react';
import { Route, Redirect } from 'react-router';
import App from './app';
import AppContainer from './app-container';
import Test from './test';

const { object } = PropTypes;
const DELAY = 100;

export const serverRoutes = (
	<Route path="/" component={App}>
		<Redirect from="redir" to="test" />
		<Route path="test" component={Test} />
	</Route>
);

export const clientRoutes = (
	<Route path="/" component={AppContainer}>
		<Redirect from="redir" to="test" />
		<Route path="test" component={Test} />
	</Route>
);

function asyncRoutes(Parent) {
	const ChildRoute = <Route path="test" getComponent={(nextState, cb) => {
		setTimeout(() => {
			cb(null, Test);
		}, DELAY);
	}} />;

	const RedirectRoute = <Redirect from="redir" to="test" />

	const MainRoute = {
		path:'/',
		getChildRoutes(partialNextState, cb) {
			setTimeout(() => {
				// IMPORTANT NOTE: if ANY of the elements in the array
				// are not React elements, react-router's RouteUtils will
				// NOT invoke the createRoutesFromReactChildren function
				// which makes the <Redirect> element useless.
				cb(null, [
					RedirectRoute,
					ChildRoute				
				]);
			}, DELAY);
		},
		getComponent(nextState, cb) {
			setTimeout(() => {
				cb(null, Parent);
			}, DELAY);
		}
	};

	return MainRoute;
}

export const asyncClientRoutes = asyncRoutes(AppContainer);
export const asyncServerRoutes = asyncRoutes(App);

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

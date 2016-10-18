/* global document, Node */
import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import Promise from 'bluebird';

const noOp = _ => _;

export default function ({ target = document, wrapComponent = noOp, routes, createElement } = {}) {

	if (!target || !(target instanceof Node)) {
		throw new Error('The client side templater requires a valid DOM node assigned to the target property on the configuration object');
	}

	return async ({ history } = {}) => new Promise((ok, fail) => {
		try {
			if (!history) {
				history = browserHistory;
			}

			let output; // ugly, but oh well
			const routerProps = { history, createElement };

			output = render(wrapComponent(
				<Router {...routerProps}>{routes}</Router>
			), target, function callback() { ok(output) });
		} catch (err) {
			fail(err);
		}
	});

}
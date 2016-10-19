/* global document, Node */
import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import Promise from 'bluebird';

const noOp = _ => _;

export default function ({ wrapComponent = noOp, routes, createElement } = {}) {

	return async (history, target = document) => new Promise((ok, fail) => {
		try {
			if (history instanceof Node) {
				target = history;
				history = undefined;
			}

			if (!history) {
				history = browserHistory;
			}

			if (history && history.history) {
				history = history.history;
			}

			if (!target || !(target instanceof Node)) {
				throw new Error('You must provide a valid DOM node as the render target');
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
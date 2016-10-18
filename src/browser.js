/* global document */
import React from 'react';
import { render } from 'react-dom';
import { createHistory } from 'history';
import { Router, useRouterHistory } from 'react-router';
import Promise from 'bluebird';

const noOp = _ => _;

export default function ({ target = document, wrapComponent = noOp, routes, createElement }) {

	return async ({ history = useRouterHistory(createHistory)() }) => new Promise((ok, fail) => {
		try {
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
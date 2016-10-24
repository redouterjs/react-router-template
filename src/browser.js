/* global document, Node */
import React from 'react';
import { render } from 'react-dom';
import { 
	Router,
	browserHistory,
	match
} from 'react-router';
import Promise from 'bluebird';

const noOp = _ => _;

export default function ({ wrapComponent = noOp, routes, createElement } = {}) {

	// due to the way react-router async routes work, we also use
	// match here in a manner identical to the server side, but instead
	// of throwing errors we try to deal with it. In particular, for redirects,
	// we have a recursive loop that  will work in a manner very similar to how
	// react-router's internal transitionManger works
	//
	// ref modules/createTransitionManager, "listen" function
	async function matchLoop(history) {
		return new Promise((ok, fail) => {
			try {
				match({ routes, history, createElement }, (err, redir, renderProps) => {
					if (err) {
						return fail(err);
					} else if (redir) {
						// we call matchLoop again until we match
						history.replace(redir);
						return ok(matchLoop(history));
					}

					return ok(renderProps); // could be null if no location found

				});
			} catch (matchLoopErr) {
				fail(matchLoopErr);
			}
		});
	}

	return async (history, target = document) => {

		if (history instanceof Node) {
			target = history;
			history = undefined;
		}

		if (history && history.hasOwnProperty('history')) {
			history = history.history;
		}

		if (!history || !history.listen) {
			history = browserHistory;
		}

		if (!target || !(target instanceof Node)) {
			throw new Error('You must provide a valid DOM node as the render target');
		}

		const resolvedRouterProps = await matchLoop(history);
		const finalRouterProps = {
			...resolvedRouterProps,
			history,
			createElement
		};

		return render(wrapComponent(
			<Router {...finalRouterProps}>{routes}</Router>
		), target);
	};

}
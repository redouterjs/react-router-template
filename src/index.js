import React from 'react';
import { renderToString } from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import Promise from 'bluebird';

const noOp = _ => _;

export default function ({ wrapHtml = noOp, wrapComponent = noOp, routes, createElement }) {

	return async ({ originalUrl }) => new Promise((ok, fail) => {
		try {
			match({ routes, location: originalUrl }, async (err, redir, renderProps) => {
				if (err) {
					return fail(err);
				} else if (redir) {
					// there is no reason for react-router to redirect
					return fail(302);
				} else if (!renderProps) {
					return fail(404);
				}

				renderProps.createElement = createElement;

				try {
					const wrapped = await wrapComponent(<RouterContext {...renderProps} />);
					const html = renderToString(wrapped);
					const output = wrapHtml(html);
					return ok(output);
				} catch(renderErr) {
					return fail(renderErr);
				}
			});
		} catch (matchErr) {
			return fail(matchErr);
		}
	});
		
}
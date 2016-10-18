import React from 'react';
import { renderToString } from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import Promise from 'bluebird';

const noOp = _ => _;

export default function ({ wrapHtml = noOp, wrapComponent = noOp, routes, createElement }) {

	return async ({ originalUrl } = {}) => new Promise((ok, fail) => {
		try {
			if (!originalUrl) {
				throw new Error('You must specify an object with the originalUrl property when rendering');
			}

			match({ routes, location: originalUrl }, async (err, redir, renderProps) => {
				if (err) {
					return fail(err);
				} else if (redir) {
					const redirectError = new Error('302');
					redirectError.status = redirectError.statusCode = 302;
					redirectError.location = redirectError.url = `${redir.pathname}${redir.search}`;
					return fail(redirectError);
				} else if (!renderProps) {
					const notFoundError = new Error('404');
					notFoundError.status = notFoundError.statusCode = 404;
					return fail(notFoundError);
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
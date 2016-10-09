# react-router-template

Provides a flexible promise-based server-side rendering of react-router routes.

A renderer is created by passing in four parameters:

* routes - basically the routes required for react-router to match against
* createElement - optional function passed to the `<RouterContext>`
* wrapComponent - optional function that is passed the resulting `<RouterContext>`, allowing you to wrap / compose it in Providers or other additional React components
* wrapHtml - optional function that allows you to decorate the resultant HTML rendered e.g. appending `<!doctype html>`

The renderer itself is a function that takes only one argument, and expects the argument to be an object with the `originalUrl` property. Usually, you can just pass in the `req` object from express.

Note: The renderer returns a Promise, and the functions `wrapHtml` and `wrapComponent` are also resolved as Promises. Routing errors are returned as simple status codes.

* 404 is returned if the route is not found.
* 302 is returned if it is a redirect (this really should not happen)

## usage

This assumes you're pairing this with `react-redux`

```
import routerTemplate from '../src';

....

const renderer = routerTemplate({
	routes: (<Route path="/" component={App} />),
	wrapHtml: html => `<!DOCTYPE HTML>${html}`,
	wrapComponent: component => (
		<Provider store={store}>
			{component}
		</Provider>
	),
});

renderer('/').then(html => {
	assert(html.startsWith('<!DOCTYPE HTML>'));
	// etc.
})
```

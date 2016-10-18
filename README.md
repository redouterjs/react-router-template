# react-router-template

Provides a flexible promise-based server-side rendering of react-router routes.

A renderer is created by passing in an options object with four parameters:

* `routes` - basically the routes required for react-router to match against
* `createElement` - optional function passed to the `<RouterContext>`
* `wrapComponent` - optional function that is passed the resulting `<RouterContext>`, allowing you to wrap / compose it in Providers or other additional React components
* `wrapHtml` - optional function that allows you to decorate the resultant HTML rendered e.g. appending `<!doctype html>`

The renderer itself is a function that takes only one argument, and expects the argument to be an object with the `originalUrl` property. Usually, you can just pass in the `req` object from express.

Note: The renderer returns a Promise, and the functions `wrapHtml` and `wrapComponent` are also resolved as Promises. Routing errors are simple Error objects with a `message` **string** property matching the status code, as below:

* 404 is returned if the route is not found.
* 302 is returned if it is a redirect

You may also read the `status` or `statusCode` **number** properties. In addition, for redirects, the properties `location` and `url` will point to the new path.

## usage

This assumes you're pairing this with `react-redux`, and thus wrapping the router with a `<Provider>`

```
import routerTemplate from 'react-router-template';

....

const renderer = routerTemplate({
	routes: (<Route path="/" component={App} />),
	wrapHtml: html => `<!DOCTYPE HTML>${html}`,
	wrapComponent: component => (
		<Provider store={store}>
			{component}
		</Provider>
	)
});

assert(req.originalUrl === '/'); // technically, any object with `originalUrl` is sufficient.

renderer(req).then(html => {
	assert(html.startsWith('<!DOCTYPE HTML>'));
	// etc.
}).catch(err => {
	if (err.status === 404) {
		// handle not found path
	} else if (err.status === 302) {
		// handle redirect
		res.redirect(err.location);
	}
})
```

## browser usage

react-router-template also provides a client-side variant of the renderer, with a few diferences:

* There is no `wrapHtml` as it is meaningless. Instead, `target` is used to define which DOM element to mount the react component. If not specified, it defaults to `document`, i.e. the entire `<html>`.
* Since the `originalUrl` is a function of the browser location and is automatically determined, an object with the `history` property is required instead when rendering. If not specified, it defaults to a HTML5 history.
* For greatest flexibility, the rendering is wrapped in a Promise even though React typically mounts on the DOM synchronously.
* Bundlers are expected to use the entrypoint specified by `browser` in this module's `package.json` as per the [specifications outlined here][1]

```
import routerTemplate from 'react-router-template';
import { browserHistory as history } from 'react-router';

....

const renderer = routerTemplate({
	routes: (<Route path="/" component={App} />),
	target: document.getElementById('container'),
	wrapComponent: component => (
		<Provider store={store}>
			{component}
		</Provider>
	)
})

renderer({ history }).then(() => {
	// at this point, the react component has been rendered
});
```

[1]: https://github.com/defunctzombie/package-browser-field-spec
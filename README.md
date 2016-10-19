# react-router-template

Provides a universal solution to rendering a [react-router][rr] hierarchy on both the server and the client.

`react-router-template` aims to balance between a simple approach to rendering routes while maintaining enough flexibility to support all the needed options for bother server and client.

`react-router-template` allows a user to define a _template_ on how to render components, which may involve wrapping the resulting output with additional React components, or additional strings that cannot be rendered by React, such as prefixing with the `DOCTYPE`.

## server

Server-side templates are defined with the following options:

* `routes` - the `<Route>` hierarchy required for react-router to match against and render
* `createElement` - optional function passed to the `<RouterContext>`
* `wrapComponent` - optional function that is passed the resulting `<RouterContext>`, allowing you to wrap / compose it in Providers (e.g. [react-redux's `<Provider>`][rrx]) or other additional React components
* `wrapHtml` - optional function that allows you to decorate the resultant HTML string

Note that the output of all optional functions are evaluated as `Promise`s, so all functions can be asynchronous.

```
import template from 'react-router-template';
import { Route } from 'react-router';
import { Provider } from 'react-redux';
import { App, Index } from './components'; // or wherever you place them

const routes = (
	<Route path="/" component={App}>
		<Route path="/index" component={Index} />
	</Route>
);

// most basic use case
const render = template({
	routes
});

// using more options
const render = template({
	routes,
	wrapHtml: html => `<!DOCTYPE HTML>${html}`,
	wrapComponent: component => (
		<Provider store={store}>
			{component}
		</Provider>
	)
});
```

The output is a _render()_ function that returns a Promise resolving into a string:

```
// assuming an express route
app.get('*', (req, res) => {
	render(req).then(html => res.end(html));
});
```

In the example above, the `req` object is passed in directly, but:

* any object with the `originalUrl` property is sufficient.
* a string representing the path to render is also sufficient.

```
// both of these will work
render('/some-path');
render({ originalUrl: '/some-path'});
```

### not founds and redirects

When the path specified cannot be found or redirects, the `render` function will throw an `Error` with the following properties:

* `.status` or `statusCode` will be a number, `404` for not found, `302` for redirects.
* For redirects, `.location` or `.url` will also be present to allow the developer to take the appropriate action

```
app.get('*', (req, res) => {
	render(req)
		.then(html => res.end(html))
		.catch(err => {
			const { status, location } = err;
			if (status === 404) {
				// handle not found
			} else if (status === 302) {
				res.redirect(location);
			} else {
				// other error handling
			}
		});
});
```

## browser

Client-side templates are defined with the following options:

* `routes` - the `<Route>` hierarchy required for react-router to match against and render
* `createElement` - optional function passed to the `<RouterContext>`
* `wrapComponent` - optional function that is passed the resulting `<RouterContext>`, allowing you to wrap / compose it in Providers (e.g. [react-redux's `<Provider>`][rrx]) or other additional React components

The client-side lacks the `wrapHtml` option, because on the client React is primarily concerned with mounting the component onto an existing DOM, rather than producing any HTML string output.

Again, all optional functions are evaluated as `Promise`s.

```
import template from 'react-router-template';
import { Route } from 'react-router';
import { Provider } from 'react-redux';
import { App, Index } from './components'; // or wherever you place them

// most basic use case
const render = template({
	routes
});

// using more options
const render = template({
	routes,
	wrapComponent: component => (
		<Provider store={store}>
			{component}
		</Provider>
	)
});
```

The resulting `render()` function takes **2** arguments, rather than one. Instead of a path (or an object containing `originalUrl`):

* the first argument should be a `history` object (or object containing a `history` property).
* the second argument should be the DOM element to mount the React component to.

This, again, reflects the nature of client-side rendering - the path is usually determined from the browser context rather than being supplied, and the second argument matches React's own `render` signature.

```
// some client JS entry point
import { browserHistory } from 'react-router';

const target = document.getElementById('container');

render(browserHistory, target)
	.then(() => console.log('rendering complete'));
```

If the history object is not specified (i.e. only one argument, the `target`, is supplied), then it is assumed that `react-router`'s `browserHistory` will be used.

```
// both of these will work
render({ history: browserHistory}, target);
render(target);
```

### error handling

There is no special API for errors, apart from the fact that any error is caught as a Promise rejection. Any errors created are no different than if you weren't using react-router-template, but just React's native `.render()` method.

```
render(browserHistory, target)
	.catch(err => console.error(err));
```

### note regarding client-side bundlers like webpack

Bundlers are expected to use the entrypoint specified by `browser` in this module's `package.json` as per the [specifications outlined here][1]

[rr]: https://github.com/ReactTraining/react-router
[rrx]: https://github.com/reactjs/react-redux/blob/master/docs/api.md#provider-store
[1]: https://github.com/defunctzombie/package-browser-field-spec
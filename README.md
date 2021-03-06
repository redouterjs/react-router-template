# react-router-template

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

Quickly render universal react-router components using a simple API.

```js
// Server
import template from 'react-router-template';

const render = template({
	routes,
	wrapHtml: html => `<!DOCTYPE HTML>${html}`,
	wrapComponent: component => (
		<Provider store={store}>
			{component}
		</Provider>
	)
});

app.get('*', (req, res) => {
	render(req).then(html => res.end(html));
});
```

```js
// Browser
import template from 'react-router-template';

const render = template({
	routes,
	wrapComponent: component => (
		<Provider store={store}>
			{component}
		</Provider>
	)
});

render(document.getElementById('container'))
	.then(() => console.log('rendering complete'));
```

## overview

`react-router-template` is a universal solution to rendering a [react-router][rr] hierarchy on both the server and the browser.

Simply provide a _template_ on how to render components with the option to alter the output as you like, then use the returned `render` function to either output a string (on the server) or mount on the DOM (in the browser). Common alterations to the output are wrapping it in a `<Provider>` or prepending a `<!DOCTYPE>`.

* ignore complexities of universal rendering
* use async routes on the browser with async rendering
* juggle the output in any way you need.

# Server usage

Server-side templates are defined with the following options:

* `routes` - the `<Route>` hierarchy required for react-router to match against and render. **Supports async routes**
* `createElement` - optional function passed to the `<RouterContext>`
* `wrapComponent` - optional function that is passed the resulting `<RouterContext>`, allowing you to wrap / compose it in Providers (e.g. [react-redux's `<Provider>`][rrx]) or other additional React components
* `wrapHtml` - optional function that allows you to decorate the resultant HTML string

Both `wrapComponent` and `wrapHtml` are evaluated as `Promise`s, and thus can be either synchronous or asynchronous.

```js
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
const render = template({ routes });

// using more options
const anotherRender = template({
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

```js
// assuming an express route
app.get('*', (req, res) => {
	render(req).then(html => res.end(html));
});
```

In the example above, the `req` object is passed in directly, but:

* any object with the `originalUrl` property is sufficient.
* a string representing the path to render is also sufficient.

```js
// both of these will work
render('/some-path');
render({ originalUrl: '/some-path'});
```

## not founds and redirects

When the path specified cannot be found or redirects, the `render` function will throw an `Error` with the following properties:

* `.status` or `statusCode` will be a number, `404` for not found, `302` for redirects.
* For redirects, `.location` or `.url` will also be present to allow the developer to take the appropriate action

```js
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

# Browser usage

Browser templates are defined with the following options:

* `routes` - the `<Route>` hierarchy required for react-router to match against and render.  **Supports async routes**
* `createElement` - optional function passed to the `<RouterContext>`
* `wrapComponent` - optional function that is passed the resulting `<RouterContext>`, allowing you to wrap / compose it in Providers (e.g. [react-redux's `<Provider>`][rrx]) or other additional React components

`wrapComponent` is evaluated as a `Promise` and thus can be either synchronous or asynchronous.

```js
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

The resulting `render()` is a promise-returning function that takes up to 2 arguments, rather than just one. Instead of a path (or an object containing `originalUrl`):

* the first argument can be a `history` object (or object containing a `history` property).
* the second argument, if present, should be the DOM element to mount the React component to.

```js
// some client JS entry point
import { browserHistory } from 'react-router';

const target = document.getElementById('container');

render(browserHistory, target)
	.then(() => console.log('rendering complete'));
```

If the history object is not specified (i.e. only one argument, the `target`, is supplied), then it is assumed that `react-router`'s `browserHistory` will be used.

```js
// both of these will work
render({ history: browserHistory}, target);
render(target);
```

This reflects the nature of client-side rendering - the path is usually determined from the browser context rather than being supplied, and the second argument matches React's own `render` signature.

**NOTE:** There is no `wrapHtml` option, because on the browser React is primarily concerned with _mounting_ the component onto an existing DOM, not producing any HTML string output.

## error handling

There is no special API for errors on the browser, apart from the fact that any error is caught as a Promise rejection. 

**Redirects are handled automatically on the browser for you via the supplied history object.**

Any errors created are no different than if you weren't using react-router-template, but just React's native `.render()` method.

```js
render(browserHistory, target)
	.catch(err => console.error(err));
```

## note regarding client-side bundlers like webpack

Bundlers are expected to use the entrypoint specified by `browser` in this module's `package.json` as per the [specifications outlined here][1]

[rr]: https://github.com/ReactTraining/react-router
[rrx]: https://github.com/reactjs/react-redux/blob/master/docs/api.md#provider-store
[1]: https://github.com/defunctzombie/package-browser-field-spec
[npm-image]: https://badge.fury.io/js/react-router-template.svg
[npm-url]: https://npmjs.org/package/react-router-template
[travis-image]: https://travis-ci.org/redouterjs/react-router-template.svg?branch=master
[travis-url]: https://travis-ci.org/redouterjs/react-router-template
[daviddm-image]: https://david-dm.org/redouterjs/react-router-template.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/redouterjs/react-router-template
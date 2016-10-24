/* global document */
import React from 'react';
import { createMemoryHistory } from 'react-router';
import test from 'ava';
import routerTemplate from '../../src/browser';
import { clientRoutes as routes, TestProvider } from '../fixtures';

function setupTest(location) {

	const container = document.createElement('div');
	container.id = `container-${Math.floor(Math.random() * 100000)}`;
	document.body.appendChild(container);

	const history = createMemoryHistory();
	history.push(location);

	return { target: container, history };

}

test('basic usage', async t => {
	const { target, history } = setupTest('/');
	const renderer = routerTemplate({ routes });

	await renderer({ history }, target);
	t.is(target.querySelectorAll('div').length, 1);
	t.is(target.querySelector('h1').textContent, 'No Title');
	t.pass();
});

test('works without placing history in an object', async t => {
	const { target, history } = setupTest('/');
	const renderer = routerTemplate({ routes });

	await renderer(history, target);
	t.is(target.querySelectorAll('div').length, 1);
	t.is(target.querySelector('h1').textContent, 'No Title');
	t.pass();
});

test('wrappers', async t => {
	const { target, history } = setupTest('/');
	const initialState = { title: 'Pineapple' };
	const renderer = routerTemplate({
		routes,
		wrapComponent: component => (
			<TestProvider initialState={initialState}>
				{component}
			</TestProvider>
		),
	});

	await renderer({ history }, target);
	t.is(target.querySelector('h1').textContent, 'Pineapple');
	t.pass();
});

test('not found', async t => {
	const { target, history } = setupTest('/nosuchroute');
	const renderer = routerTemplate({ routes });

	await renderer({ history }, target);
	t.is(target.innerHTML, '<!-- react-empty: 1 -->');
	t.pass();
});

test('redirect', async t => {
	const { target, history } = setupTest('/redir');

	const renderer = routerTemplate({ routes });

	await renderer({ history }, target);

	// artifact of idiocy of react-router not supporting history.location
	history.listen(({ pathname }) => {
		t.is(pathname, '/test');
		t.pass();
	});
});

test('no history', async t => {
	const { target } = setupTest('/redir');

	const renderer = routerTemplate({ routes });

	// in both cases, it should not fail and default to creating
	// a browser history
	await renderer(target);
	await renderer({}, target);
	t.pass();
});

test('invalid target', async t => {
	try {
		const { history } = setupTest('/redir');
		const renderer = routerTemplate({ routes });
		await renderer(history, 'invalid target');
		t.fail('expected an error');
	} catch (err) {
		t.truthy(err instanceof Error);
		t.pass();
	}
});

test('no routes', async t => {
	const { history, target } = setupTest('/redir');
	const renderer = routerTemplate();
	await renderer(history, target);
	t.pass();
});
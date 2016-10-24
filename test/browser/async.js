/* global document */
import React from 'react';
import { createMemoryHistory } from 'react-router';
import test from 'ava';
import routerTemplate from '../../src/browser';
import { asyncClientRoutes as routes, TestProvider } from '../fixtures';

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
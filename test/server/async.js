import React from 'react';
import test from 'ava';
import { asyncServerRoutes as routes, TestProvider } from '../fixtures';
import routerTemplate from '../../src/server';
import cheerio from 'cheerio';

test('basic usage', async t => {
	const renderer = routerTemplate({ routes });

	const output = await renderer({ originalUrl: '/' });
	const $ = cheerio.load(output);
	t.is($('div').length, 1);
	t.is($('title').text(), 'No Title');
	t.pass();
});

test('child route', async t => {
	const renderer = routerTemplate({ routes });

	const output = await renderer({ originalUrl: '/test' });
	const $ = cheerio.load(output);
	t.is($('p').length, 1);
	t.is($('p').text(), 'Hello world');
	t.pass();
});

test('wrappers', async t => {
	const initialState = { title: 'Pineapple' };
	const renderer = routerTemplate({
		routes,
		wrapHtml: html => `<!DOCTYPE HTML>${html}`,
		wrapComponent: component => (
			<TestProvider initialState={initialState}>
				{component}
			</TestProvider>
		),
	});

	const output = await renderer({ originalUrl: '/' });
	t.truthy(output.startsWith('<!DOCTYPE HTML>'));
	const $ = cheerio.load(output);
	t.is($('title').text(), 'Pineapple');
	t.pass();
});

test('not found', async t => {
	const renderer = routerTemplate({ routes });

	try {
		await renderer({ originalUrl: '/nosuchroute' });
		t.fail('Should have thrown an error');
	} catch (err) {
		t.truthy(err instanceof Error);
		t.is(err.message, '404');
		t.is(err.status, 404);
		t.is(err.statusCode, 404);
		t.pass();
	}
});

test('redirect', async t => {
	const renderer = routerTemplate({ routes });

	try {
		await renderer({ originalUrl: '/redir' });
		t.fail('Should have thrown an error');
	} catch (err) {
		t.truthy(err instanceof Error);
		t.is(err.message, '302');
		t.is(err.status, 302);
		t.is(err.statusCode, 302);
		t.is(err.url, '/test');
		t.is(err.location, '/test');
		t.pass();
	}
});
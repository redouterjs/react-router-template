import React from 'react';
import test from 'ava';
import { testRoutes, TestProvider } from './fixtures';
import routerTemplate from '../src';
import cheerio from 'cheerio';

test('basic usage', async t => {
	const renderer = routerTemplate({ routes: testRoutes });

	const output = await renderer({ originalUrl: '/' });
	const $ = cheerio.load(output);
	t.is($('div').length, 1);
	t.is($('title').text(), 'No Title');
	t.pass();
});

test('wrappers', async t => {
	const initialState = { title: 'Pineapple' };
	const renderer = routerTemplate({
		routes: testRoutes,
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
	const renderer = routerTemplate({ routes: testRoutes });

	try {
		await renderer({ originalUrl: '/nosuchroute' });
		t.fail('Should have thrown an error');
	} catch (err) {
		t.is(err, 404);
		t.pass();
	}
});
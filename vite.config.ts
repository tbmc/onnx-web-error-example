import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import type { ViteDevServer } from 'vite';
import fs from 'fs';

function headerPlugin() {
	return {
		name: 'headerPlugin',
		configureServer(server: ViteDevServer) {
			server.middlewares.use((req, res, next) => {
				res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
				res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
				res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

				next();
			});
		}
	};
}

export default defineConfig({
	plugins: [sveltekit(), headerPlugin()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		https: {
			key: fs.readFileSync(`${__dirname}/cert/key.pem`),
			cert: fs.readFileSync(`${__dirname}/cert/cert.pem`)
		},
		proxy: {}
	},
	build: {
		minify: false,
		sourcemap: true
	}
});

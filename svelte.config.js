import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$components: './src/components',
			$helpers: './src/helpers',
			$models: './src/models',
			$routes: './src/routes'
		}
	}
};

export default config;

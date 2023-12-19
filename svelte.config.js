import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html',
			precompress: true
		}),
		paths: {
            base: process.env.NODE_ENV === 'production' ? '/my-fitness-appointment' : '',
        },
		alias: {
			$components: './src/components',
			$helpers: './src/helpers',
			$models: './src/models',
			$routes: './src/routes'
		}
	}
};

export default config;

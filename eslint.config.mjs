import eslint from '@eslint/js';
import eslintPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintSvelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import eslintTs from 'typescript-eslint';

export default eslintTs.config(
	eslint.configs.recommended,
	...eslintTs.configs.recommended,
	...eslintSvelte.configs['flat/recommended'],
	eslintPrettierRecommended,
	// Svelte file support
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			globals: globals.browser,
			parserOptions: {
				parser: eslintTs.parser
			}
		},
		rules: {
			'@typescript-eslint/no-unused-expressions': 'off'
		}
	},
	// General rules
	{
		rules: {
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			]
		}
	},
	{
		ignores: [
			'.svelte-kit',
			'build',
			'cssAsPlugin.js',
			'eslint.config.mjs',
			'svelte.config.js',
			'tailwind.config.js',
			'coverage/**/*'
		]
	}
);

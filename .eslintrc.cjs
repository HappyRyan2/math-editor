module.exports = {
	"env": {
		"node": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
	],
	"parserOptions": {
		"ecmaVersion": 12,
		"sourceType": "module",
		"parser": "@typescript-eslint/parser",
	},
	"rules": {
		"quotes": ["error", "double"],
		"semi": ["error", "always"],
		"indent": ["error", "tab"],
		"no-multi-spaces": ["error"],
		"comma-dangle": ["error", "always-multiline"],
		"no-mixed-spaces-and-tabs": ["error"],
		"prefer-template": ["error"],
		"template-curly-spacing": ["error", "never"],
		"func-style": ["error", "expression"],
	},
	"plugins": [
		"@typescript-eslint",
	],
};

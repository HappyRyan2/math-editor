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
		"@typescript-eslint/no-var-requires": 0,
		"no-trailing-spaces": ["error"],
		"no-console": ["error"],
	},
	"plugins": [
		"@typescript-eslint",
	],
};

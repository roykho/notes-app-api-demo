import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error'
        }
    },
    {
        files: ['**/*.test.js', '**/test/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly'
            }
        }
    }
];
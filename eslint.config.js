import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended', 'plugin:prettier/recommended'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      // Biến & khai báo
      'no-unused-vars': 'error', // Bắt lỗi biến không dùng
      'prefer-const': 'error', // Bắt buộc dùng const nếu có thể
      'no-var': 'error', // Không cho phép var
      'object-shorthand': 'error', // Bắt buộc dùng object shorthand

      // So sánh & logic
      'eqeqeq': 'error', // Bắt buộc so sánh nghiêm ngặt
      'curly': 'error', // Bắt buộc dùng ngoặc nhọn

      // Arrow function & callback
      'arrow-body-style': ['error', 'as-needed'], // Bắt buộc style arrow body
      'prefer-arrow-callback': 'error', // Bắt buộc dùng arrow callback
      'arrow-parens': ['error', 'as-needed'], // Bắt buộc có ngoặc arrow

      // Style & dấu câu
      'quotes': ['error', 'single'], // Bắt buộc dùng nháy đơn
      'semi': ['error', 'always'], // Bắt buộc có dấu chấm phẩy
      'comma-dangle': ['error', 'never'], // Không cho phép dấu phẩy cuối

      // Độ dài dòng & thụt lề
      'max-len': ['warn', { 'code': 100 }], // Cảnh báo nếu quá dài
      'indent': ['error', 2, { 'SwitchCase': 1 }], // Cảnh báo nếu sai thụt lề

      // Khác
      'no-console': 'warn' // Cảnh báo log, không chặn build
    }
  },
  {
    ...tseslint.configs.recommended,
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/no-misused-promises': 'error'
    }
  }
]);

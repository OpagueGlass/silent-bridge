// eslint.config.js

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Add the functions directory to the list of ignored paths
    ignores: [
      'dist/*', 
      'supabase/functions/*'
    ],
  },
]);

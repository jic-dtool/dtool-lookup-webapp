const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  // Disable ESLint during development/build to avoid eslint 9.x incompatibility
  // with @vue/cli-plugin-eslint (which passes deprecated 'extensions' option)
  lintOnSave: false
});

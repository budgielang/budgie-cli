const baseConfig = require("../eslintrc");

baseConfig.parserOptions.project = "test/tsconfig.json";

module.exports = baseConfig;

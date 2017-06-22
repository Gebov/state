require("reflect-metadata");

var context = require.context("./src/", true, /\.spec\.ts/);
context.keys().map(context);

const webpackConfig = require("./webpack.config.js");

var karmaConfig = {

    basePath: "",

    frameworks: ["jasmine"],

    port: 3333,

    colors: true,

    autoWatch: true,

    plugins: [
        "karma-jasmine",
        "karma-webpack",
        "karma-chrome-launcher"
    ],

    customLaunchers: {
        ChromeHeadless: {
            base: 'Chrome',
            flags: [
                '--headless',
                '--disable-gpu',
                // Without a remote debugging port, Google Chrome exits immediately.
                '--remote-debugging-port=9222',
            ]
        }
    },

    browsers: ["ChromeHeadless"],

    concurrency: Infinity,

    singleRun: true,

    // Coverage reporter generates the coverage
    reporters: ["progress"],

    coverageReporter: {
        dir: "coverage/",
        reporters: [
            {
                type: "html",
                subdir: "report-html"
            },
            {
                type: "json",
                subdir: "./",
                file: "coverage.json"
            },
            {
                type: "text-summary"
            }
        ]
    },

    webpackServer: {
        noInfo: true,
        stats: "normal"
    },

    mime: {
        'text/x-typescript': ['ts','tsx']
    },
}

module.exports = function(config) {
    karmaConfig.logLevel = config.LOG_INFO;

    if (config.debug) {
        karmaConfig.browsers = ["Chrome"];
        karmaConfig.singleRun = false;
        karmaConfig.browserNoActivityTimeout = Number.MAX_SAFE_INTEGER;
    }

    karmaConfig.webpack = {
        resolve: webpackConfig.resolve,
        module: webpackConfig.module
    };

    const karmaFiles = "./karma-files.js";
    karmaConfig.files = [karmaFiles];
    karmaConfig.preprocessors = {};
    karmaConfig.preprocessors[karmaFiles] = ["webpack"];

    config.set(karmaConfig);
};

var karmaConfig = {

    basePath: "",

    frameworks: ["jasmine"],

    port: 3333,

    colors: true,

    autoWatch: true,

    // Karma plugins loaded
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

    // browserConsoleLogOptions: {
    //     level: 'log',
    //     terminal: true
    // },

    concurrency: Infinity,

    singleRun: true,

    // Coverage reporter generates the coverage
    reporters: ["progress"],

    files: [
        "src/**/*.spec.ts"
    ],

    preprocessors: {
        "src/**/*.spec.ts": ["webpack"]
    },

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
        ],
        instrumenterOptions: {
            istanbul: {
                noCompact: true
            }
        }
    },

    webpack: {
        resolve: {
            extensions: ['.ts', '.js']
        },

        module: {
            loaders: [
                {
                    test: /\.ts?$/,
                    loader: 'awesome-typescript-loader'
                }
            ]
        },
        externals: {
            "@angular/core": {
                commonjs: "@angular/core",
                commonjs2: "@angular/core"
            },
            "rxjs": {
                commonjs: "rxjs",
                commonjs2: "rxjs"
            },
            "tslib": {
                commonjs: "tslib",
                commonjs2: "tslib"
            }
        }
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
    config.set(karmaConfig);
};

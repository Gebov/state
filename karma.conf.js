var config = {

    frameworks: ["jasmine"],

    port: 9876,

    logLevel: null,

    colors: true,

    autoWatch: true,

    browsers: ["ChromeHeadless"],

    // Karma plugins loaded
    plugins: [
        "karma-jasmine",
        "karma-coverage",
        "karma-electron",
        "karma-mocha-reporter"
    ],

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
    }
}

module.exports = function() { return config; };

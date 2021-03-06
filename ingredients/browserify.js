var utilities = require('./commands/Utilities');
var source = require('vinyl-source-stream');
var parsePath = require('parse-filepath');
var browserify = require('browserify');
var elixir = require('laravel-elixir');
var reactify = require('reactify');
var babelify = require('babelify');
var gulpif = require('gulp-if');
var gulp = require('gulp');


/**
 * Calculate the correct destination.
 *
 * @param string output
 */
var getDestination = function(output) {
    output = parsePath(output);

    var saveDir = output.extname
        ? output.dirname
        : (output.dirname + '/' + output.basename);

    var saveFile = output.extname ? output.basename : 'bundle.js';

    return {
        saveFile: saveFile,
        saveDir: saveDir
    }
};

/**
 * Build the Gulp task.
 *
 * @param {array}  src
 * @param {string} output
 * @param {object} options
 */
var buildTask = function(src, output, options) {
    var destination = getDestination(output);

    options = options || {
        optional: ["es7.classProperties"]
    };

    gulp.task('browserify', function() {
        return browserify(src)
            .transform(babelify, options)
            .bundle()
            .pipe(source(destination.saveFile))
            .pipe(gulp.dest(destination.saveDir));
    });
};


/*
 |----------------------------------------------------------------
 | Browserify Task
 |----------------------------------------------------------------
 |
 | This task will manage your entire Browserify workflow, from
 | scratch! Also, it will channel all files through Babelify
 | so that you may use all the ES6 goodness you can stand.
 |
 */

elixir.extend('browserify', function(src, output, baseDir, options) {
    baseDir = baseDir || 'resources/js';
    src = utilities.buildGulpSrc(src, './' + baseDir, '/**/*.jsx');
    output = output || this.jsOutput;

    utilities.logTask('Running Browserify', src);

    buildTask(src, output, options);

    this.registerWatcher('browserify', baseDir + '/**/*.+(js|jsx|babel)');

    return this.queueTask('browserify');
});

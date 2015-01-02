// Gulp dependencies
var gulp        = require('gulp'),
    plugins     = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    del         = require('del');

var reload      = browserSync.reload;


// Clean: Empty the build directory before a complete build.
gulp.task('clean', del.bind(null, [
  'build/**/*',
  '!build'
]));


// Core: Build waax.js into build/ path.
gulp.task('core', function () {
  return gulp.src([
    'src/waax.js',
    'src/waax.extension.js',
    'src/waax.util.js',
    'src/waax.core.js',
    'src/waax.timebase.js',
    'src/mui.js',
    'src/plug_ins/Fader/fader.js'
  ])
    .pipe(plugins.uglify({ mangle: false }))
    .pipe(plugins.concat('waax.js'))
    .pipe(gulp.dest('build'))
    .pipe(plugins.size({ title: 'core' }));
});


// Plugins: Build plug-in JS files into build/plug_ins/ path.
gulp.task('plugins', function () {
  return gulp.src([
    'src/plug_ins/**/*.js',
    '!src/plug_ins/Fader/fader.js'
  ])
    .pipe(plugins.uglify({ mangle: false }))
    .pipe(plugins.flatten())
    .pipe(gulp.dest('build/plug_ins'))
    .pipe(plugins.size({ title: 'plugins' }));
});


// MUI: Build MUI elements into build/mui/ path.
gulp.task('mui', function () {
  return gulp.src([
    'src/mui/**/*',
    '!src/mui/**/index.html',
  ])
    .pipe(gulp.dest('build/mui'))
    .pipe(plugins.size({ title: 'mui' }));
})


// Serve: Start a dev server at 127.0.0.1:3000.
gulp.task('serve', function () {
  browserSync({
    notify: false,
    server: {
      baseDir: './'
    },
    // browser: 'google chrome'
    browser: 'google chrome canary'
  });

  gulp.watch(['src/*.js', '!src/ktrl.js'], ['core', reload]);
  gulp.watch(['src/plug_ins/**/*.js'], ['plugins', reload]);
  gulp.watch(['src/mui/**/*.html'], ['mui', reload]);
  gulp.watch(['examples/**/*'], reload);
  gulp.watch(['test/**/*.html', 'test/**/*.js'], reload);
});


// Build: Clean and build everything in build/ path.
gulp.task('build', function (cb) {
  runSequence('clean', ['core', 'plugins', 'mui'], cb);
});


// Default: Build and serve.
gulp.task('default', function (cb) {
  runSequence('build', 'serve', cb);
});
/**
 * WAAX project gulp task file (1.0.0-alpha3)
 *
 * gulp                    # build everything and serve at 127.0.0.1:3000
 * gulp clean              # cleans dist, build path
 * gulp core               # minifies and concats core JS files to build/
 * gulp plugins            # minifies plug-in JS files to build/plug_ins
 * gulp mui                # copies MUI elements files to build/
 * gulp serve              # starts dev server 127.0.0.1:3000 and opens Chrome
 * gulp build              # build and minify core, plug-ins
 */

var gulp        = require('gulp'),
    plugins     = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    del         = require('del');

var reload      = browserSync.reload;


var WX_ALL = [
  // core
  'src/waax.js',
  'src/waax.extension.js',
  'src/waax.util.js',
  'src/waax.core.js',
  'src/waax.timebase.js',
  // plug_ins
  'src/plug_ins/**/*.js'
];


// Clean: Empty the build directory before a complete build.
gulp.task('clean', del.bind(null, [
  'build/**/*',
  '!build'
]));


// Core: Build waax.js into build/ path.
gulp.task('core', function () {
  return gulp.src(WX_ALL)
    .pipe(plugins.uglify({ mangle: false }))
    .pipe(plugins.concat('waax.min.js'))
    .pipe(gulp.dest('build'))
    .pipe(plugins.size({ title: 'core' }));
});


// Plugins: Build plug-in JS files into build/plug_ins/ path.
// gulp.task('plugins', function () {
//   return gulp.src([
//     'src/plug_ins/**/*.js',
//     '!src/plug_ins/Fader/fader.js'
//   ])
//     .pipe(plugins.uglify({ mangle: false }))
//     .pipe(plugins.flatten())
//     .pipe(gulp.dest('build/plug_ins'))
//     .pipe(plugins.size({ title: 'plugins' }));
// });


// MUI: Build MUI elements into build/mui/ path.
gulp.task('mui', function () {
  return gulp.src([
    'src/mui/**/*',
    '!src/mui/bower.json'
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
    browser: 'google chrome'
    // browser: 'google chrome canary'
  });

  gulp.watch(['src/*.js', '!src/ktrl.js'], ['core', reload]);
  gulp.watch(['src/plug_ins/**/*.js'], ['plugins', reload]);
  gulp.watch(['src/mui/**/*.html'], ['mui', reload]);
  gulp.watch(['examples/**/*'], reload);
  gulp.watch(['test/**/*.html', 'test/**/*.js'], reload);
});


// Build: Clean and build everything in build/ path.
gulp.task('build', function (cb) {
  runSequence('clean', ['core', 'mui'], cb);
});


// Default: Build and serve.
gulp.task('default', function (cb) {
  runSequence('build', 'serve', cb);
});
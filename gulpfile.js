/**
 * WAAX 1.0.0-alpha
 *
 * gulp clean           # cleans dist, build path
 * gulp serve           # starts dev server 127.0.0.1:3000 and opens Canary
 * gulp scripts:core    # minifies and concats WAAX core JS files to build
 * gulp scripts:plugins # minifies plug-in JS files to build/plug-ins
 * gulp scripts:ktrl    # minifies ktrl library
 * gulp build           # all above
 * gulp deploy          # build and deploy to gh-pages
 * gulp                 # cleans, builds and starts dev server
 */

var gulp        = require('gulp'),
    plugins     = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    del         = require('del');

var deploy      = require('gulp-gh-pages');

var reload      = browserSync.reload;

// clean
gulp.task('clean', del.bind(null, [
  'dist/**/*',
  'build/**/*',
  '!dist',
  '!build'
]));

// copy: copy files to dist/
gulp.task('copy', function () {
  return gulp.src([
    'bower_components/**/*',
    'build/**/*',
    'docs/**/*',
    'examples/**/*',
    'mui/**/*',
    'sound/**/*',
    'test/**/*',
    'index.html'
  ], {
    base: '.'
  })
    .pipe(gulp.dest('dist'))
    .pipe(plugins.size({ title: 'copy' }));
});

// scripts:core
gulp.task('scripts:core', function () {
  return gulp.src([
    'src/waax.header.js',
    'src/waax.util.js',
    'src/waax.core.js',
    'src/waax.timebase.js',
    'src/mui.js',
    'src/timebase.js',
    'src/plug_ins/Fader/fader.js'
  ])
    .pipe(plugins.uglify({ mangle: false }))
    .pipe(plugins.concat('waax.js'))
    .pipe(gulp.dest('build'))
    .pipe(plugins.size({ title: 'scripts:core' }));
});

// scripts:plugins
gulp.task('scripts:plugins', function () {
  return gulp.src([
    'src/plug_ins/**/*.js',
    '!src/plug_ins/Fader/fader.js'
  ])
    .pipe(plugins.uglify({ mangle: false }))
    .pipe(plugins.flatten())
    .pipe(gulp.dest('build/plug_ins'))
    .pipe(plugins.size({ title: 'scripts:plugins' }));
});

// scripts:ktrl
gulp.task('scripts:ktrl', function () {
  return gulp.src(['src/ktrl.js'])
    .pipe(plugins.uglify({ mangle: false }))
    .pipe(gulp.dest('build'))
    .pipe(plugins.size({ title: 'scripts:ktrl' }));
});

// serve
gulp.task('serve', function () {
  browserSync({
    notify: false,
    server: {
      baseDir: './'
    },
    browser: 'google chrome canary'
    // browser: 'google chrome'
  });

  gulp.watch(['index.html', 'mui/**/*.html'], reload);
  gulp.watch(['examples/**/*.html', 'examples/**/*.js'], reload);
  gulp.watch(['src/*.js', '!src/ktrl.js'], ['scripts:core', reload]);
  gulp.watch(['src/ktrl.js'], ['scripts:ktrl', reload]);
  gulp.watch(['src/plug_ins/**/*.js'], ['scripts:plugins', reload]);
});

// build
gulp.task('build', function (cb) {
  runSequence('clean',
    ['scripts:core', 'scripts:plugins', 'scripts:ktrl'],
    'copy',
    cb);
});

// deploy
gulp.task('deploy', ['build'], function () {
  return gulp.src('dist/**/*')
    .pipe(deploy());
});

// default
gulp.task('default', function (cb) {
  runSequence('build', 'serve', cb);
});
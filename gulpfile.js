/**
 *  WAAX 1.0.0-alpha
 *  Gulf task runner
 */

var gulp        = require('gulp'),
    plugins     = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    del         = require('del');

var deploy      = require('gulp-gh-pages');

var reload      = browserSync.reload;


// clean: clean up dist or build path
gulp.task('clean', del.bind(null, [
  'gulpdist/**/*', 'gulpbuild/**/*', '!gulpdist', '!gulpbuild'
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
    .pipe(gulp.dest('gulpdist'))
    .pipe(plugins.size({ title: 'copy' }));
});

// scripts:core - core library minification
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
    .pipe(plugins.uglify())
    .pipe(plugins.concat('waax.js'))
    .pipe(gulp.dest('gulpbuild'))
    .pipe(plugins.size({ title: 'scripts:core' }));
});

// scripts:ktrl - ktlr library minification
gulp.task('scripts:ktrl', function () {
  return gulp.src(['src/ktrl.js'])
    .pipe(plugins.uglify())
    .pipe(gulp.dest('gulpbuild'))
    .pipe(plugins.size({ title: 'scripts:ktrl' }));
});

// scripts:plugins - plug-in minification
gulp.task('scripts:plugins', function () {
  return gulp.src([
    'src/plug_ins/**/*.js',
    '!src/plug_ins/Fader/fader.js'
  ])
    .pipe(plugins.uglify())
    .pipe(plugins.flatten())
    .pipe(gulp.dest('gulpbuild/plug_ins'))
    .pipe(plugins.size({ title: 'scripts:plugins' }));
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

  gulp.watch([
    'index.html',
    'examples/**/*.html',
    'mui/**/*.html'
  ], reload);
  gulp.watch(['src/*.js'], ['scripts:core', reload]);
  gulp.watch(['src/plug-ins/**/*.js'], ['scripts:plugins', reload]);
});

// build & export dist
gulp.task('build', function (cb) {
  runSequence('clean', [
    'scripts:core',
    'scripts:plugins',
    'copy'
  ], cb);
});

// deploy
gulp.task('deploy', ['build'], function () {
  return gulp.src('gulpdist/**/*')
    .pipe(deploy());
});

// default
gulp.task('default', function (cb) {
  runSequence('clean', [
    'scripts:core',
    'scripts:plugins',
    'serve'
  ], cb);
});
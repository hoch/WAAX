/**
 * WAAX 1.0.0-alpha2
 *
 * gulp                 # cleans, builds and starts dev server
 * gulp clean           # cleans dist, build path
 * gulp serve           # starts dev server 127.0.0.1:3000 and opens Canary
 * gulp scripts:core    # minifies and concats WAAX core JS files to build
 * gulp scripts:plugins # minifies plug-in JS files to build/plug-ins
 * gulp build           # all above
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
    'snd/**/*',
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

// mui
gulp.task('mui', function () {
  return gulp.src([
    'src/mui/**/*',
    '!src/mui/**/index.html',
  ])
    .pipe(gulp.dest('build/mui'))
    .pipe(plugins.size({ title: 'mui' }));
})

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
  gulp.watch(['src/plug_ins/**/*.js'], ['scripts:plugins', reload]);
  gulp.watch(['test/**/*.html', 'test/**/*.js'], reload);
});

// build
gulp.task('build', function (cb) {
  runSequence('clean',
    ['scripts:core', 'scripts:plugins', 'mui'],
    'copy',
    cb);
});

// default
gulp.task('default', function (cb) {
  runSequence('build', 'serve', cb);
});

// Only for Hoch: deploy
gulp.task('deploy', ['build'], function () {
  return gulp.src('dist/**/*')
    .pipe(deploy());
});
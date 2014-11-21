var gulp        = require('gulp'),
    plugins     = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    del         = require('del');

var reload      = browserSync.reload;


gulp.task('clean', del.bind(null, [
  'build/**/*',
  '!build'
]));


gulp.task('core', function () {
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
    .pipe(plugins.size({ title: 'core' }));
});


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


gulp.task('mui', function () {
  return gulp.src([
    'src/mui/**/*',
    '!src/mui/**/index.html',
  ])
    .pipe(gulp.dest('build/mui'))
    .pipe(plugins.size({ title: 'mui' }));
})


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


gulp.task('build', function (cb) {
  runSequence('clean', ['core', 'plugins', 'mui'], cb);
});


gulp.task('default', function (cb) {
  runSequence('build', 'serve', cb);
});
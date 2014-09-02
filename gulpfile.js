var gulp        = require('gulp');
var browserSync = require('browser-sync');

// server
gulp.task('proto', function () {
  browserSync({
    notify: false,
    server: {
      baseDir: './'
    },
    browser: 'google chrome canary'
  });
  gulp.watch(['examples/**/*'], browserSync.reload);
});
var gulp = require("gulp");
var jshint = require("gulp-jshint");

gulp.task("lint", function () {
    gulp.src([
        "index.js",
        "gulpfile.js",
        "test/**/*.js"
    ])
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("default"))
        .pipe(jshint.reporter("fail"));
});
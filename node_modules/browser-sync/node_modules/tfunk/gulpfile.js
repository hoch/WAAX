var gulp   = require("gulp");
var jshint = require("gulp-jshint");

var src = {
    js: ["index.js", "gulpfile.js", "test/*.js"]
};

gulp.task("lint-ci", function () {
    return gulp.src(src.js)
        .pipe(jshint("test/.jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(jshint.reporter("fail"));
});

gulp.task("lint-dev", function () {
    return gulp.src(src.js)
        .pipe(jshint("test/.jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"));
});

gulp.task("watch", ["lint-dev"], function () {
    gulp.watch(src.js, ["lint-dev"]);
});
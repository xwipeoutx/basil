var gulp = require('gulp');
var ts = require('gulp-typescript');

var tsProject = ts.createProject({
    "target": "ES5",
    "module": "commonjs"
});

gulp.task('scripts', function () {
    var tsResult = gulp.src('src/**/*.ts')
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], function() {
    gulp.watch('src/**/*.ts', ['scripts']);
});
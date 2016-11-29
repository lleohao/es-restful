var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

var paths = ['./src/*.ts']

gulp.task('build', function () {
    return gulp.src(paths)
        .pipe(tsProject())
        .pipe(gulp.dest('./lib'))
})

gulp.task('default', ['build'])
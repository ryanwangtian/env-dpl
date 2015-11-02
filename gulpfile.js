var gulp = require('gulp'),
	$ = require('gulp-load-plugins')()
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	supportedBrowsers = ['ie >= 8', 'last 2 Chrome versions', 'Firefox >= 20'];

gulp.task('clean:dev', function() {
	return gulp.src('.tmp')
		.pipe($.clean({force: true}));
});


// gulp.task('copy', ['clean:dev'], function() {
// 	return gulp.src('./src/**/*.js')
//         .pipe(gulp.dest('.tmp'));
// });

gulp.task('sass:dev', function () {
  return gulp.src(['./src/**/*.scss', '!./src/common/**/*.scss'])
    .pipe($.sass({outputStyle: 'expanded'}).on('error', $.sass.logError))
    .pipe($.autoprefixer({
    	browsers: supportedBrowsers
    }))
    .pipe(gulp.dest('./.tmp'))
    .pipe(reload({stream: true}));
});

gulp.task('js:dev', function () {
	return gulp.src(['./src/**/*.js'])
		.pipe(gulp.dest('.tmp'))
		.pipe(reload({stream: true}));
});


gulp.task('serve', ['js:dev', 'sass:dev'], function() {
	browserSync({
        server: {
            baseDir: ['demos', '.tmp'],
            directory: true
        }
    });

    gulp.watch("./src/**/*.scss", ['sass:dev']);
    gulp.watch("./src/**/*.js", ['js:dev']);
    gulp.watch("./demos/*.html", reload);
});


gulp.task('clean:dist', function() {
    return gulp.src('./dist')
        .pipe($.clean({force: true}));
});
gulp.task('js:dist', function () {
    return gulp.src(['./src/**/*.js'])
        .pipe(gulp.dest('./dist'))
        .pipe($.uglify())
        .pipe($.rename({
                suffix: '.min'
            }))
        .pipe(gulp.dest('./dist'));
});
gulp.task('sass:dist', function () {
  return gulp.src(['./src/**/*.scss', '!./src/common/**/*.scss'])
    .pipe($.sass({outputStyle: 'expanded'}).on('error', $.sass.logError))
    .pipe($.autoprefixer({
    	browsers: supportedBrowsers
    }))
    .pipe(gulp.dest('./dist'))
    .pipe($.minifyCss())
    .pipe($.rename({
            suffix: '.min'
        }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', function() {
    $.runSequence('clean:dist', ['js:dist', 'sass:dist']);
});
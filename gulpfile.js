'use strict';
const config = require('./config');

const gulp = require('gulp'),
      clean = require('gulp-clean'),    
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify-es').default,
      replace = require('gulp-string-replace'),
      cleanCss = require('gulp-clean-css'),
      babel = require("gulp-babel");


//clean build directory
gulp.task('clean', function() {
	return gulp.src('public/min/*', {read: false})
		.pipe(clean());
});

gulp.task('js', function() {
    return gulp.src(['public/comments/comments.js', 'public/kudos/kudos.js'])
        .pipe(replace(/kucosServerUrl = "(.*)"/g, 'kucosServerUrl = "'+config.kucosServerUrl+'"'))
        .pipe(replace(/type="text\/css" href="\/min\/(.*)"/g, 'type="text/css" href="'+config.kucosServerUrl+'/min/kucos.min.css"'))
        .pipe(babel())
        .pipe(uglify())
        .pipe(replace(/_defineProperty/g, '_f'))
        .pipe(replace('  ', ''))
        .pipe(concat('kucos.min.js'))
        .pipe(gulp.dest('public/min'))
});

gulp.task('copy-assets', function() {
    return gulp.src(['public/kudos/heart_60x60.png'])
      .pipe(gulp.dest('public/min'));
});

gulp.task('copy', function () {
    return gulp.src('public/assets/**/*')
      .pipe(gulp.dest('public/min/assets'));
});

//minify styles
gulp.task('css', function() {
     return gulp.src(['public/comments/comments.css', 'public/kudos/kudos.css', 'node_modules/highlight.js/styles/github.css'])
        /*.pipe(minifycss({root: 'src/css', keepSpecialComments: 0}))*/
        .pipe(replace(/background-image: url\(\/kudos\/heart_60x60\.png\);/g, 'background-image: url('+config.kucosServerUrl+'/min/heart_60x60.png);'))
        .pipe(replace(/${config.kucosServerUrl}/g, config.kucosServerUrl))
        .pipe(cleanCss({compatibility: "ie8", level: 2}))
        .pipe(concat('kucos.min.css'))
        .pipe(gulp.dest('public/min'));
});

gulp.task('default', gulp.series('clean', 'css', 'js', 'copy-assets', 'copy'));
const gulp = require('gulp')
const connect = require('gulp-connect')
const plumber = require('gulp-plumber')
const stylus = require('gulp-stylus')
const data = require('gulp-data')
const yaml = require('js-yaml')
const nib = require('nib')
const rupture = require('rupture')
const koutoSwiss = require('kouto-swiss')
const pug = require('gulp-pug')
const fs = require('fs')

let dataJson = {}
let files = []

const paths = {
  html: './src/pug/**/*',
  css: './src/stylus/**/*',
  js: './docs/assets/js/**/*',
  data: './src/data/'
}

gulp.task('read:data', () => {
  fs.readdir(paths.data, (err, items) => {
    for (var i = 0; i < items.length; i++) {
      files.push(items[i].split('.')[0])
    }
    for (var i = 0; i < files.length; i++) {
      dataJson[files[i]] = yaml.safeLoad(fs.readFileSync(`${paths.data}${files[i]}.yml`, 'utf-8'))
    }
  })
})

gulp.task('connect', () => {
  connect.server({
    host: '0.0.0.0',
    root: './docs',
    port: 2018,
    livereload: true
  })
})

gulp.task('stylus', () => {
  gulp.src('./src/stylus/*.styl')
    .pipe(plumber())
    .pipe(stylus({
      compress: false,
      use: [nib(), rupture(), koutoSwiss()],
      import: ['nib', 'kouto-swiss']
    }))
    .pipe(gulp.dest('./docs/assets/css'))
    .pipe(connect.reload())
})

gulp.task('pug', () => {
  gulp.src('./src/pug/*.pug')
    .pipe(plumber())
    .pipe(data(dataJson))
    .pipe(pug())
    .pipe(gulp.dest('./docs'))
    .pipe(connect.reload())
})

gulp.task('watch', () => {
  gulp.watch(paths.css, ['stylus'])
  gulp.watch([paths.html, paths.js, `${paths.data}*.yml`], ['read:data', 'pug'])
})

gulp.task('build', ['read:data', 'stylus', 'pug'])
gulp.task('server', ['build', 'connect', 'watch'])

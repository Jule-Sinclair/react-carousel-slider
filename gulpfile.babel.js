import gulp from 'gulp';
import del from 'del';
import sass from 'gulp-sass';
import gulpWebpack from 'webpack-stream';
import webpack from 'webpack';
import rename from 'gulp-rename';
import FileCache from 'gulp-file-cache';
import DevConfig from './webpack.config.js';

const styleCache = new FileCache();

const src_path = {
  js: 'src/js',
  css: 'src/sass',
};

const build_path = {
  js: 'build/js',
  css: 'build/css',
};

const devConfig = new DevConfig();

// javascripts -----------------------------------------------------------
gulp.task('js_clean',
  () => del.sync([build_path.js])
);

gulp.task('webpack:dev',
  () => gulp.src([`${src_path.js}/!**!/!*.js`, `${src_path.js}/!**!/!*.es6`, `${src_path.js}/!**!/!*.jsx`])
    .pipe(gulpWebpack(devConfig.reactConfig, webpack))
    .pipe(gulp.dest(build_path.js))
);


// css -------------------------------------------------------------------
gulp.task('css_clean', () => del.sync([build_path.css]));

gulp.task('sass', ['css_clean'],
  () => gulp.src([
    `${src_path.css}/**/*.scss`,
    `${src_path.css}/**/*.sass`
  ])
    .pipe(styleCache.filter())
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(build_path.css))
    .pipe(styleCache.cache())
);


// watch -----------------------------------------------------------------
gulp.task('style_watch', () => {
  gulp.watch([`${src_path.css}/**/*.scss`, `${src_path.css}/**/*.sass`], ['style_hash']);
});

gulp.task('watch', ['webpack:dev', 'style_watch']);

gulp.task('dev_build', ['style_hash', 'webpack:dev']);

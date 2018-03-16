var gulp = require('gulp'),
		sass = require('gulp-sass'),
		pug = require('gulp-pug'),
		jshint = require('gulp-jshint'),
		concat = require('gulp-concat'),
		browserSync = require('browser-sync').create(),
		plumber = require('gulp-plumber'),
		notify = require('gulp-notify'),
		imagemin = require('gulp-imagemin'),
		rename = require('gulp-rename'),
		minifyCss = require('gulp-cssnano'),
		uncss = require('gulp-uncss'),
		autoprefixer = require('gulp-autoprefixer'),
		uglify = require('gulp-uglify'),
		cssimport = require('gulp-cssimport'),
		beautify = require('gulp-beautify'),
		sourcemaps = require('gulp-sourcemaps'),
		critical = require('critical').stream;

// baseDirs: baseDirs for the project

var baseDirs = {
		dist:'dist/',
		src:'src/',
		assets: 'dist/assets/'
};

// routes: object that contains the paths

var routes = {
	styles: {
		scss: baseDirs.src+'styles/*.scss',
		_scss: baseDirs.src+'styles/_includes/*.scss',
		_modulesScss: baseDirs.src+'styles/_modules/*.scss',
		css: baseDirs.assets+'css/'
	},

	templates: {
		pug: baseDirs.src+'templates/**/*.pug',
		_pug: baseDirs.src+'templates/_includes/*.pug',
	},

	scripts: {
		base:baseDirs.src+'scripts/',
		js: baseDirs.src+'scripts/*.js',
		jsmin: baseDirs.assets+'js/'
	},

	vendors: {
		base:baseDirs.src+'vendor/',
		files: baseDirs.src+'vendor/**/*',
		dist: baseDirs.assets+'vendor/'
	},

	files: {
		html: 'dist/',
		images: baseDirs.src+'images/*',
		imgmin: baseDirs.assets+'files/images/',
		cssFiles: baseDirs.assets+'css/*.css',
		htmlFiles: baseDirs.dist+'*.html',
		styleCss: baseDirs.assets+'css/style.css'
	},

	deployDirs: {
		baseDir: baseDirs.dist,
		baseDirFiles: baseDirs.dist+'**/*',
		ftpUploadDir: 'FTP-DIRECTORY'
	}
};

// Compiling Tasks

// Templating

gulp.task('templates', function() {
	return gulp.src([routes.templates.pug, '!' + routes.templates._pug])
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Error: Compiling pug.",
				message:"<%= error.message %>"
			})
		}))
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(routes.files.html))
		.pipe(browserSync.stream())
		.pipe(notify({
			title: 'pug Compiled succesfully!',
			message: 'pug task completed.'
		}));
});

// SCSS

gulp.task('styles', function() {
	return gulp.src(routes.styles.scss)
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Error: Compiling SCSS.",
				message:"<%= error.message %>"
			})
		}))
		.pipe(sourcemaps.init())
			.pipe(sass({
				outputStyle: 'compressed'
			}))
			.pipe(autoprefixer('last 3 versions'))
		.pipe(sourcemaps.write())
		.pipe(cssimport({}))
		.pipe(rename('style.css'))
		.pipe(gulp.dest(routes.styles.css))
		.pipe(browserSync.stream())
		.pipe(notify({
			title: 'SCSS Compiled and Minified succesfully!',
			message: 'scss task completed.'
		}));
});

// Scripts (js) ES6 => ES5, minify and concat into a single file.

gulp.task('scripts', function() {
	return gulp.src(routes.scripts.js)
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Error: Babel and Concat failed.",
				message:"<%= error.message %>"
			})
		}))
		.pipe(sourcemaps.init())
		.pipe(concat('script.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(routes.scripts.jsmin))
		.pipe(browserSync.stream())
		.pipe(notify({
			title: 'JavaScript Minified and Concatenated!',
			message: 'your js files has been minified and concatenated.'
		}));
});

// Vendor (js) ES6 => ES5, minify and concat into a single file.

gulp.task('vendor', function() {
	gulp.src(routes.vendors.files)
		.pipe(gulp.dest(routes.vendors.dist));
});

// Lint, lint the JavaScript files

gulp.task('lint', function() {
	return gulp.src(routes.scripts.js)
		.pipe(jshint({
			lookup: true,
			linter: 'jshint',
		}))
		.pipe(jshint.reporter('default'));
});

// Image compressing task

gulp.task('images', function() {
	gulp.src(routes.files.images)
		.pipe(imagemin())
		.pipe(gulp.dest(routes.files.imgmin));
});

// Preproduction beautifiying task (SCSS, JS)

gulp.task('beautify', function() {
	gulp.src(routes.scripts.js)
		.pipe(beautify({
			indentSize: 2,
			indent_with_tabs: true
		}))
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Error: Beautify failed.",
				message:"<%= error.message %>"
			})
		}))
		.pipe(gulp.dest(routes.scripts.base))
		.pipe(notify({
			title: 'JS Beautified!',
			message: 'beautify task completed.'
		}));
});

// Serving (browserSync) and watching for changes in files

gulp.task('serve', function() {
	browserSync.init({
		server: './dist/'
	});

	gulp.watch([routes.styles.scss, routes.styles._scss, routes.styles._modulesScss], ['styles']);
	gulp.watch([routes.templates.pug, routes.templates._pug], ['templates']);
	gulp.watch(routes.files.images, ['images']);
	gulp.watch(routes.vendors.files, ['vendor']);
	gulp.watch(routes.scripts.js, ['scripts', 'beautify']);
});

// Optimize your project

gulp.task('uncss', function() {
	return gulp.src(routes.files.cssFiles)
		.pipe(uncss({
			html:[routes.files.htmlFiles],
			ignore:['*:*']
		}))
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Error: UnCSS failed.",
				message:"<%= error.message %>"
			})
		}))
		.pipe(minifyCss())
		.pipe(gulp.dest(routes.styles.css))
		.pipe(notify({
			title: 'Project Optimized!',
			message: 'UnCSS completed!'
		}));
});

// Extract CSS critical-path

gulp.task('critical', function () {
	return gulp.src(routes.files.htmlFiles)
		.pipe(critical({
			base: baseDirs.dist,
			inline: true,
			html: routes.files.htmlFiles,
			css: routes.files.styleCss,
			ignore: ['@font-face',/url\(/],
			width: 1300,
			height: 900
		}))
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "Error: Critical failed.",
				message:"<%= error.message %>"
			})
		}))
		.pipe(gulp.dest(baseDirs.dist))
		.pipe(notify({
			title: 'Critical Path completed!',
			message: 'css critical path done!'
		}));
});

gulp.task('dev', ['templates', 'styles', 'vendor', 'scripts',  'images', 'serve']);

gulp.task('build', ['templates', 'styles', 'vendor', 'scripts', 'images']);

gulp.task('optimize', ['uncss', 'critical', 'images']);

gulp.task('deploy', ['optimize',  ]);

gulp.task('default', function() {
	gulp.start('dev');
});

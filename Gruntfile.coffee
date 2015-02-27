module.exports = (grunt) ->

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-qunit'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-sass'

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON 'smallipop.jquery.json'
    meta:
      banner: '/*!\n' +
        'jQuery <%= pkg.name %> plugin\n' +
        '@name jquery.<%= pkg.name %>.js\n' +
        '@author Sebastian Helzle (sebastian@helzle.net or @sebobo)\n' +
        '@version <%= pkg.version %>\n' +
        '@date <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '@category jQuery plugin\n' +
        '@copyright (c) 2011-2015 Small Improvements (http://www.small-improvements.com)\n' +
        '@license Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.\n' +
        '*/\n'
    qunit:
      files: ['tests/**/*.html']
    growl:
      coffee:
        title: 'grunt'
        message: 'Compiled coffeescript'
      sass:
        title: 'grunt'
        message: 'Compiled sass'
    coffee:
      compile:
        options:
          bare: true
        files:
          'lib/jquery.smallipop.js': ['src/coffee/jquery.smallipop.coffee']
          'lib/main.js': ['src/coffee/main.coffee']
          'tests/tests.js': ['src/coffee/tests.coffee']
    watch:
      coffee:
        files: 'src/coffee/**/*.coffee',
        tasks: ['coffee:compile']#, 'growl:coffee']
      sass:
        files: 'src/scss/**/*.scss'
        tasks: ['sass:compile']#, 'growl:sass']
    sass:
      compile:
        options:
          style: 'expanded'
          compass: true
        files:
          'css/screen.css': 'src/scss/screen.scss'
          'css/jquery.smallipop.css': 'src/scss/jquery.<%= pkg.name %>.scss'
      dist:
        options:
          style: 'compressed'
          compass: true
        files:
          'css/jquery.smallipop.min.css': 'src/scss/jquery.<%= pkg.name %>.scss'
    uglify:
      dist:
        options:
          banner: '<%= meta.banner %>'
        files:
          'lib/jquery.smallipop.min.js': ['lib/jquery.<%= pkg.name %>.js']

  # Default task which watches, sass and coffee.
  grunt.registerTask 'default', ['coffee', 'sass', 'watch']
  # Minify task
  grunt.registerTask 'minify', ['uglify', 'sass:dist']
  # Release task to run tests then minify js and css
  grunt.registerTask 'release', ['qunit', 'minify']

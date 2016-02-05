module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'client/**/*.js', '!client/test/*.js', '!client/lib/**/*.*', '!client/min/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    
    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      my_target: {
        files: {
          './client/min/auth.annotated.js': ['./client/auth/auth.js'],
        }
      },
    },
    
    uglify: {
      my_target: {
        files: {
          './client/min-uglify/auth.annotated.js': ['./client/min/auth.annotated.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint']);

};

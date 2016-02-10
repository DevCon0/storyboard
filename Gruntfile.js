module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'client/**/*.js', '!client/test/*.js', '!client/lib/**/*.*', '!client/min/**/*.js'],
      options: {
        force: true,
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
          './client/min/app.annotated.js': ['./client/app.js'],
          './client/min/auth.annotated.js': ['./client/auth/auth.js'],
          './client/min/pageInfo.annotated.js': ['./client/services/pageInfo.js'],
          './client/min/createStory.annotated.js': ['./client/createStory/createStory.js'],
          './client/min/createStoryURL.annotated.js': ['./client/createStory/onUrlErrorDirective.js'],
          './client/min/library.annotated.js': ['./client/library/library.js'],
          './client/min/navBar.annotated.js': ['./client/navBar/navBar.js'],
          './client/min/authServices.annotated.js': ['./client/services/authServices.js'],
          './client/min/imagePlayer.annotated.js': ['./client/services/imagePlayer.js'],
          './client/min/player.annotated.js': ['./client/services/player.js'],
          './client/min/storyStateMachine.annotated.js': ['./client/services/storyStateMachine.js'],
          './client/min/storyStorage.annotated.js': ['./client/services/storyStorage.js'],
          './client/min/textToSpeechPlayer.annotated.js': ['./client/services/textToSpeechPlayer.js'],
          './client/min/videoPlayer.annotated.js': ['./client/services/videoPlayer.js'],
          './client/min/singleStory.annotated.js': ['./client/singleStory/singleStory.js'],
          './client/min/splash.annotated.js': ['./client/splash/splash.js'],
          './client/min/errorPage.annotated.js': ['./client/errorPage/errorPage.js'],
        }
      },
    },

    uglify: {
      my_target: {
        files: {
          './client/min-uglify/alljs.js': ['./client/min/alljs.js']
        }
      }
    },

    concat: {
      options: {
        seperator: ';',
      },
      dist: {
        src: ['./client/min/pageInfo.annotated.js', './client/min/authServices.annotated.js', './client/min/imagePlayer.annotated.js', './client/min/player.annotated.js', './client/min/storyStateMachine.annotated.js', './client/min/storyStorage.annotated.js', './client/min/textToSpeechPlayer.annotated.js', './client/min/textToSpeechPlayer.annotated.js', './client/min/videoPlayer.annotated.js', './client/min/auth.annotated.js', './client/min/navBar.annotated.js', './client/min/splash.annotated.js', './client/min/createStoryURL.annotated.js', './client/min/createStory.annotated.js', './client/min/library.annotated.js', './client/min/singleStory.annotated.js', './client/min/errorPage.annotated.js', './client/min/app.annotated.js'],
        dest: './client/min/alljs.js',
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('buildProductionCode', ['ngAnnotate','concat','uglify']);

};

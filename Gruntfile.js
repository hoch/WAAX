module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          base: '.'
        },
      }
    },

    watch: {
      options: {
        livereload: true,
      },
      core: {
        files: [
          './waax.js',
          './test/**'
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dev', ['connect', 'watch']);
};
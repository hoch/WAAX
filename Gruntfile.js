module.exports = function(grunt) {

  /**
   * TODOs
   * 1. gh-pages task
   *   - copy: build, docs, examples, sounds, bower_components, test
   */

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
        livereload: true
      },
      src: {
        files: [
          './src/**'
        ],
        tasks: ['build']
      },
      others: {
        files: [
          './index.html',
          './examples/**',
          './mui/**',
          './test/**'
        ]
      }
    },

    uglify: {
      options: {
        // to keep 'WX' name space intact
        mangle: false
      },
      my_target: {
        options: {
          sourceMap: true,
          sourceMapName: 'build/waax.map'
        },
        files: {
          'build/waax.min.js': ['src/waax.js'],
          'build/plug_ins/SimpleOsc.js': ['src/plug_ins/SimpleOsc.js'],
          'build/plug_ins/WXS1.js': ['src/plug_ins/WXS1.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['build']);
};
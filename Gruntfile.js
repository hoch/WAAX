module.exports = function(grunt) {


  /**
   * workflow
   *
   * 1. dev
   *   - start dev server and start to watch
   *   - edit and save 'waax.js' will trigger uglify to '/build'
   *   - edit and save anything in 'src/plugins'
   *
   * 2. build
   *   - uglify 'src/waax.js' to '/build'
   *   - uglify all the plugins in 'src/plugins' to '/build/plugins'
   *
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
      development: {
        files: [
          './index.html',
          './examples/**',
          './mui/**',
          './src/**',
          './test/**'
        ],
        tasks: ['build'],
        options: {
          livereload: true
        }
      }
    },

    uglify: {
      options: {
        // to reserve 'WX' name space
        mangle: false
      },
      my_target: {
        options: {
          sourceMap: true,
          sourceMapName: 'build/waax.map'
        },
        files: {
          'build/waax.js': ['src/waax.js'],
          'build/plugins/TestPlugin.js': ['src/plugins/TestPlugin.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('dev', ['connect', 'watch']);
  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['build']);
};
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: [
      'build/**/*',
      'dist/**/*',
      '!build',
      '!dist'
    ],

    copy: {
      dist: {
        files: [
          {
            src: [
              '**/*',
              '!node_modules/**',
              '!src/**',
              '!.gitignore',
              '!bower.json',
              '!Gruntfile.js',
              '!LICENSE',
              '!NOTES.md',
              '!package.json',
              '!readme.md'
            ],
            dest: 'dist/'
          }
        ]
      }
    },

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
          'src/**/*.js'
        ],
        tasks: ['build']
      },
      others: {
        files: [
          'index.html',
          'examples/**',
          'mui/**',
          'test/**'
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
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.js',
          dest: 'build'
        }]
      }
    },

    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('build', ['clean', 'uglify']);
  grunt.registerTask('deploy', ['build', 'copy', 'gh-pages']);
};
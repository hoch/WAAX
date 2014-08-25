module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['build/**/*', '!build'],
      dist: ['dist']
    },

    copy: {
      dist: {
        files: [{
          src: [
            '**/*',
            '!node_modules/**',
            '!src/**',
            '!.gitignore',
            '!bower.json',
            '!Gruntfile.js',
            '!LICENSE',
            '!Makefile',
            '!NOTES.md',
            '!package.json',
            '!README.md'
          ],
          dest: 'dist/'
        }]
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
        // to keep module and plug in namespace intact
        mangle: false
      },
      core: {
        files: {
          'build/waax.js': [
            'src/waax.js',
            'src/mui.js',
            'src/timebase.js',
            'src/plug_ins/Fader/fader.js'
          ],
          'build/ktrl.js': ['src/ktrl.js']
        }
      },
      plug_ins: {
        files: [{
          expand: true,
          flatten: true,
          cwd: 'src/plug_ins',
          src: ['**/*.js', '!Fader/fader.js'],
          dest: 'build/plug_ins'
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
  grunt.registerTask('build', ['clean:build', 'uglify']);
  grunt.registerTask('deploy',
    ['clean:dist', 'build', 'copy:dist', 'gh-pages', 'clean:dist']
  );
};
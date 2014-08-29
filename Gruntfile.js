module.exports = function(grunt) {

  'use strict';

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
            'src/waax.header.js',
            'src/waax.util.js',
            'src/waax.core.js',
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
    },

    jsdoc : {
      reference : {
        src: [
          'src/waax.header.js',
          'src/waax.util.js',
          'src/waax.core.js',
        ],
        options: {
          destination: 'docs/reference',
          // template: 'node_modules/ink-docstrap/template',
          // configure: 'node_modules/ink-docstrap/template/jsdoc.conf.json'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean:build', 'uglify']);
  grunt.registerTask('serve', ['build', 'connect', 'watch']);
  grunt.registerTask(
    'deploy',
    ['build', 'clean:dist', 'copy:dist', 'gh-pages', 'clean:dist']
  );
  grunt.registerTask('doc', ['jsdoc']);
};
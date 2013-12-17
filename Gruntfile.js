var waaxDeps = [
    "src/WAAX.js",
    "src/ADSR.js",
    "src/Chorus.js",
    "src/Comp.js",
    "src/Converb.js",
    "src/FMop.js",
    "src/Fader.js",
    "src/FilterBank.js",
    "src/FormantV.js",
    "src/ImpulseTrain.js",
    "src/Ktrl.js",
    "src/LPF.js",
    "src/Noise.js",
    "src/Oscil.js",
    "src/Phasor.js",
    "src/Pingpong.js",
    "src/Sampler.js",
    "src/Saturator.js",
    "src/Spectrum.js",
    "src/Step.js",
    "src/StereoVisualizer.js",
];

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
      },
      min: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> built <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        },
        src: waaxDeps,
        dest: 'build/<%= pkg.name %>.min.js'
      },
      dev: {
        options: {
          compress: false,
          mangle: false,
          preserveComments: true,
          beautify: true,
        },
        src: waaxDeps,
        dest: 'build/<%= pkg.name %>.js'
      }
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};

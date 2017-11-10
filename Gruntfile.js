'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var path = require('path');

  /**
   * Resolve external project resource as file path
   */
  function resolvePath(project, file) {
    return path.join(path.dirname(require.resolve(project)), file);
  }

  // configures browsers to run test against
  // any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
  var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'PhantomJS').split(/\s*,\s*/g);

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'etl/renderer',
      dist: 'dist'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          // strip unnecessary built-ins
          builtins: ['events'],
          // make sure we do not include Node stubs unnecessarily
          insertGlobalVars: {
            process: function () {
              return 'undefined';
            },
            Buffer: function () {
              return 'undefined';
            }
          }
        },
        transform: [['stringify', {extensions: ['.bpmn', '.xml', '.css']}]]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/etl-designer.js': ['<%= config.sources %>/app.js'],
          '<%= config.dist %>/dialog/etl-designer-setting-dialog.js': ['<%= config.sources %>/dialog/setting.js'],
          '<%= config.dist %>/dialog/etl-designer-validation-dialog.js': ['<%= config.sources %>/dialog/validation.js']
        }
      },
      app: {
        files: {
          '<%= config.dist %>/etl-designer.js': ['<%= config.sources %>/app.js'],
          '<%= config.dist %>/dialog/etl-designer-setting-dialog.js': ['<%= config.sources %>/dialog/setting.js'],
          '<%= config.dist %>/dialog/etl-designer-validation-dialog.js': ['<%= config.sources %>/dialog/validation.js']
        }
      }
    },
    copy: {
      diagram_js: {
        files: [
          {
            src: resolvePath('diagram-js', 'assets/diagram-js.css'),
            dest: '<%= config.dist %>/css/diagram-js.css'
          }
        ]
      },
      bpmn_js: {
        files: [
          {
            expand: true,
            cwd: resolvePath('bpmn-js', 'assets'),
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>/vendor'
          }
        ]
      },
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sources %>/',
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },
    uglify: {
      options: {
        beautify: false,//インデントやスペース入りでだすかどうか。
        mangle: false,//変数置換
        compress: true,//圧縮するかどうか。
        sourceMap: true//ソースマップを出力するか。
      }
    },
    less: {
      options: {
        dumpLineNumbers: 'comments',
        paths: [
          'node_modules'
        ]
      },
      styles: {
        files: {
          'dist/css/etl-designer.css': 'etl/styles/app.less'
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },

      samples: {
        files: ['<%= config.sources %>/**/*.*'],
        tasks: ['copy:app']
      },

      less: {
        files: [
          'etl/styles/**/*.less',
          'node_modules/bpmn-js-properties-panel/styles/**/*.less'
        ],
        tasks: [
          'less'
        ]
      }
    },

    connect: {
      livereload: {
        options: {
          port: 9013,
          livereload: true,
          hostname: 'localhost',
          open: false,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    },
    simplemocha: {
      backend: {
        src: [
            'test/spec/ConfigFileUtilSpec.js'
        ]
      }
    },
    karma: {
      options: {
        configFile: 'test/config/karma.unit.js'
      },
      single: {
        singleRun: true,
        autoWatch: false,

        browsers: TEST_BROWSERS
      },
      unit: {
        browsers: TEST_BROWSERS
      }
    }
  });

  // tasks

  grunt.registerTask('build', [
    'copy:diagram_js',
    'copy:bpmn_js',
    'copy:app',
    'less',
    'browserify:app'
  ]);

  grunt.registerTask('auto-build', [
    'copy:diagram_js',
    'copy:bpmn_js',
    'copy:app',
    'less',
    'browserify:watch',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('test-mocha', ['simplemocha']);

  grunt.registerTask('test', ['karma:single']);

  grunt.registerTask('auto-test', ['karma:unit']);

  grunt.registerTask('default', ['jshint', 'test', 'build']);
};




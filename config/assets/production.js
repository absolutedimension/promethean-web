'use strict';

module.exports = {
  client: {
     lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.css',
        'public/lib/angular-material/angular-material.css'
      ],
      js: [
         'public/lib/jquery/dist/jquery.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-aria/angular-aria.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-file-upload/angular-file-upload.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/angular-sanitize/angular-sanitize.js',
        'public/lib/angular-material/angular-material.js',
        'public/lib/chart.js/dist/Chart.js',
        'public/lib/angular-chart.js/dist/angular-chart.js',
        'public/lib/angular-data-grid/dist/pagination.min.js',
        'public/lib/angular-data-grid/dist/dataGrid.min.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  }
};

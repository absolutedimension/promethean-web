(function () {
  'use strict';

  angular
    .module('core')
    .factory('tabledataService', tabledataService);

  tabledataService.$inject = ['$http'];

  function tabledataService($http) {
    // Tabledataservice service logic
    // ...

    // Public API
     return {
            getData: function () {
                return $http({
                    method: 'GET',
                    url: 'http://localhost:3000/api/machines/getTableData/21'
                });
            }
      }
  }
})();

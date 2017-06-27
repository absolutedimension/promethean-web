'use strict';

angular.module('core').controller('TableDataController', ['$scope','$http','$state','Authentication','$interval','$timeout', 'tabledataService',
  function ($scope,$http,$state,Authentication,$interval,$timeout,tabledataService) {
       $scope.gridOptions = {
            data: [],
            urlSync: true
        };
        var deviceId = $state.params.machineId;
       // getTableData();
        $scope.getTableData = function(){
            $http.get('api/machines/getTableData/'+deviceId).then(function(response){
                    $scope.gridOptions.data = response.data;
            }).catch(function(response){

            });
        }
  }
]);

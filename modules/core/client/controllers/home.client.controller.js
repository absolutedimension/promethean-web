'use strict';

angular.module('core').controller('HomeController', ['$scope','$rootScope','$state','$http', 'Authentication','$interval',
  function ($scope,$rootScope,$state,$http, Authentication,$interval) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    //$scope.machines = [{},{},{},{}];

    this.elevation = 1;
    this.showFrame = 3;
     $rootScope.$state = $state;

    this.nextElevation = function() {
      if (++this.elevation == 25) {
        this.elevation = 1;
      }
    };

    $scope.getMachineByUser  = function(){
      $http.get('api/machines/getUserMachine/'+21).then(function(response){
        $scope.machineListByUser = response.data[0].machineAllocated;
       //alert(JSON.stringify(response.data));
      });
    }

    $scope.goToCharts = function(machine){
      $state.go('live',machine);
    }

    $interval(this.nextElevation.bind(this), 500);

      this.toggleFrame = function() {
        this.showFrame = this.showFrame == 3 ? -1 : 3;
      };
    }
]);

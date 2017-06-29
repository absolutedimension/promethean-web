'use strict';

angular.module('core').controller('HomeController', ['$scope','$rootScope','$state','$http', 'Authentication','$interval',
  function ($scope,$rootScope,$state,$http, Authentication,$interval) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.loggedInUser = $scope.authentication.user;

    //$scope.machines = [{},{},{},{}];

    if(!$scope.authentication.user){
      $state.go('authentication');
    }

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
      //alert("Machine values :"+JSON.stringify(machine));
      $state.go('live',machine);
    }

    $interval(this.nextElevation.bind(this), 500);

      this.toggleFrame = function() {
        this.showFrame = this.showFrame == 3 ? -1 : 3;
      };
    }
]);

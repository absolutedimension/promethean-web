'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window','$modal', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window,$modal, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    $scope.newUser = {
      firstName:null,
      password:null,
      email:null,
      provider:'local',
      username:null,
      machineAllocated:[],
    }

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
     // $scope.credentials.roles = "admin";
      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).then(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response.data;
        // And redirect to the previous or home page
        if($scope.authentication.user.roles.indexOf('admin') > -1){
          $location.url('admin/users'); 
        } else{
            $state.go($state.previous.state.name || 'home', $state.previous.params);
        }
       
      }).catch(function (response) {
        $scope.error = response.data.message;
      });
    };

      $scope.addAdminSignup = function(){
         $modal.open({
          animation: true,
          templateUrl: './modules/users/client/views/admin/admin.signup.client.html',
          controller: 'AuthenticationController',
          windowClass:'admin-modal-window'
        });
    }

     $scope.doAdminSignup = function(adminUser){
     // alert("User brforwe "+JSON.stringify(adminUser));
      $http.post('api/auth/adminsignup',adminUser).then(function(err,response){
        if(err){
          alert("Err "+err.message);
          return;
        }
           alert("User Created");
      });
    }

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);
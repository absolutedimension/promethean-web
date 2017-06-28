'use strict';

angular.module('users.admin').controller('UserListController', ['$scope','$http','$state', '$filter','$modal','$mdToast', 'Admin',
  function ($scope,$http,$state, $filter,$modal,$mdToast, Admin,User,MachineDetail) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.user = User;
    $scope.companyDetail = {
          machineName:null,
          companyName:null,
          location:null,
          machineId:0,
          unitId:null
    }
    $scope.tabChange =function(tabName,listName){
       $scope.currentTab = tabName;
       if(listName == 'machineList') {
          $('#machineList').removeAttr('style');
          $('#machineList').addClass('machine-selected');
          $('#userList').removeClass('user-selected');
       }
       if(listName == 'userList') {
         $('#userList').removeAttr('style');
         $('#userList').addClass('user-selected');
         $('#machineList').removeClass('machine-selected');
       }
    }

    $scope.currentTab  = 'machines';

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
    $scope.newUser = {
      firstName:null,
      password:null,
      email:null,
      provider:'local',
      username:null,
      machineAllocated:[],
    }

    $scope.uploadMachineImage = function(){
       $modal.open({
          animation: true,
          templateUrl: './modules/users/client/views/settings/change-profile-picture.client.view',
          controller: 'UserListController',
          windowClass:'user-modal-window'
        });
    }
    
    $scope.chipsChanged = function(chip){
      alert("Inside Chips change :"+chip);
      for(var i=0; newUsers.length ; i++){
        if(newUsers[i].email == chip){
          newUsers.splice(i,1);
        }
      }
      for(var i=0; existingUsersEmail.length ; i++){
        if(existingUsersEmail[i] == chip){
          existingUsersEmail.splice(i,1);
        }
      }
     
    }
    var signUpObject ={
        newUsers:[],
        userEmails:[],
        companyDetailUser:{}
      }

    $scope.addUserInfo = function(){
      $scope.companyDetail.machineName = angular.element('#machineName').val();
      $scope.companyDetail.companyName = angular.element('#companyName').val();
      $scope.companyDetail.location = angular.element('#location').val();
      $scope.companyDetail.machineId = angular.element('#machineId').val();
      $scope.companyDetail.unitId = angular.element('#unitId').val();

      signUpObject.userEmails = existingUsersEmail;
     
      signUpObject.companyDetailUser =  $scope.companyDetail;
     
     
      alert("Before post  :-"+JSON.stringify($scope.companyDetail));
     
      $http.post('/api/auth/signupUser',signUpObject).then(function(response){
          addMachineModal.close();
          $scope.showActionToast();        
        }).catch(function(response){
          $scope.error = response.data.message;
          alert("Couldn't save :"+response);
      });
    }

    $scope.selectedUser  = [];
    var newUsers = [];
    var newUserObjects = [];
    var existingUsersEmail = [];
    $scope.readonly = false;
    $scope.removable = true;
    
    var selectedUserEmail = [];
    var companyDetailSaved = false;

    $scope.goToLiveCharts = function(machineObject) {
       $state.go('live',machineObject);
    }

    $scope.goToLiveTables = function(machine){
      $state.go('table',machine);
    }

    $scope.selectedDropDown = function(item) {
      var existingUsers = item.email;
      if(existingUsersEmail.indexOf(existingUsers) == -1) {
         existingUsersEmail.push(existingUsers);
       }
       $scope.selectedUser  = newUsers.concat(existingUsersEmail);
       signUpObject.userEmails.push(existingUsers);
    }

    $scope.addUserToMachine = function(newUser)   {    
        if(newUsers.indexOf(newUser.email) == -1) {
          newUsers.push(newUser.email);
        }
        $scope.companyDetail.machineName = angular.element('#machineName').val();
        $scope.companyDetail.companyName = angular.element('#companyName').val();
        $scope.companyDetail.location = angular.element('#location').val();
        $scope.companyDetail.machineId = angular.element('#machineId').val();
        $scope.companyDetail.unitId = angular.element('#unitId').val();
        newUser.provider = 'local';
        newUser.username = newUser.email;
        newUser.machineAllocated.push($scope.companyDetail);
        signUpObject.companyDetailUser =  $scope.companyDetail;
        signUpObject.newUsers.push(newUser);

        $http.post('api/auth/signupUser',signUpObject).then(function(response){
          companyDetailSaved = true;
        }).catch(function(response){
          $scope.error = response.data.message;
            alert("User  Not Saved :"+response);
        });
        $scope.selectedUser =  newUsers;     
    }

    
    var addMachineModal = null;
    $scope.addMachines = function(){
          addMachineModal = $modal.open({
          animation: true,
          templateUrl: './modules/users/client/views/admin/add-machine.client.view.html',
          controller: 'UserListController',
          windowClass:'user-modal-window'
        });
    }

     $scope.editMachines = function(userToEdit){
       alert("User Data :"+JSON.stringify(userToEdit));
      
         $modal.open({
          animation: true,
          templateUrl: './modules/users/client/views/admin/edit-user.client.view.html',
          controller: 'UserListController',
          windowClass:'user-modal-window'
        });
         $scope.userToEdit = userToEdit;
    }

    $scope.getMachines = function(){
      $http.get("/api/machines/getMachines/"+21).then(function(response){
          $scope.machineListById = response.data;
      }).catch(function(response){

      });
    }

    $('#existingUserDropdown option').click(function() {
      
    });

    //Code for toast
        var last = {
          bottom: false,
          top: true,
          left: false,
          right: true
        };

      $scope.toastPosition = angular.extend({},last);

      $scope.getToastPosition = function() {
        sanitizePosition();

        return Object.keys($scope.toastPosition)
          .filter(function(pos) { return $scope.toastPosition[pos]; })
          .join(' ');
      };

      function sanitizePosition() {
        var current = $scope.toastPosition;

        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;

        last = angular.extend({},current);
      }

      $scope.showSimpleToast = function() {
        var pinTo = $scope.getToastPosition();

        $mdToast.show(
          $mdToast.simple()
            .textContent('Simple Toast!')
            .position(pinTo )
            .hideDelay(3000)
        );
      };

      $scope.showActionToast = function() {
        var pinTo = $scope.getToastPosition();
        var toast = $mdToast.simple()
          .textContent('User Saved')
          .action('UNDO')
          .highlightAction(true)
          .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
          .position(pinTo);

        $mdToast.show(toast).then(function(response) {
          if ( response == 'ok' ) {
            alert('You clicked the \'UNDO\' action.');
          }
      });
    }

//Code for toast ends
  }
]);

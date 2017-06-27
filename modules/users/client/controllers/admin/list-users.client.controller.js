'use strict';

angular.module('users.admin').controller('UserListController', ['$scope','$http', '$filter','$modal', 'Admin',
  function ($scope,$http, $filter,$modal, Admin,User,MachineDetail) {
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

   // alert("User  :"+$scope.user);
    $scope.addUserInfo = function(){
      $scope.companyDetail.machineName = angular.element('#machineName').val();
      $scope.companyDetail.companyName = angular.element('#companyName').val();
      $scope.companyDetail.location = angular.element('#location').val();
      $scope.companyDetail.machineId = angular.element('#machineId').val();
      $scope.companyDetail.unitId = angular.element('#unitId').val();
      //signUpObject.newUsers  = newUserObjects;
      signUpObject.userEmails = existingUsersEmail;
      signUpObject.companyDetailUser =  $scope.companyDetail;
      alert("Before post  :-"+JSON.stringify($scope.companyDetail));
      //$scope.newUser.machineAllocated.push($scope.companyDetail);
      $http.post('/api/auth/signupUser',signUpObject).then(function(response){
          alert("User Saved "+response.data);
        }).catch(function(response){
          $scope.error = response.data;
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
    $scope.selectedDropDown = function(item){
      //alert(item._id);
      var existingUsers = item.email;
       //alert(selectedUserObj);
      if(existingUsersEmail.indexOf(existingUsers) == -1) {
         existingUsersEmail.push(existingUsers);
       }
       $scope.selectedUser  = newUsers.concat(existingUsersEmail);
       signUpObject.userEmails.push(existingUsers);
    }

    $scope.addUserToMachine = function(newUser){    
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

      $http.post('api/auth/signup',newUser).then(function(response){
          alert("User Saved :"+response.data);
      }).catch(function(response){
           alert("User  Not Saved :"+response.data);
      });
      //newUserObjects.push(newUser);
     // signUpObject.newUsers.push(newUser);
      $scope.selectedUser =  newUsers;
      // $scope.selectedUser = $scope.newUsers.concat($scope.existingUsers);
    }

    

    function addMachineToExistingUsers(){

    }
  
    $scope.addMachines = function(){
         $modal.open({
          animation: true,
          templateUrl: './modules/users/client/views/admin/add-machine.client.view.html',
          controller: 'UserListController',
          windowClass:'user-modal-window'
        });
    }

     $scope.editMachines = function(machineData){
        alert("Machine Data :"+JSON.stringify(machineData));
         $modal.open({
          animation: true,
          templateUrl: './modules/users/client/views/admin/add-machine.client.view.html',
          controller: 'UserListController',
          windowClass:'user-modal-window'
        });
    }

    $scope.getMachines = function(){
      $http.get("/api/machines/getMachines/"+21).then(function(response){
          $scope.machineListById = response.data;
      }).catch(function(response){

      });
    }

    $('#existingUserDropdown option').click(function() {
      
    });

   

    $scope.openCity = function(evt, cityName) {
         // Declare all variables
          var i, tabcontent, tablinks;

          // Get all elements with class="tabcontent" and hide them
          tabcontent = angular.element('document').getElementsByClassName("tabcontent");
          for (i = 0; i < tabcontent.length; i++) {
              tabcontent[i].style.display = "none";
          }

          // Get all elements with class="tablinks" and remove the class "active"
          tablinks = angular.element('document').getElementsByClassName("tablinks");
          for (i = 0; i < tablinks.length; i++) {
              tablinks[i].className = tablinks[i].className.replace(" active", "");
          }

          // Show the current tab, and add an "active" class to the link that opened the tab
          angular.element('document').getElementById(cityName).style.display = "block";
          evt.currentTarget.className += " active";
    }



  }
]);

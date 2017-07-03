'use strict'

angular.module('core').directive('addtabledata',[function(){
        return {
        restrict: "E",
        scope:false,
        templateUrl:'./modules/core/client/views/carousel.data.view.html',
        controller: function() {
           
        }
      }
}]).directive('addflowchart',[function(){
        return {
        restrict: "E",
        scope:false,
        templateUrl:'./modules/core/client/views/carousel.data.view.html',
        controller: function() {
            
        }
      }
}]).directive('addmessage',[function(){
        return {
        restrict: "E",
        scope:false,
        template:"<div  style='position: relative;top: 30%'>"+
           "<span style='color: #004aac;font-size: 20px'><b>The monthly data is shown by the graph on the left.</b></span>"
           +"</br>"+
           "<span style='color: #999;font-size: 18px;'>Click on any month to drilldown further.</span>"
           +"<hr style='bottom: 10px'></hr>"
           +"</div>",
        controller: function() {
            
        }
      }
}]);
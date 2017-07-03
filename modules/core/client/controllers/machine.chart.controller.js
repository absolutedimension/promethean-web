'use strict';

angular.module('core').controller('MachineChartController', ['$scope','$http','$state','$stateParams','$compile','Authentication','$interval','$modalStack','$timeout', 'tabledataService',
  function ($scope,$http,$state,$stateParams,$compile,Authentication,$interval,$modalStack,$timeout,tabledataService) {
      
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      var year=0;
     
      var deviceIdTemp = $state.params.machineId;
      var unitId = $state.params.unitId;
      var deviceId = deviceIdTemp+"_"+unitId;
      var yearSelected = 2017;
      
     $scope.seriesData = [];
     $scope.monthSeries = [];
     $scope.tabs = []; 

     $scope.isTableVisible = false;  

     loadLoader();
        
    function loadLoader(){
        $scope.activated = true;
        $scope.determinateValue = 30;
        $interval(function() {
            $scope.determinateValue += 1;
            if ($scope.determinateValue > 70) {
             $scope.determinateValue = 0;

            }
        }, 100);   
    }
     

     $scope.yearSelected = function(year){
               
         yearSelected = year;
         $scope.isMainChartVisible = true;
         $state.go('historic-chart',$stateParams);
         $modalStack.dismissAll();
         prepareSeriesData();
         
     }
     $scope.yearTabSelected = function(year){
         yearSelected = year;yearTabSelected
         $scope.isMainChartVisible = true;
         showCharts();
     }
     getDataByYear();
    
      function getDataByYear (year) {
        var year =2017;
        $http.get('api/machinesData/getDataByYear/'+deviceId).then(function(response) {
          var dataByYear = response.data;
          for(var i= 0;i< dataByYear.length ; i < i++){
              var tempYear = {title:null};
              tempYear.title = dataByYear[i]._id.Year;
              $scope.tabs.push(tempYear);
            //   if(year == dataByYear[i]._id.Year) {
            //      $scope.labels.push(dataByYear[i]._id.Year);
            //      $scope.data.push(dataByYear[i].totalEnergy);
            //   }
            
          }
         $scope.activated = false;
          //showCharts();
        }).catch(function(response){

        });
      }
     

      function getDataByMonth(year) {
        year = 2017;
        $http.get('api/machinesData/getDataByMonth/'+deviceId+"/"+yearSelected).then(function(response){
        $scope.dataByMonth = response.data;
        var dataByMonth = response.data;
        var seriesTmpData = [];
        for(var i= 0;i< dataByMonth.length ;  i++){
            var monthData = {"name":null,"y":0,"drilldown":null};
            monthData.name = months[dataByMonth[i]._id - 1];
            monthData.y = dataByMonth[i].totalEnergy;
            monthData.drilldown  = months[dataByMonth[i]._id - 1];  
            seriesTmpData.splice(i,0,monthData);
            
            $scope.monthSeries.splice(i,0,monthData.name);
            getDataByDay(dataByMonth[i]._id);
        }
        $scope.seriesData = seriesTmpData;
        showCharts();
        }).catch(function(response){

        });
        
      }
      
      var seriesDrillDown = {type:'column',name:null,id:null,data:[]};
      var seriesDrillDownHour = {name:null,id:null,data:[],y:0,drilldown:null};
      $scope.finalDrilldownData =[];
      $scope.finalDrilldownDataHour =[];
      $scope.drilldownCompleted = false;
      $scope.lastClickedMonth = null;

      $scope.goToLive = function(){
          $state.go('live',$stateParams);
      }

    $scope.isFlowContainerVisible = false;
    //var dataByDay = null;
     $scope.daySeries = [];
     var tableDataJson = {
         'month':[],
         'dailyData':[]
     }

     function getDataByDay(monthClicked) {
        // alert("Inside databy day :"+monthClicked);
        var month =  monthClicked;
        $http.get('api/machinesData/getDataByDay/'+deviceId+"/"+yearSelected+"/"+month).then(function(response) {
          var dataByDay = response.data;
          tableDataJson.month.push(month);
          tableDataJson.dailyData.push(dataByDay);
          //$scope.dataBydayTable = dataByDay;
         //alert("Data By Day :"+JSON.stringify(dataByDay));
         var seriesDrillDown = {type:'column',name:null,id:null,data:[]};
          seriesDrillDown.name  = months[month-1];
          seriesDrillDown.id  = months[month-1];
          var inside_data = [];
          for(var i= 0;i< dataByDay.length ; i++){
                var referenceData = {id:null,data:[]};
                var inside_data = [];
                var tempData = {name:null,y:null,drilldown:null};
                var drilldownMonthData =  [];
                // seriesDrillDown.name  = months[month-1];
                // seriesDrillDown.id  = months[month-1];
              
                tempData.name = "Day "+dataByDay[i]._id;
                tempData.y = dataByDay[i].totalEnergy;
                tempData.drilldown = "Day "+dataByDay[i]._id;

                seriesDrillDown.data[i] = tempData;

                //Push reference for drilldown id
                referenceData.id =  dataByDay[i]._id.toString();

                inside_data[0] = "Day "+dataByDay[i]._id.toString();
                inside_data[1] =  dataByDay[i].totalEnergy;
                
                referenceData.data.push(inside_data);//dataByDay[i]._id.toString();
                //referenceData.data[1] = dataByDay[i].totalEnergy;

                //$scope.daySeries.push(dataByDay[i]._id);            
              
                // $scope.finalDrilldownData.push(seriesDrillDown);
                $scope.finalDrilldownData.push(referenceData);
          }
            $scope.finalDrilldownData.push(seriesDrillDown);
            //showCharts();
            //prepareCarouselData();
          console.log("Final Drilldown data :"+JSON.stringify($scope.finalDrilldownData));
         // prepareCarouselData();
        }).catch(function(response){

        });
      } 

      function getDataByHour(monthClicked) {
        var month=monthClicked;
        var dayClicked = 13;
       
        $http.get('api/machinesData/getDataByHour/'+deviceId+"/"+yearSelected+"/"+6+"/"+dayClicked).then(function(response) {
          var dataByHour = response.data;
          for(var i= 0;i< dataByHour.length ; i++){
                var drilldownhourData =  [];
                seriesDrillDownHour.name  = months[dataByHour[i]._id.Month-1];
                seriesDrillDownHour.id  = months[dataByHour[i]._id.Month-1];
                seriesDrillDownHour.drilldown = dataByHour[i]._id.Day;
                drilldownhourData[0] = dataByHour[i]._id.Day;
                drilldownhourData[1] = dataByHour[i].totalEnergy;

                seriesDrillDownHour.data.push(drilldownMonthData);
                $scope.finalDrilldownDataHour.push(seriesDrillDownHour);
          }
        }).catch(function(response){

        });
      }
    
      $scope.chartInit = function(){
          prepareSeriesData();
          //getDataByMonth(2017);
          //getDataByDay();
       
      }
     
      function getAverageFlowValue(dayClicked){
         // alert("Day Clicked :"+dayClicked);
          $http.get('api/machinesData/getAvgFlowByHour/'+deviceId+"/"+yearSelected+"/"+6+"/"+dayClicked).then(function(response){
              var flowResponse = response.data;
               $scope.averageFlowValue =[];
               $scope.averageFlowTimes= [];
              for(var i = 0 ; i < flowResponse.length ; i ++) {
                  $scope.averageFlowValue.push(flowResponse[i].averageFlowEnergy);
                  $scope.averageFlowTimes.push(flowResponse[i]._id);
              }
              populateFlowChart();
              //alert("Average flow lenthhhhh:"+ averageFlowValue.length,averageFlowTimes.length);
          }).catch(function(response){

          });
      }
       $scope.smallContainer = false;
       $scope.messageContainerVisible = true;
      function prepareSeriesData() {
         // alert("Series data "+JSON.stringify($scope.seriesData[0]));
        getDataByMonth(yearSelected);
          // $timeout(prepareCarouselData,2500);
        $scope.activated = true;
        $scope.determinateValue = 30;
        $interval(function() {
            $scope.determinateValue += 1;
            if ($scope.determinateValue > 100) {
            $scope.determinateValue = 30;
            }
        }, 100);           
      }

   // $timeout(showCharts,5000);
   //showCharts();
    var dayClicked = null;
    function showCharts(){
        // Create the chart
        Highcharts.chart('containerChart', {
            chart: {
                 type: 'column',
                 events:{
                 drilldown: function(e) {
                     // alert("Inside Drill Down :"+e.point.name);
                      $scope.isTableVisible = true;
                     
                      
                     if( $scope.drilldownCompleted ) {
                         pupulateLineChart(e.point.name.split(" ")[1]);
                         getAverageFlowValue(e.point.name.split(" ")[1]);
                         //$scope.isFlowContainerVisible = true;
                        // $timeout(populateFlowChart,2000);
                        // return;
                     } else {
                         $scope.smallContainer = true;
                         $scope.monthClicked = e.point.name;
                         //$scope.messageContainerVisible = false;
                         
                        var messageContainer = angular.element(document.querySelector('#carouselContainer'));
                         messageContainer.empty();
                         prepareCarouselData(months.indexOf(e.point.name)+1);
                        
                        //$("mainChartContainer").addClass('col-md-6');
                          addCarouselDirective();  
                     }
                              
                      $scope.drilldownCompleted = true;
                  
                      $scope.lastClickedMonth = e.point.id;
                     
                    //  getDataByDay($scope.lastClickedMonth);
                },
                drillupall:function(e){
                    $scope.drilldownCompleted = false;
                    $scope.isTableVisible = false;
                    $scope.isFlowContainerVisible = false;
                    $scope.messageContainer = true;
                    carouselDiv.empty();
                    var flowChartDiv = angular.element(document.querySelector('#flowContainer'));
                    flowChartDiv.empty(); 
                }
            }
            },
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            xAxis: {
                type: "category"
            },
            yAxis: {
                title: {
                    text: '<b> TOTAL ENERGY ( kcal )</b>'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.2f} kcal'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f} kcal</b> of total<br/>'
            },

            series:[{
                name: 'Months',
                colorByPoint: true,
                data:$scope.seriesData
            }],
            drilldown: {
                series:$scope.finalDrilldownData,
                activeAxisLabelStyle :{
                    textDecoration:'none'
                }             
            }
        });
       //Chart Ends
      }


 function getServerData(params, callback) {
    $http.get(contextPath + '/some/list' + params).then(function (response) {
    var data = response.data.some,
    totalItems = response.data.someCount;
    callback(data, totalItems);
    }); 
}  

function pupulateLineChart(dayClicked){
    var monthInNumbers = months.indexOf($scope.monthClicked) + 1;
    $http.get('api/machinesData/getDataByHour/'+deviceId+"/"+yearSelected+"/"+monthInNumbers+"/"+dayClicked).then(
        function(response){
            addLineChart(response.data);
        }
    ).catch(function(response){

    });
}
$scope.goToMonths = function(){
    carouselDiv.empty();
    var flowChartDiv = angular.element(document.querySelector('#flowContainer'));
    flowChartDiv.empty();
    $scope.isTableVisible = false;
    $scope.isFlowContainerVisible = true;
    addMessageDirective();
    showCharts();
   $scope.drilldownCompleted = false; 
   
}


var highChart= null;
$scope.isBackButtonVisible = false;
 $scope.startPoint = 0;
function addLineChart(responseData){
    $scope.dataD0_hour = [];
    $scope.dataD1_hour = [];
    $scope.dataD2_hour = []; 
    for (var i = 0 ; i < responseData.length ; i++) {
        $scope.dataD0_hour.push(responseData[i].avg_d0);
        $scope.dataD1_hour.push(responseData[i].avg_d1);
        $scope.dataD2_hour.push(responseData[i].avg_d2);
    }
    $scope.startPoint = responseData[0]._id;
    $( ".containerChart" ).remove();
    $scope.isBackButtonVisible = true;
     //Line Chart Starts
            Highcharts.chart('containerChart', {

                yAxis: {
                    title: {
                        text: 'Average Temp'
                    }
                },
                title: {
                    text: ''
                },
                 legend: {
                    layout: 'vertical',
                    align: 'center',
                    verticalAlign: 'top',
                },
                xAxis:{
                    type:"category",
                    title: {
                        text: 'Hours of the Day'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.1f} °C</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        pointStart: $scope.startPoint
                    }
                },

                series: [{
                    name: 'Average Water In',
                    data: $scope.dataD0_hour
                }, {
                    name: 'Average Water Out',
                    data: $scope.dataD1_hour
                }, {
                    name: 'Average Oil Temp',
                    data: $scope.dataD2_hour
                }
                ]
            });
            //Line Charts Ends
}


 function populateFlowChart(){

    Highcharts.chart('flowContainer', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Flow'
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories:$scope.averageFlowTimes,
            
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Average Flow (LPH)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} lph </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Hour of the Day',
            data: $scope.averageFlowValue//[49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

        }
        ]
    });
 }


//$scope.chartClickData = [{},{},{},{},{},{}];

 


  //$timeout(prepareCarouselData,4000);  

function prepareCarouselData(monthClicked){
   // alert("Month Clicked :"+monthClicked);
    var tempJson = {day:[],totalEnergy:[]};
    var chartClickSet = [];
    $scope.dataToShowInTable = [];
    var set1 = [],set2 = [],set3 = [],set4 = [],set5 = [];
    for(var i = 0 ; i < tableDataJson.month.length ; i++) {

        if(tableDataJson.month[i] ==  monthClicked) {

            $scope.dataToShowInTable = tableDataJson.dailyData[i];
        }
    }
   // alert("Montn value in loop :"+$scope.dataToShowInTable.length);

    $scope.chartClickData = $scope.dataToShowInTable;
    return;
    
   // alert("Inside"+dataByDay.length );
//    addCarouselDirective();
//    return;
    for(var i= 0 ; i < $scope.dataToShowInTable.length ; i ++){
         if(i < 7){
             var averageDvalues = {avg_d0:null,avg_d1:null,avg_d2:null};
             console.log(" I Value in set1  :"+i);
             tempJson.day[i] = $scope.dataToShowInTable[i]._id;
             averageDvalues.avg_d0 = $scope.dataToShowInTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataToShowInTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataToShowInTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);

         }
         if(i == 7 || $scope.dataToShowInTable.length == i){
             set1.push(tempJson); 
         }
         if(i >= 7 && i < 14){
              console.log(" I Value in set2 :"+i);
              tempJson = {day:[],totalEnergy:[]};
             var averageDvalues = {avg_d0:null,avg_d1:null,avg_d2:null};
             tempJson.day.splice(i,0,$scope.dataToShowInTable[i]._id);
             averageDvalues.avg_d0 = $scope.dataToShowInTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataToShowInTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataToShowInTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);

        }
        if(i == 13 || $scope.dataToShowInTable.length == i){
             set2.push(tempJson); 
         }
         if(i >= 14 && i < 22){
              console.log(" I Value :"+i);
             tempJson.day.push($scope.dataToShowInTable[i]._id);
             averageDvalues.avg_d0 = $scope.dataToShowInTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataToShowInTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataToShowInTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
            set3 = tempJson;
            //if(i==21){
              //  set3.push(tempJson); 
            // }

        }
        if(i >= 22 && i < 29){
             console.log(" I Value :"+i);
             tempJson.day.push($scope.dataToShowInTable[i]._id);
             averageDvalues.avg_d0 = $scope.dataToShowInTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataToShowInTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataToShowInTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
             set4 = tempJson;
             //if(i==28){
               // set4.push(tempJson); 
             //}

        }
        if(i >= 29 && i <= 32){
             console.log(" I Value :"+i);
             tempJson.day.push($scope.dataToShowInTable[i]._id);
             averageDvalues.avg_d0 = $scope.dataToShowInTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataToShowInTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataToShowInTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
             set5 = tempJson;
            // if(i== 32){
                //set5.push(tempJson); 
            // }

        }
        
    }
    chartClickSet.splice(0,0,set1);
    chartClickSet.splice(1,0,set2);

//     if(set1.day !== undefined ){
// //alert("Ins +"+set1.day.length);
//        chartClickSet.splice(1,0,set1);
//     }
//     if(set2.day !== undefined ){
//        //  alert("Set2 +"+set2.day.length);
//        chartClickSet.splice(2,0,set2);
//     }
//         if(set3.day !== undefined ){
//        chartClickSet.splice(3,0,set3);
//     }
//         if(set4.day !== undefined ){
//        chartClickSet.splice(4,0,set4);
//     }
//         if(set5.day !== undefined ){
//        chartClickSet.splice(5,0,set5);
//     }
  
  
    $scope.chartClickData = chartClickSet;
      //alert("Final data length "+chartClickData.length);
    
}
//addCarouselDirective();
//Tabs

     

//Tabs Ends


var carouselDiv = null;
function addCarouselDirective() {
    carouselDiv = angular.element(document.querySelector('#carouselContainer'));
    var appendCarousel = $compile('<addtabledata></addtabledata>')($scope);
    carouselDiv.append(appendCarousel);
}

var messageDiv = null;
function addMessageDirective() {
    messageDiv = angular.element(document.querySelector('#carouselContainer'));
    var appendMessage = $compile('<addmessage></addmessage>')($scope);
    messageDiv.append(appendMessage);
}

    }   
]);

'use strict';

angular.module('core').controller('MachineChartController', ['$scope','$http','$state','$stateParams','Authentication','$interval','$timeout', 'tabledataService',
  function ($scope,$http,$state,$stateParams,Authentication,$interval,$timeout,tabledataService) {
      
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

     $scope.yearSelected = function(year){
         yearSelected = year;
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
          showCharts();
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
        //showCharts();
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

    
    //var dataByDay = null;
     $scope.daySeries = [];
     function getDataByDay(monthClicked) {
        // alert("Inside databy day :"+monthClicked);
        var month =  monthClicked;
        $http.get('api/machinesData/getDataByDay/'+deviceId+"/"+yearSelected+"/"+month).then(function(response) {
          var dataByDay = response.data;
          $scope.dataBydayTable = dataByDay;
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
              
                tempData.name = dataByDay[i]._id;
                tempData.y = dataByDay[i].totalEnergy;
                tempData.drilldown = dataByDay[i]._id;

                seriesDrillDown.data[i] = tempData;

                //Push reference for drilldown id
                referenceData.id =  dataByDay[i]._id.toString();

                inside_data[0] = dataByDay[i]._id.toString();
                inside_data[1] =  dataByDay[i].totalEnergy;
                
                referenceData.data.push(inside_data);//dataByDay[i]._id.toString();
                //referenceData.data[1] = dataByDay[i].totalEnergy;

                $scope.daySeries.push(dataByDay[i]._id);            
              
                // $scope.finalDrilldownData.push(seriesDrillDown);
                $scope.finalDrilldownData.push(referenceData);
          }
            $scope.finalDrilldownData.push(seriesDrillDown);
            //showCharts();
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

      function prepareSeriesData(){
         // alert("Series data "+JSON.stringify($scope.seriesData[0]));
          getDataByMonth(yearSelected);
           $timeout(prepareCarouselData,2500);
        //   getDataByDay(5);
        //   getDataByDay(6);
          //  var self = this;

            $scope.activated = true;
            $scope.determinateValue = 30;

            // Iterate every 100ms, non-stop and increment
            // the Determinate loader.
            $interval(function() {

                $scope.determinateValue += 1;
                if ($scope.determinateValue > 100) {
                $scope.determinateValue = 30;
                }

            }, 100);
                
      }

   // $timeout(showCharts,5000);
   showCharts();
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
                      //prepareCarouselData();
                     if( $scope.drilldownCompleted ) {
                         pupulateLineChart(e.point.name);
                         getAverageFlowValue(e.point.name);

                        // $timeout(populateFlowChart,2000);
                        // return;
                     } else {
                        
                         
                     }
                              
                      $scope.drilldownCompleted = true;
                  
                      $scope.lastClickedMonth = e.point.id;
                     
                    //  getDataByDay($scope.lastClickedMonth);
                },
                drillupall:function(e){
                    $scope.drilldownCompleted = false;
                    $scope.isTableVisible = false; 
                }
            }
            },
            title: {
                text: ''
            },
            // subtitle: {
            //     text: 'Promethean'
            // },
            xAxis: {
                categories:$scope.monthSeries
            },
            yAxis: {
                title: {
                    text: '<b>TOTAL ENERGY(Kcal)</b>'
                }

            },
            legend: {
                enabled: false
            },
            // plotOptions: {
            //     series: {
            //         borderWidth: 0,
            //         dataLabels: {
            //             enabled: true,
            //             format: '{point.y:.1f}'
            //         }
            //     }
            // },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
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
    $http.get('api/machinesData/getDataByHour/'+deviceId+"/"+yearSelected+"/"+6+"/"+dayClicked).then(
        function(response){
            addLineChart(response.data);
        }
    ).catch(function(response){

    });
}
$scope.goToMonths = function(){
    $( ".containerChart" ).remove();
    $( ".flowContainer" ).remove();
    $scope.isTableVisible = false; 
   showCharts();
   $scope.drilldownCompleted = false; 
}

$scope.dataD0_hour = [];
$scope.dataD1_hour = [];
$scope.dataD2_hour = [];
var highChart= null;
$scope.isBackButtonVisible = false;
function addLineChart(responseData){
    for (var i = 0 ; i < responseData.length ; i++) {
        $scope.dataD0_hour.push(responseData[i].avg_d0);
        $scope.dataD1_hour.push(responseData[i].avg_d1);
        $scope.dataD2_hour.push(responseData[i].avg_d2);
    }
    $( ".containerChart" ).remove();
    $scope.isBackButtonVisible = true;
     //Line Chart Starts
            Highcharts.chart('containerChart', {

                yAxis: {
                    title: {
                        text: 'Average flow'
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },

                plotOptions: {
                    series: {
                        pointStart: 0
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
    xAxis: {
        categories:$scope.averageFlowTimes,// [
           
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Average Flow'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
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
        name: 'Avg Flow',
        data: $scope.averageFlowValue//[49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

    }
    ]
});

 }


//$scope.chartClickData = [{},{},{},{},{},{}];

   var set1 = {},
    set2 = {},
    set3 = {},
    set4 = {},
    set5 = {};
$scope.chartClickData = [set1,set2,set3,set4,set5];
var averageDvalues = {avg_d0:null,avg_d1:null,avg_d2:null};
 var tempJson = {day:[],totalEnergy:[]};

  $timeout(prepareCarouselData,2500);  

function prepareCarouselData(){
   // alert("Inside"+dataByDay.length );
//    addCarouselDirective();
//    return;
    for(var i= 0 ; i < $scope.dataBydayTable.length ; i ++){
         if(i < 7){
             tempJson.day[i] = $scope.dataBydayTable[i]._id;
             averageDvalues.avg_d0 = $scope.dataBydayTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataBydayTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataBydayTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
             set1 = tempJson;
            // alert(JSON.stringify(set1));

         }
         if(i > 7 && i <= 14){
              tempJson.day[i] = $scope.dataBydayTable[i]._id;
             averageDvalues.avg_d0 = $scope.dataBydayTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataBydayTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataBydayTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
             set2 = tempJson;

        }
         if(i > 14 && i <= 22){
              tempJson.day[i] = $scope.dataBydayTable[i]._id;
             averageDvalues.avg_d0 = $scope.dataBydayTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataBydayTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataBydayTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
            set3 = tempJson;

        }
        if(i > 22 && i <= 29){
             tempJson.day[i] = $scope.dataBydayTable[i]._id;
             averageDvalues.avg_d0 = $scope.dataBydayTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataBydayTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataBydayTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
             set4 = tempJson;

        }
        if(i > 29 && i < 32){
             tempJson.day[i] = $scope.dataBydayTable[i]._id;
             averageDvalues.avg_d0 = $scope.dataBydayTable[i].avg_d0;
             averageDvalues.avg_d1 = $scope.dataBydayTable[i].avg_d1;
             averageDvalues.avg_d2 = $scope.dataBydayTable[i].avg_d2;
             tempJson.totalEnergy.push(averageDvalues);
             set5 = tempJson;

        }
        
    }
    $scope.chartClickData = [set1,set2,set3,set4,set5];
    
}
//addCarouselDirective();
//Tabs

     

//Tabs Ends



function addCarouselDirective() {
    var carouselDiv = angular.element(document.querySelector('#carouselContainer'));
    var appendCarousel = $compile('<addcarouseldata></addcarouseldata>')($scope);
    carouselDiv.append(appendCarousel);
}

    }   
]);

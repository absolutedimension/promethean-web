
'use strict';

angular.module('core').controller('ChartLiveController', ['$scope','$http', '$state','$stateParams','$modal','$timeout','$interval', 'Authentication', 'Menus',
  function ($scope,$http, $state,$stateParams,$modal,$timeout,$interval, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;



    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    $scope.waterin = [];
    $scope.waterout = [];
    $scope.oiltemp = [];
    $scope.currentTab = 'live';

    var deviceIdTemp = $state.params.machineId;
    var unitId = $state.params.unitId;
    var deviceId = deviceIdTemp+"_"+unitId;

    $scope.machineObject = $state.params;
     loadLoader();
        
    function loadLoader(){
        $scope.activatedLive = true;
        $scope.determinateValueLive = 30;
        $interval(function() {
            $scope.determinateValueLive += 1;
            if ($scope.determinateValueLive > 70) {
             $scope.determinateValueLive = 0;
            }
        }, 100);   
    }

    //alert("Device :"+JSON.stringify($stateParams));

    $scope.changeTabView = function(tabInput){
        if(tabInput == 'live'){
            $scope.currentTab = 'live';
        }
        if(tabInput == 'historic'){
            $scope.currentTab = 'historic';
        }
    }

    $scope.goToHistoricState = function(){
       //$state.go('historic-chart',$stateParams);
        openYearChoice();
    }
    function openYearChoice(){
          $scope.machineYearModal = $modal.open({
          animation: true,
          templateUrl: './modules/core/client/views/machine.years.view.html',
          controller: 'MachineChartController',
          windowClass:'year-modal-window'
        });
    }

    function getLiveData(){
        $http.get('api/machinesData/liveData/'+deviceId).then(function(response){
            var responseData = response.data
            for (var i = 0 ; i < responseData.length ; i++) {
                $scope.waterin.push(responseData[i].waterin);
                $scope.waterout.push(responseData[i].waterout);
                $scope.oiltemp.push(responseData[i].oiltemp);           
            }
            $scope.activatedLive = false;
            populateChartLive();
        }).catch(function(response){

        });
    }
    function getAverageWaterIn(){
        $http.get('api/machinesData/getAverageFlowLive/'+deviceId).then(function(response){
        // alert("WAter in :"+response.data[0]);
        $scope.averageFlowIn = response.data[0].avg_water_in;
        }).catch(function(response){

        });
    }
    function getAverageWaterOut(){
        $http.get('api/machinesData/getAveragePowerLive/'+deviceId).then(function(response){
            // alert("WAter out :"+response.data[0]);
        $scope.averagePower = response.data[0].avg_water_power;
    }).catch(function(response){

    });
    
    }
    function getAverageWaterDelTemp(){
        $http.get('api/machinesData/getAverageWaterDelTempLive/'+deviceId).then(function(response){
            // alert("WAter deltime :"+response.data[0]);
            $scope.averageWaterDelTemp = response.data[0].avg_water_out;
    }).catch(function(response){

    });
    
    }

      $scope.machineDetailInit =function(){
        //  alert("Inside machine chart controller...");
          getAverageWaterIn();
          getAverageWaterOut();
          getAverageWaterDelTemp();
          getLiveGaugeValue()
          
      }
      var liveGaugeValue = null;
       $scope.liveGaugeValue = [];
      function getLiveGaugeValue (){
         $http.get('/api/machinesData/getGaugeValue/'+deviceId).then(function(response){
        // alert("WAter in :"+response.data[0]);
        var gaugeValue = response.data[0].gauge_value;
       // var gaugeValue = response.data[0].gauge_value;
        //$scope.liveGaugeValue  =  parseFloat(gaugeValue).toFixed(2);
        //alert("Gauge Value :"+$scope.liveGaugeValue);
        //alert("Gauge Value :"+$scope.liveGaugeValue);
        $scope.liveGaugeValue.push(parseInt(gaugeValue));
        populateGaugeChart();
        
        //$timeout(populateGaugeChart,2500);
        }).catch(function(response){

        });
      }
      $timeout(populateLiveData);

      function populateChartLive(){
           //Line Chart Starts
            Highcharts.chart('liveChartContainer', {

                yAxis: {
                    title: {
                        text: 'Average Temp'
                    }
                },
                title: {
                    text: 'Water/Oil Temp(Past Hour)'
                },
                legend: {
                    layout: 'vertical',
                    align: 'center',
                    verticalAlign: 'bottom',
                },

                plotOptions: {
                    series: {
                        pointStart: 0,
                        dataLabels:{
                            enabled: false,
                            crop:false,
                            overflow:'none',
                            align: 'left',
                            y:10,
                            useHTML: true,
                            formatter: function() {
                                return '<span style="color:'
                                +this.series.color+'">'
                                +this.series.name +'°C'+'</span>';
                            }
                        }
                    }
                    
                },
                 xAxis:{
                    type:"category",
                    title: {
                        text: 'Last One Hour'
                    }
                },
                credits: {
                 enabled: false
                },
                series: [{
                    name: 'Average Water In',
                    data: $scope.waterin
                }, {
                    name: 'Average Water Out',
                    data: $scope.waterout
                }, {
                    name: 'Average Oil Temp',
                    data: $scope.oiltemp
                }
                ]

            });
            //Line Charts Ends
      }

      function populateLiveData(){
          getLiveData();
      }

      function populateGaugeChart(){
        //Gauge Chart Starts
        var gaugeOptions = {

            chart: {
                type: 'solidgauge'
            },
            title: "Average D0",

            pane: {
                center: ['50%', '85%'],
                size: '100%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                    innerRadius: '30%',
                    outerRadius: '50%',
                    shape: 'arc'
                }
            },

            tooltip: {
                enabled: false
            },
            credits: {
                enabled: false
            },

            // the value axis
            yAxis: {
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.5, '#DDDF0D'], // yellow
                    [0.9, '#DF5353'] // red
                ],
                lineWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: -70
                },
                labels: {
                    y: 16
                }
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            }
        };

        // The speed gauge
        var chartSpeed = Highcharts.chart('container-speed', Highcharts.merge(gaugeOptions, {
            yAxis: {
                min: 0,
                max: 110,
               
            },
            credits: {
                enabled: false
            },
            title:{
                text:'Average Temp'
            },

            series: [{
                name: 'Flow',
                data: $scope.liveGaugeValue,
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                        ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver"></span></div>'
                }, 
                formatter: function() {
                    return  Highcharts.numberFormat(this.y, 2, '.');
                },
                tooltip: {
                    valueSuffix: 'KW'
                }
            }]

        }));

        //Gauge Chart Ends
      }




    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

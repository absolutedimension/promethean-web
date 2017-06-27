'use strict'


var  mongoose = require('mongoose'),
  Machine = mongoose.model('Machine');
  var MachineDetail = mongoose.model('MachineDetail'); 
  var User =  mongoose.model('User');
  const exporter = require('highcharts-export-server');
  var schedule = require('node-schedule');
  var mailer = require('express-mailer');


exports.getTableData = function(req, res, next ,id) {
  Machine.find({"dId":id}).limit(1400).exec(function (err, machines) {
    if (err) {
        console.log("Error  :"+err);
      return next(err);
    } else if (!machines) { 
      return next(new Error('Failed to load Machine ' +98));
    } 
    res.jsonp(machines);
  });
};

exports.getUserMachines = function(req, res , next , userId){
  var user = req.user;
  // User.aggregate([
  //   {$match:{_id:user._id}},
  //   {$unwind:"$machineAllocated"}]).exec(function(err,users){
  //   if (err) {
  //         console.log("Error  :"+err);
  //         return next(err);
  //       } else if (!users) {
  //       return next(new Error('Failed to load Machine ' ));
  //     } 
  //     res.jsonp(users);
  // });
  User.find({_id:user._id},{machineAllocated:1}).exec(function(err,users){
    if (err) {
          console.log("Error  :"+err);
          return next(err);
        } else if (!users) {
        return next(new Error('Failed to load Machine ' ));
      } 
      res.jsonp(users);
  });
}


exports.getMachines = function (req, res, next,id) {
  console.log("Inside machines");
  MachineDetail.find().exec(function (err, machines) {
    if (err) {
        console.log("Error  :"+err);
      return next(err);
    } else if (!machines) { 
      return next(new Error('Failed to load Machine ' +98));
    } 
    res.jsonp(machines);
  });
};

exports.getDataByYear = function(req,res,next,id) {
  var deviceId = parseInt(id);
   switch(deviceId){
    case 4:
      getDataByYear1_4(res,deviceId);

      break;
   case 98:
      getDataByYear_98(res,deviceId);
      break;
   case 14:
      getDataByYear_14(res,deviceId);
  }
  var f0_test = 11;
  var deviceId = parseInt(id);
};
var dataByYear = {unit1:null,unit2:null};
function getDataByYear1_4(res,deviceId){
  Machine.aggregate([
     {
       "$match":{ "dId":  deviceId }
     },
     {
      $group :{
        _id : { Year : {$year : "$ts" } ,dId:"$dId"},
        totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine ' +98));
      }
      dataByYear.unit1 = machines;
      getDataByYear2_4(res,deviceId); 
      //res.jsonp(machines);
   });
}

function getDataByYear2_4(res,deviceId){
  Machine.aggregate([
     {
       "$match":{ "dId":  deviceId }
     },
     {
      $group :{
        _id : { Year : {$year : "$ts" } ,dId:"$dId"},
       totalEnergy : { $sum: { $multiply: [{$subtract:["$d3","$d2"]},"$f1"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      dataByYear.unit2 = machines; 
      res.jsonp(dataByYear);
   });
}

function getDataByYear_98(res,deviceId){
  Machine.aggregate([
     {
       "$match":{ "dId":  deviceId }
     },
     {
      $group :{
        _id : { Year : {$year : "$ts" } ,dId:"$dId"},
       totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine ' +98));
      } 
      res.jsonp(machines);
   });
}

function getDataByYear_14(res,deviceId){
    Machine.aggregate([
     {
       "$match":{ "dId":  deviceId }
     },
     {
      $group :{
        _id : { Year : {$year : "$ts" } ,dId:"$dId"},
        totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine ' +98));
      } 
      res.jsonp(machines);
   });
}

var dataByMonth = {unit1:null,unit2:null};
exports.getDataByMonth = function(req,res,next){
  var f0_test = 11;
  var year_input = parseInt(req.param('year'));
  var deviceId = parseInt(req.param('dIdMonth'));
   switch(deviceId){
    case 4:
      getDataByMonth1_4(res,deviceId,year_input);
      break;
   case 98:
      getDataByMonth_98(res,deviceId,year_input);
      break;
   case 14:
      getDataByMonth_14(res,deviceId,year_input);
      break;
  }
}

function getDataByMonth1_4(res,deviceId,year_input){
    Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:  deviceId ,year_agg:year_input}
     },
     {
      $group :{
        _id : "$month_agg",
         totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      dataByMonth.unit1 = machines;
      getDataByMonth2_4(res,deviceId,year_input); 
      //res.jsonp(machines);
   });
}
function getDataByMonth2_4(res,deviceId,year_input){
    Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:  deviceId ,year_agg:year_input}
     },
     {
      $group :{
        _id : "$month_agg",
         totalEnergy : { $sum: { $multiply: [{$subtract:["$d3","$d2"]},"$f1"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      dataByMonth.unit2 = machines; 
      res.jsonp(dataByMonth);
   });
}

function getDataByMonth_98(res,deviceId,year_input){
    Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:  deviceId ,year_agg:year_input}
     },
     {
      $group :{
        _id : "$month_agg",
         totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}

function getDataByMonth_14(res,deviceId,year_input){
     Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:  deviceId ,year_agg:year_input}
     },
     {
      $group :{
        _id : "$month_agg",
         totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } }
      }
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}

var dataByDay = {unit1:null,unit2:null};
exports.getDataByDay = function(req,res,next,id){
  var f0_test = 11;
  var year_input = parseInt(req.param('year'));
  var month_input = parseInt(req.param('month'));
  var deviceId = parseInt(id);
  console.log("Device Id :"+deviceId,year_input,month_input);
  switch(deviceId){
    case 4:
      getDataByDay1_4(res,deviceId,year_input,month_input);
      break;
   case 98:
      getDataByDay_98(res,deviceId,year_input,month_input);
      break;
   case 14:
      getDataByDay_14(res,deviceId,year_input,month_input);
      break;
  }
}

function getDataByDay1_4(res,deviceId,year_input,month_input){
    Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:  deviceId,year_agg:year_input,month_agg:month_input }
     },
     {
      $group :{
        _id : "$dayOfMonth_agg",
        totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
        avg_d0:{$avg:"$d0"},
        avg_d1:{$avg:"$d1"},
        avg_d2:{$avg:"$d2"},
      }
     },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      dataByDay.unit1 = machines;
      getDataByDay2_4(res,deviceId,year_input);
      //res.jsonp(machines);
   });
}

function getDataByDay2_4(res,deviceId,year_input,month_input){
    Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:  deviceId,year_agg:year_input,month_agg:month_input }
     },
     {
      $group :{
        _id : "$dayOfMonth_agg",
        totalEnergy : { $sum: { $multiply: [{$subtract:["$d3","$d2"]},"$f1"] } },
        avg_d2:{$avg:"$d0"},
        avg_d3:{$avg:"$d1"},
        avg_d2:{$avg:"$d2"},
      }
     },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      dataByDay.unit2 = machines; 
      res.jsonp(dataByDay);
   });
}

function getDataByDay_98(res,deviceId,year_input,month_input){
    Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:deviceId,year_agg:year_input,month_agg:month_input }
     },
     {
      $group :{
        _id : "$dayOfMonth_agg",
        totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
        avg_d0:{$avg:"$d0"},
        avg_d1:{$avg:"$d1"},
        avg_d2:{$avg:"$d2"},
      }
     },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}

function getDataByDay_14(res,deviceId,year_input,month_input){
  console.log("Inside get data by day id is :"+deviceId);
    Machine.aggregate([
     {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        f0:1,
        dId:1
      }
    },
     {
       "$match":{ dId:  deviceId,year_agg:year_input,month_agg:month_input }
     },
     {
      $group :{
        _id : "$dayOfMonth_agg",
        totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
        avg_d0:{$avg:"$d0"},
        avg_d1:{$avg:"$d1"},
        avg_d2:{$avg:"$d2"},
      }
     },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}


var dataByHour = {unit1:null,unit2:null};
exports.getDataByHour = function(req,res,next,id){
  var f0_test = 11;
  var year_input = parseInt(req.param('year'));
  var month_input = parseInt(req.param('month'));
  var day_input = parseInt(req.param('day'));
  var deviceId = parseInt(req.param('dIdHour'));
  console.log("Param inputs "+year_input,month_input,day_input,deviceId);
   switch(deviceId){
    case 4:
      getDataByHour1_4(res,deviceId,year_input,month_input,day_input);
      break;
   case 98:
      getDataByHour_98(res,deviceId,year_input,month_input,day_input);
      break;
   case 14:
      getDataByHour_14(res,deviceId,year_input,month_input,day_input);
      break;
  }
}

function getDataByHour1_4(res,deviceId,year_input,month_input,day_input){
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
            totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
            avg_d0:{$avg:"$d0"},
            avg_d1:{$avg:"$d1"},
            avg_d2:{$avg:"$d2"}        
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      dataByHour.unit1 = machines;
      getDataByHour2_4(res,deviceId,year_input,month_input,day_input); 
      //res.jsonp(machines);
   });
}
function getDataByHour2_4(res,deviceId,year_input,month_input,day_input){
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
           totalEnergy : { $sum: { $multiply: [{$subtract:["$d3","$d2"]},"$f1"] } },
            avg_d2:{$avg:"$d2"},
            avg_d3:{$avg:"$d3"},
            avg_d2:{$avg:"$d2"}        
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      dataByHour.unit2 = machines; 
      res.jsonp(dataByHour);
   });
}

function getDataByHour_98(res,deviceId,year_input,month_input,day_input){
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
            totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
            avg_d0:{$avg:"$d0"},
            avg_d1:{$avg:"$d1"},
            avg_d2:{$avg:"$d2"}        
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}

function getDataByHour_14(res,deviceId,year_input,month_input,day_input) {
    Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d0 :1,
        d1:1,
        d2:1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
            totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
            avg_d0:{$avg:"$d0"},
            avg_d1:{$avg:"$d1"},
            avg_d2:{$avg:"$d2"}        
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}


var waterInData = {unit1:null,unit2:null};
exports.getAverageWaterIn = function(req,res,next,id){
  console.log("Id is :"+id);
  var deviceId = parseInt(id);
  switch(deviceId){
    case 4:
      getAverageWaterIn1_4(deviceId,res);
     
      break;
   case 14:
      getAverageWaterIn_14(deviceId,res);
      break;
   case 98:
      getAverageWaterIn_98(deviceId,res);
      break;      
  }
}
function getAverageWaterIn1_4(deviceId,res){
   Machine.aggregate([
     {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$d0" }
       }
     }

   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterInData.unit1 = machines;
      getAverageWaterIn2_4(deviceId,res); 
      //res.jsonp(machines);
   });
}
function getAverageWaterIn2_4(deviceId,res){
   Machine.aggregate([
     {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$d2" }
       }
     }

   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterInData.unit2 = machines; 
      res.jsonp(waterInData);
   });
}
function getAverageWaterIn_98(deviceId,res){
   Machine.aggregate([
     {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$d0" }
       }
     }

   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}
function getAverageWaterIn_14(deviceId,res){
   Machine.aggregate([
     {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$d0" }
       }
     }

   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}


var waterOutData = {unit1:null,unit2:null};
exports.getAverageWaterOut = function(req,res,next,id){
  console.log("Id is :"+id);
  var deviceId = parseInt(id);
  switch(deviceId){
    case 4:
      getAverageWaterOut1_4(deviceId,res);
      
      break;
   case 14:
      getAverageWaterOut_14(deviceId,res);
      break;
   case 98:
      getAverageWaterOut_98(deviceId,res);
      break;      
  }
}

function getAverageWaterOut1_4(deviceId,res){
     Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":"$d1"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterOutData.unit1 = machines;
      getAverageWaterOut2_4(deviceId,res); 
      //res.jsonp(machines);
   });  
}

function getAverageWaterOut2_4(deviceId,res){
     Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":"$d1"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
       waterOutData.unit2 = machines; 
      res.jsonp(waterOutData);
   });  
}

function getAverageWaterOut_14(deviceId,res){
     Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":"$d1"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });  
}
function getAverageWaterOut_98(deviceId,res){
     Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":"$d1"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });  
}


var waterDelTempData = {unit1:null,unit2:null};
exports.getAverageWaterDelTemp = function(req,res,next,id){
    console.log("Id is :"+id);
    var deviceId = parseInt(id);
    switch(deviceId){
    case 4:
      getAverageWaterDelTime1_4(deviceId,res);
     
      break;
   case 14:
      getAverageWaterDelTime_14(deviceId,res);
      break;
   case 98:
      getAverageWaterDelTime_98(deviceId,res);
      break;      
  }
}

function getAverageWaterDelTemp1_4(deviceId,res){
    Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_deltemp : { 
          "$avg":"$d0"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterDelTempData.unit1 = machines;
      getAverageWaterDelTemp2_4(deviceId,res); 
      //res.jsonp(machines);
   });
}

function getAverageWaterDelTemp2_4(deviceId,res){
    Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_deltemp : { 
          "$avg":"$d2"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterDelTempData.unit2 = machines; 
      res.jsonp(waterDelTempData);
   });
}

function getAverageWaterDelTemp_14(deviceId,res){
    Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_deltemp : { 
          "$avg":"$d0"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}

function getAverageWaterDelTemp_98(deviceId,res){
    Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_deltemp : { 
          "$avg":"$d0"
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}



var gaugeData = {unit1:null,unit2:null};
exports.getGaugeValue = function(req,res,next,id){
  var deviceId = parseInt(id);
   switch(deviceId){
    case 4:
      getGaugeValue1_4(deviceId,res);
     
      break;
   case 14:
      getGaugeValue_14(deviceId,res);
      break;
   case 98:
      getGaugeValue_98(deviceId,res);
      break;      
  }
}

function getGaugeValue1_4(deviceId,res){
   Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
         _id : "$dId",
        gauge_value : { 
          "$avg":"$d2"
         }
       }
     }
     ]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      gaugeData.unit1 = machines;
       getGaugeValue2_4(deviceId,res); 
     // res.jsonp(machines);
   });
}
function getGaugeValue2_4(deviceId,res){
   Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
         _id : "$dId",
        gauge_value : { 
          "$avg":"$d2"
         }
       }
     }
     ]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      gaugeData.unit2 = machines; 
      res.jsonp(gaugeData);
   });
}

function getGaugeValue_14(deviceId,res){
   Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
         _id : "$dId",
        gauge_value : { 
          "$avg":"$d2"
         }
       }
     }
     ]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}

function getGaugeValue_98(deviceId,res){
   Machine.aggregate([ {
       "$match":{
         $and:[ { d2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
         _id : "$dId",
        gauge_value : { 
          "$avg":"$d2"
         }
       }
     }
     ]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}


var waterInLiveData = {unit1:null,unit2:null};
exports.getAverageFlowLive = function(req,res,next,id){
  console.log("Id is :"+id);
  var deviceId = parseInt(id);
  switch(deviceId){
    case 4:
      getAverageWaterInLive1_4(deviceId,res);
     
      break;
   case 14:
      getAverageWaterInLive_14(deviceId,res);
      break;
   case 98:
      getAverageWaterInLive_98(deviceId,res);
      break;      
  }
}

 function getAverageWaterInLive1_4(deviceId,res) {
     Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$f0" }
       }
     }

   ]).limit(20).exec(function(err,machines){
      if (err) {
          console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterInLiveData.unit1 = machines;
       getAverageWaterInLive2_4(deviceId,res); 
      //res.jsonp(machines);
   });
 }
  function getAverageWaterInLive2_4(deviceId,res) {
     Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$f1" }
       }
     }

   ]).limit(20).exec(function(err,machines){
      if (err) {
          console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterInLiveData.unit2 = machines; 
      res.jsonp(waterInLiveData);
   });
 }

 function getAverageWaterInLive_14(deviceId,res) {
     Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$f0" }
       }
     }

   ]).limit(20).exec(function(err,machines){
      if (err) {
          console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
 }

 function getAverageWaterInLive_98(deviceId,res) {
     Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     $group :{
        _id : "$dId",
        avg_water_in : {  $avg:"$f0" }
       }
     }

   ]).limit(20).exec(function(err,machines){
      if (err) {
          console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
 }

var waterOutLiveData = {unit1:null,unit2:null};
exports.getAveragePowerLive = function(req,res,next,id){
    console.log("Id is :"+id);
  var deviceId = parseInt(id);
   switch(deviceId){
    case 4:
      getAveragePowerLive1_4(deviceId,res);
      
      break;
   case 14:
      getAveragePowerLive_14(deviceId,res);
      break;
   case 98:
      getAveragePowerLive_98(deviceId,res);
      break;      
  }
}

function getAveragePowerLive1_4(deviceId,res) {
   Machine.aggregate([ 
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_power : { 
          "$avg":{$multiply:[0.06966,"$f0"]}
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterDelTempLiveData.unit1 = machines;
      getAveragePowerLive2_4(deviceId,res); 
      //res.jsonp(machines);
   });
   
}

function getAveragePowerLive2_4(deviceId,res) {
   Machine.aggregate([ 
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_power : { 
           "$avg":{$multiply:[0.06966,"$f1"]}
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterDelTempLiveData.unit1 = machines;
      getAverageWaterDelTempLive2_4(deviceId,res); 
      //res.jsonp(machines);
   });
}

function getAveragePowerLive_14(deviceId,res) {
    Machine.aggregate([ 
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_power : { 
          "$avg":{$multiply:[0.06966,"$f0"]}
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterDelTempLiveData.unit1 = machines;
      getAverageWaterDelTempLive2_4(deviceId,res); 
      //res.jsonp(machines);
   });
}

function getAveragePowerLive_98(deviceId,res) {
    Machine.aggregate([ 
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_power : { 
           "$avg":{$multiply:[0.06966,"$f0"]}
         }
       }
     }]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterDelTempLiveData.unit1 = machines;
      getAverageWaterDelTempLive2_4(deviceId,res); 
      //res.jsonp(machines);
   });
}


var waterDelTempLiveData = {unit1:null,unit2:null};
exports.getAverageWaterDelTempLive = function(req,res,next,id){
  console.log("Id is :"+id);
  var deviceId = parseInt(id);
   switch(deviceId){
    case 4:
      getAverageWaterDelTempLive1_4(deviceId,res);
      
      break;
   case 14:
      getAverageWaterDelTempLive_14(deviceId,res);
      break;
   case 98:
      getAverageWaterDelTempLive_98(deviceId,res);
      break;      
  }
}

function getAverageWaterDelTempLive1_4(deviceId,res) {
   Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":{$subtract:["$d1","$d0"]}
         }
       }
     }]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterOutLiveData.unit1 = machines;
      //getAverageWaterDelTempLive2_4(deviceId,res); 
      res.jsonp(machines);
   });  
}
function getAverageWaterDelTempLive2_4(deviceId,res) {
  Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":{$subtract:["$d3","$d2"]}
         }
       }
     }]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterOutLiveData.unit1 = machines;
     // getAverageWaterOutLive2_4(deviceId,res); 
      res.jsonp(machines);
   });  
}
function getAverageWaterDelTempLive_14(deviceId,res) {
   Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":{$subtract:["$d1","$d0"]}
         }
       }
     }]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterOutLiveData.unit1 = machines;
     // getAverageWaterOutLive2_4(deviceId,res); 
      res.jsonp(machines);
   });  
}
function getAverageWaterDelTempLive_98(deviceId,res) {
   Machine.aggregate([
     {
       "$match":{
         "dId": deviceId 
       }
     },
     {
     "$group" :{
        _id : "$dId",
        avg_water_out : { 
          "$avg":{$subtract:["$d1","$d0"]}
         }
       }
     }]).limit(20).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      waterOutLiveData.unit1 = machines;
     // getAverageWaterOutLive2_4(deviceId,res); 
      res.jsonp(machines);
   });  
}

var liveData = {unit1:null,unit2:null};
exports.getLiveData = function(req,res,next,id){
    var deviceId = parseInt(id);
  switch(deviceId){
    case 4:
      getLiveData1_4(deviceId,res);
      
      break;
   case 14:
      getLiveData_14(deviceId,res);
      break;
   case 98:
      getLiveData_98(deviceId,res);
      break;      
  }
}

function getLiveData1_4(deviceId,res) {
    Machine.aggregate([ 
     {
       "$match":{ "dId":deviceId }
     },
     {
     "$group" :{
        _id : { Hour : {$hour : "$ts" } ,Month : {$month : "$ts" },
        Day : {$dayOfMonth : "$ts" },
        Year : {$year : "$ts" },
        Minute : {$minute : "$ts" },
        dId:"$dId"},
         d0 :{ "$first": "$d0"},
         d1 :{ "$first": "$d1"},
         d2 :{ "$first": "$d2"}
       
       }
     }
     ]).limit(60).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      liveData.unit1 = machines;
      getLiveData2_4(deviceId,res); 
      //res.jsonp(machines);
   });
}
function getLiveData2_4(deviceId,res) {
    Machine.aggregate([ 
     {
       "$match":{ "dId":deviceId }
     },
     {
     "$group" :{
        _id : { Hour : {$hour : "$ts" } ,Month : {$month : "$ts" },
        Day : {$dayOfMonth : "$ts" },
        Year : {$year : "$ts" },
        Minute : {$minute : "$ts" },
        dId:"$dId"},
         d0 :{ "$first": "$d0"},
         d1 :{ "$first": "$d1"},
         d2 :{ "$first": "$d2"}
       
       }
     }
     ]).limit(60).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      liveData.unit2 = machines; 
      res.jsonp(liveData);
   });
}
function getLiveData_14(deviceId,res) {
    Machine.aggregate([ 
     {
       "$match":{ "dId":deviceId }
     },
     {
     "$group" :{
        _id : { Hour : {$hour : "$ts" } ,Month : {$month : "$ts" },
        Day : {$dayOfMonth : "$ts" },
        Year : {$year : "$ts" },
        Minute : {$minute : "$ts" },
        dId:"$dId"},
         d0 :{ "$first": "$d0"},
         d1 :{ "$first": "$d1"},
         d2 :{ "$first": "$d2"}
       
       }
     }
     ]).limit(60).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}
function getLiveData_98(deviceId,res) {
    Machine.aggregate([ 
     {
       "$match":{ "dId":deviceId }
     },
     {
     "$group" :{
        _id : { Hour : {$hour : "$ts" } ,Month : {$month : "$ts" },
        Day : {$dayOfMonth : "$ts" },
        Year : {$year : "$ts" },
        Minute : {$minute : "$ts" },
        dId:"$dId"},
         d0 :{ "$first": "$d0"},
         d1 :{ "$first": "$d1"},
         d2 :{ "$first": "$d2"}
       
       }
     }
     ]).limit(60).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}



var avgFlowByHourData = {unit1:null,unit2:null};
exports.getAvgFlowByHour = function(req,res,next,id){
  var f0_test = 11;
  var year_input = parseInt(req.param('year'));
  var month_input = parseInt(req.param('month'));
  var day_input = parseInt(req.param('day'));
  var deviceId = parseInt(req.param('dIdFlow'));
  console.log("Param inputs Avg Flow"+year_input,month_input,day_input,deviceId);
  switch(deviceId){
    case 4:
      getAvgFlowByHour1_4(deviceId,year_input,month_input,day_input,res);
     
      break;
   case 14:
      getAvgFlowByHour_14(deviceId,year_input,month_input,day_input,res);
      break;
   case 98:
      getAvgFlowByHour_98(deviceId,year_input,month_input,day_input,res);
      break;      
  }
}

function  getAvgFlowByHour1_4(deviceId,year_input,month_input,day_input,res) {
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        f0 :1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
           averageFlowEnergy : { "$avg": "$f0"}
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      avgFlowByHourData.unit1 = machines;
      getAvgFlowByHour2_4(deviceId,year_input,month_input,dat_input,res); 
      //res.jsonp(machines);
   });
}
function  getAvgFlowByHour2_4(deviceId,year_input,month_input,day_input,res) {
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        f1 :1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
           averageFlowEnergy : { "$avg" : "$f1"}
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      avgFlowByHourData.unit2 = machines; 
      res.jsonp(avgFlowByHourData);
   });
}
function  getAvgFlowByHour_14(deviceId,year_input,month_input,day_input,res) {
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        f0 :1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
           averageFlowEnergy : { "$avg" : "$f0"}
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}
function  getAvgFlowByHour_98(deviceId,year_input,month_input,day_input,res) {
   console.log("Param inputs Avg Flow Inside 98"+year_input,month_input,day_input,deviceId);
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        f0 :1,
        dId:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
           averageFlowEnergy : { "$avg" : "$f0"}
      }
    },
     {
       $sort:{"_id":1}
     }
   ]).exec(function(err,machines){
      if (err) {
            console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      } 
      res.jsonp(machines);
   });
}


exports.sendReport = function(req,res,next){
    //Export settings
    var chartInput  = req.body;
    var monthSeries = chartInput.monthSeries;
    var seriesData = chartInput.seriesData;
    var finalDrilldownData = chartInput.finalDrilldownData; 
    console.log("Inside reports");
    var exportSettings = {
        type: 'pdf',
        outfile:"Promethean_Chart",
        tmpdir:'./modules/core/client/img/charts_pdf',
        options: {
            chart: {
                 type: 'column',
            //      events:{
            //      drilldown: function(e) {
            //          if( $scope.drilldownCompleted ) {
            //              pupulateLineChart(e.point.name);
            //          }          
            //          $scope.drilldownCompleted = true;
            //       // alert("Inside Drill Down :"+e.point.name);
            //          $scope.lastClickedMonth = e.point.name;
            //     },
            //     drillupall:function(e){
            //         $scope.drilldownCompleted = false;
            //     }
            // }
            },
            title: {
                text: 'Promethean Daily Report'
            },
            // subtitle: {
            //     text: 'Promethean'
            // },
            xAxis: {
                categories:$scope.monthSeries
            },
            yAxis: {
                title: {
                    text: '<b>TOTAL ENERGY</b>'
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
                        format: '{point.y:.1f}'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b> of total<br/>'
            },

            series:[{
                name: 'Months',
                colorByPoint: true,
                data:seriesData
            }],
            drilldown: {
                series:finalDrilldownData,
                activeAxisLabelStyle :{
                    textDecoration:'none'
                }
 
              
            }
        }
    };

    // //Set up a pool of PhantomJS workers
     exporter.initPool();

    // //Perform an export
    // /*
    //     Export settings corresponds to the available CLI arguments described
    //     above.
    // */
    exporter.export(exportSettings, function (err, resp) {
        //The export result is now in res.
        //If the output is not PDF or SVG, it will be base64 encoded (res.data).
        //If the output is a PDF or SVG, it will contain a filename (res.filename).
         if (err) {
            console.log("Error  :"+err);
          return next(err);
        }
        console.log("File name..."+resp.filename);     
        res.jsonp(resp.data);

        //Kill the pool when we're done with it, and exit the application
       // exporter.killPool();
       // process.exit(1);
    });
}
scheduleReportGeneration();
function scheduleReportGeneration(){
  var rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, new schedule.Range(1, 6)];
  rule.hour = 10;
  rule.minute = 10;
  
  var j = schedule.scheduleJob(rule, function(){
    sendEmailToClient();
  });
}

//sendEmailToClient();
function sendEmailToClient(){
    const nodemailer = require('nodemailer');
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: 'prakashkumarin@gmail.com',
            pass: 'Conciousness!@#123'
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from:'prakashkumarin@gmail.com', // sender address
        to: 'prakashkumarin@gmail.com', // list of receivers
        subject: 'Daily Report', // Subject line
        text: 'This is autogenerated daily report from Promethean Energy', // plain text body
        html: '<b>This is autogenerated daily report from Promethean Energy</b>', // html body
        attachment:[{   // file on disk as an attachment
        filename: 'logger.py',
        path: '/home/prakash/Documents/logger.py' // stream this file
    }]
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}



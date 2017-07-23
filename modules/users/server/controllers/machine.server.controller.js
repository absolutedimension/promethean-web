'use strict'


var  mongoose = require('mongoose'),
  Machine = mongoose.model('Machine');
  var MachineDetail = mongoose.model('MachineDetail'); 
  var User =  mongoose.model('User');
  const exporter = require('highcharts-export-server');
  var schedule = require('node-schedule');
  var mailer = require('express-mailer');


exports.getTableData = function(req, res, next ,id) {
  Machine.find({"dId":id}).limit(1400).sort('-cd').exec(function (err, machines) {
    if (err) {
        console.log("Error  :"+err);
      return next(err);
    } else if (!machines) { 
      return next(new Error('Failed to load Machine '));
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
  var tempId = id;
  var machineId = tempId.split("_")[0];
  var unitId = tempId.split("_")[1];
  var deviceId = parseInt(machineId);
   switch(deviceId){
    case 4:
      if(unitId == 1) {
         getDataByYear1_4(res,deviceId);
      }
      if(unitId == 2) {
         getDataByYear2_4(res,deviceId);
      }
      break;
   case 98:
      getDataByYear_98(res,deviceId);
      break;
   case 14:
      getDataByYear_14(res,deviceId);
  }
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
        return next(new Error('Failed to load Machine ' ));
      }
      res.jsonp(machines);
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
      res.jsonp(machines);
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
  var year_input = parseInt(req.param('year'));
  var machineId = req.param('dIdMonth');
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
   switch(deviceId){
    case 4:
      if(unitId == 1) {
        getDataByMonth1_4(res,deviceId,year_input);
      }
      if(unitId == 2) {
        getDataByMonth2_4(res,deviceId,year_input);
      }     
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
      res.jsonp(machines);
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
        d3 :1,
        d2:1,
        f1:1,
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
      res.jsonp(machines);
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
  var year_input = parseInt(req.param('year'));
  var month_input = parseInt(req.param('month'));
  var tempId = id;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
  console.log("Device Id :"+deviceId,year_input,month_input);
  switch(deviceId){
    case 4:
      if(unitId == 1) {
         getDataByDay1_4(res,deviceId,year_input,month_input);
      }
      if(unitId == 2) {
         getDataByDay2_4(res,deviceId,year_input,month_input);
      }    
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
      res.jsonp(machines);
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
        d2 :1,
        d3:1,
        d2:1,
        f1:1,
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
        avg_d0:{$avg:"$d2"},
        avg_d1:{$avg:"$d3"},
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
  var year_input = parseInt(req.param('year'));
  var month_input = parseInt(req.param('month'));
  var day_input = parseInt(req.param('day'));
  var machineId = req.param('dIdHour');
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
  console.log("Param inputs "+year_input,month_input,day_input,deviceId);
   switch(deviceId){
    case 4:
      if(unitId == 1) {
        getDataByHour1_4(res,deviceId,year_input,month_input,day_input);
      }
      if(unitId == 2) {
        getDataByHour2_4(res,deviceId,year_input,month_input,day_input);
      }   
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
        dId:1,
        a2:1,
        f0:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
            totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
            avg_waterin:{$avg:"$d0"},
            avg_waterout:{$avg:"$d1"},
            avg_oiltemp:{$avg:"$a2"}        
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
function getDataByHour2_4(res,deviceId,year_input,month_input,day_input){
  Machine.aggregate([
    {
      "$project" :{
        dayOfMonth_agg :{$dayOfMonth : "$ts"},
        month_agg : {$month : "$ts"},
        year_agg  : {$year : "$ts"},
        hour_agg  : {$hour : "$ts"},
        d3 :1,
        f1:1,
        d2:1,
        dId:1,
        a5:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
           totalEnergy : { $sum: { $multiply: [{$subtract:["$d3","$d2"]},"$f1"] } },
            avg_waterin:{$avg:"$d2"},
            avg_waterout:{$avg:"$d3"},
            avg_oiltemp:{$avg:"$a5"}        
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
        dId:1,
        f0:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
            totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
            avg_waterin:{$avg:"$d0"},
            avg_waterout:{$avg:"$d1"},
            avg_oiltemp:{$avg:"$d2"}        
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
        dId:1,
        f0:1
      }
    },
    {
      $match :{year_agg:year_input,month_agg:month_input,dayOfMonth_agg:day_input,dId:deviceId}
    },
    {
      $group: {
          _id: "$hour_agg",
            totalEnergy : { $sum: { $multiply: [{$subtract:["$d1","$d0"]},"$f0"] } },
            avg_waterin:{$avg:"$d0"},
            avg_waterout:{$avg:"$d1"},
            avg_oiltemp:{$avg:"$d2"}        
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
  var machineId = id;
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
  switch(deviceId){
    case 4:
      if(unitId == 1) {
         getAverageWaterIn1_4(deviceId,res);
      }
      if(unitId == 2) {
         getAverageWaterIn2_4(deviceId,res);
      }
        
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
      res.jsonp(machines);
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
      res.jsonp(machines);
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
  var machineId = id;
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
  switch(deviceId){
    case 4:
      if(unitId == 1) {
         getAverageWaterOut1_4(deviceId,res);
      }
      if(unitId == 2) {
         getAverageWaterOut2_4(deviceId,res);
      }    
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
      res.jsonp(machines);
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
      res.jsonp(machines);
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
    var machineId = id;
    var tempId = machineId;
    var deviceId = parseInt(tempId.split("_")[0]);
    var unitId = tempId.split("_")[1];
    switch(deviceId){
    case 4:
      if(unitId == 1){
         getAverageWaterDelTime1_4(deviceId,res);
      }
      if(unitId == 2){
         getAverageWaterDelTime2_4(deviceId,res);
      }    
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
      res.jsonp(machines);
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
      res.jsonp(machines);
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
  var machineId = id;
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
   switch(deviceId){
    case 4:
      if(unitId == 1) {
        getGaugeValue1_4(deviceId,res);
      }
      if(unitId == 2) {
        getGaugeValue2_4(deviceId,res);
      }     
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
         $and:[ { a0: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
         _id : "$dId",
        gauge_value : { 
          "$avg":"$a0"
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
function getGaugeValue2_4(deviceId,res){
   Machine.aggregate([ {
       "$match":{
         $and:[ { a2: { $gt: 50} }, { dId: { $eq: deviceId } } ]
       }
     },
     {
     "$group" :{
         _id : "$dId",
        gauge_value : { 
          "$avg":"$a2"
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
  var machineId = id;
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
  switch(deviceId){
    case 4:
      if(unitId == 1){
        getAverageWaterInLive1_4(deviceId,res);
      }
      if(unitId == 2){
        getAverageWaterInLive2_4(deviceId,res);
      }   
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
      res.jsonp(machines);
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
      res.jsonp(machines);
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
  var machineId = id;
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
   switch(deviceId){
    case 4:
      if(unitId == 1){
        getAveragePowerLive1_4(deviceId,res);
      }
      if(unitId == 2){
        getAveragePowerLive1_4(deviceId,res);
      }    
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
          "$avg":{ $multiply:[{$multiply:[0.06966,"$f0"]},{$subtract:["$d1","$d0"] }]}
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
          "$avg":{ $multiply:[{$multiply:[0.06966,"$f1"]},{$subtract:["$d3","$d2"] }]} 
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
          "$avg":{ $multiply:[{$multiply:[0.06966,"$f0"]},{$subtract:["$d1","$d0"] }]}
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
          "$avg":{ $multiply:[{$multiply:[0.06966,"$f0"]},{$subtract:["$d1","$d0"] }]}
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


var waterDelTempLiveData = {unit1:null,unit2:null};
exports.getAverageWaterDelTempLive = function(req,res,next,id){
  console.log("Id is :"+id);
  var machineId = id;
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
   switch(deviceId){
    case 4:
      if(unitId == 1){
        getAverageWaterDelTempLive1_4(deviceId,res);
      }
      if(unitId == 2){
        getAverageWaterDelTempLive2_4(deviceId,res);
      }     
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
      res.jsonp(machines);
   });  
}

var liveData = {unit1:null,unit2:null};
exports.getLiveData = function(req,res,next,id){
  var machineId = id;
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
  switch(deviceId){
    case 4:
      if(unitId == 1){
         getLiveData1_4(deviceId,res);
      }
      if(unitId == 2){
         getLiveData2_4(deviceId,res);
      }    
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
         waterin :{ "$first": "$d0"},
         waterout :{ "$first": "$d1"},
         oiltemp :{ "$first": "$a2"}
       
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
         waterin :{ "$first": "$d2"},
         waterout :{ "$first": "$d3"},
         oiltemp :{ "$first": "$a5"}
       
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
         waterin :{ "$first": "$d0"},
         waterout :{ "$first": "$d1"},
         oiltemp :{ "$first": "$a2"}
       
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
         waterin :{ "$first": "$d0"},
         waterout :{ "$first": "$d1"},
         oiltemp :{ "$first": "$d2"}
       
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
  var machineId = req.param('dIdFlow');
  var tempId = machineId;
  var deviceId = parseInt(tempId.split("_")[0]);
  var unitId = tempId.split("_")[1];
  console.log("Param inputs Avg Flow"+year_input,month_input,day_input,deviceId);
  switch(deviceId){
    case 4:
      if(unitId == 1){
         getAvgFlowByHour1_4(deviceId,year_input,month_input,day_input,res);
      }
       if(unitId == 2){
         getAvgFlowByHour2_4(deviceId,year_input,month_input,day_input,res);
      }  
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
      res.jsonp(machines);
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
      res.jsonp(machines);
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
var async = require('async');

// async.series([
//    prepareLineDataChart,
//    prepareFlowChartData
// ]);

function callback(){
  console.log("Charts Data Executed");
}


var dataD0_hour = [];
var dataD1_hour = [];
var dataD2_hour = [];
var startPoint = null;
function prepareLineDataChart() {
    var http = require('http');
    var getCurrentTime = new Date();
    var year_current = getCurrentTime.getFullYear();
    var month_current = getCurrentTime.getMonth()+1;
    var day_current = getCurrentTime.getDate();
    console.log("Time for report gen.....................:"+getCurrentTime,year_current,month_current,day_current);
    var options = {
    
      port:3000,
      path: '/api/machinesData/getDataByHour/14/'+year_current+"/"+month_current+"/"+day_current
    };

      function callback(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
        //cosole.log("Chart outpput data "+str);
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        console.log("Chart outpput data "+JSON.parse(str));
        var chartDataOutput = JSON.parse(str);
        for(var i=0;i<chartDataOutput.length;i++){
          dataD0_hour.push(chartDataOutput[i].waterin);
          dataD1_hour.push(chartDataOutput[i].waterout);
          dataD2_hour.push(chartDataOutput[i].oiltemp);
        }
        startPoint = chartDataOutput[0]._id;
        exportLineChart();
      });
      response.on('error', function(err) {
       console.log("Chart outpput error "+err);
      });
    }

    http.request(options, callback).end();
}

var currentTimeStamp = new Date();
  function exportLineChart(){
    //Export settings
    var exportSettings = {
        type: 'svg',
        outfile:'DailyTempAnalysis_'+currentTimeStamp,
        tmpdir:'charts_exported',
        options : {
            enableServer:1,
            host:"localhost",
            port:3000,
            exporting:{
                url:'http://localhost:3000'
            },
           
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
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    pointStart: startPoint
                }
            },

            series: [{
                name: 'Average Water In',
                data: dataD0_hour
            }, {
                name: 'Average Water Out',
                data: dataD1_hour
            }, {
                name: 'Average Oil Temp',
                data: dataD2_hour
            }]
        }
      }
    exporter.initPool();
    exporter.export(exportSettings, function (err, resp) {
        //If the output is not PDF or SVG, it will be base64 encoded (res.data).
        //If the output is a PDF or SVG, it will contain a filename (res.filename).
         if (err) {
            console.log("Error  :"+err);
          return err;
        }
        console.log("File name..."+resp.filename);     
        // resp.jsonp(resp.data);
        //Kill the pool when we're done with it, and exit the application
        exporter.killPool();
        //process.exit(1);
    });
  };

function exportFlowChart(){
    var exportSettingsFlow = {
    type:"svg",
    outfile:'HourlyFlow_'+currentTimeStamp,
    tmpdir:"charts_exported",
    options:{
        title: {
            text: 'Flow'
        },
        type:'column',
        filename :"Flow_Hourly",
        credits: {
            enabled: false
        },
        xAxis: {
            categories:averageFlowTimes,
            
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
            data: averageFlowEnergyArray

        }
        ]
    }
  }
   exporter.initPool();
   exporter.export(exportSettingsFlow, function (err, resp) {
         if (err) {
            console.log("Error  :"+err);
          return err;
        }
        console.log("File name..."+resp.filename);     
    });
    //exporter.killPool();
}
var startPointFlow = 0;
var averageFlowEnergyArray = [];
var averageFlowTimes = [];

function prepareFlowChartData() {
    var http = require('http');
    var getCurrentTime = new Date();
    var year_current = getCurrentTime.getFullYear();
    var month_current = getCurrentTime.getMonth()+1;
    var day_current = getCurrentTime.getDate();
    console.log("Time for report gen.....................:"+getCurrentTime,year_current,month_current,day_current);
    var options = {
    
      port:3000,
      path: '/api/machinesData/getAvgFlowByHour/14/'+year_current+"/"+month_current+"/"+day_current
    };

      function callback(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
        //cosole.log("Chart outpput data "+str);
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        console.log("Chart outpput data "+JSON.parse(str));
        var averageFlowEnergy = JSON.parse(str);
        for(var i=0;i<averageFlowEnergy.length;i++){
          averageFlowEnergyArray.push(averageFlowEnergy[i].averageFlowEnergy);
          averageFlowTimes.push(averageFlowEnergy[i]._id);
        }
        startPointFlow = averageFlowEnergy[0]._id;
        exportFlowChart();
      });
      response.on('error', function(err) {
       console.log("Chart outpput error "+err);
      });
    }

    http.request(options, callback).end();
  
}

scheduleReportGeneration();
function scheduleReportGeneration(){
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    rule.hour = 16;
    rule.minute = 7;
    
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
        secure: false, // secure:true for port 465, secure:false for port 587
        auth: {
            user: 'prakashkumarin@gmail.com',
            pass: 'Conciousness!@#123'
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from:'ashwinkp@prometheanenergy.in', // sender address
        to: 'prakashkumarin@gmail.com', // list of receivers
        subject: 'Daily Report', // Subject line
        text: 'This is autogenerated daily report from Promethean Energy', // plain text body
        html: '<b>This is autogenerated daily report from Promethean Energy</b>', // html body
        attachment:[{   // file on disk as an attachment
        filename: 'logo.png',
        path: './modules/core/client/img/logo.png' // stream this file
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

exports.getToFromDataTable = function(req,res,next){
  var deviceId = req.param('dId');
  var toDateInput = req.param('toDate');
  var fromDateInput = req.param('fromDate');
  var toDate = new Date(toDateInput);
  var fromDate = new Date(fromDateInput);
  console.log("From and to Date :"+fromDate,toDate);
  Machine.find({dId:deviceId,cd:{$gte:fromDate,$lte:toDate}}).limit(1500).exec(function(err,machines){
        if (err) {
          console.log("Error  :"+err);
          return next(err);
        } else if (!machines) {
        return next(new Error('Failed to load Machine '));
      }
      res.jsonp(machines);
  });
}
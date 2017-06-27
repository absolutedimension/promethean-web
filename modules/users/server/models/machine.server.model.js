'use strict'




var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var MachineSchema = new Schema({
   f0:{
        type:Number
    },
      f1:{
        type:Number
    },
      e:{
        type:Number
    },
      cd:{
      type:Date
    },
      dId:{
        type:Number
    },
      tf1:{
        type:Number
    },
      ts:{
        type:Date
    },
      tf0:{
        type:Number
    },
      a0:{
        type:Number
    },
      a1:{
        type:Number
    },
      a2:{
        type:Number
    },
      a4:{
        type:Number
    },
      a5:{
        type:Number
    },
      d0:{
        type:Number
    },
      d1:{
        type:Number
    },
      d2:{
        type:Number
    },
      d3:{
        type:Number
    },
    ut:{
       type: Number
    }
});


mongoose.model('Machine', MachineSchema);
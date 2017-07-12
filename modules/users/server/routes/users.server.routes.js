'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');
  var machine = require('../controllers/machine.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);


  app.route('/api/machines/getUserMachine/:userId').get(machine.getUserMachines);
  
  app.route('/api/machines/getMachines/:machineId').get(machine.getMachines);
  app.route('/api/machines/getTableData/:tbMachineId').get(machine.getTableData);
  app.route('/api/machinesData/getDataByYear/:dIdYear').get(machine.getDataByYear);
  app.route('/api/machinesData/getDataByMonth/:dIdMonth/:year').get(machine.getDataByMonth);
  app.route('/api/machinesData/getDataByDay/:dIdDay/:year/:month').get(machine.getDataByDay);
  app.route('/api/machinesData/getDataByHour/:dIdHour/:year/:month/:day').get(machine.getDataByHour);
  app.route('/api/machinesData/getAvgFlowByHour/:dIdFlow/:year/:month/:day').get(machine.getAvgFlowByHour);


  app.route('/api/machinesData/getAverageWaterIn/:dIdIn').get(machine.getAverageWaterIn);
  app.route('/api/machinesData/getAverageWaterOut/:dIdOut').get(machine.getAverageWaterOut);
  app.route('/api/machinesData/getAverageWaterDelTemp/:dIdDel').get(machine.getAverageWaterDelTemp);

  app.route('/api/machinesData/getAverageFlowLive/:dIdInLive').get(machine.getAverageFlowLive);
  app.route('/api/machinesData/getAveragePowerLive/:dIdOutLive').get(machine.getAveragePowerLive);
  app.route('/api/machinesData/getAverageWaterDelTempLive/:dIdDelLive').get(machine.getAverageWaterDelTempLive);

  app.route('/api/machinesData/getGaugeValue/:dIdGauge').get(machine.getGaugeValue);

  app.route('/api/machinesData/:dId/:fromDate/:toDate').get(machine.getToFromDataTable);

  //app.route('/api/reportHistoric/send').post(machine.sendReport);

  app.route('/api/machinesData/liveData/:idLive').get(machine.getLiveData);





  // Finish by binding the user middleware
  app.param('idLive',machine.getLiveData);
  app.param('dIdGauge',machine.getGaugeValue);
  app.param('userId', machine.getUserMachines);
  app.param('tbMachineId', machine.getTableData);
  app.param('machineId', machine.getMachines);
  app.param('dIdYear', machine.getDataByYear);
  app.param('dIdMonth', machine.getDataByMonth);
  app.param('year', machine.getDataByMonth);
  app.param('dIdDay', machine.getDataByDay);
  app.param('dIdHour', machine.getDataByHour);
  app.param('dIdFlow', machine.getAvgFlowByHour);

  app.param('dIdIn', machine.getAverageWaterIn);
  app.param('dIdOut', machine.getAverageWaterOut);
  app.param('dIdDel', machine.getAverageWaterDelTemp);

  app.param('dIdInLive', machine.getAverageFlowLive);
  app.param('dIdOutLive', machine.getAveragePowerLive);
  app.param('dIdDelLive', machine.getAverageWaterDelTempLive);
};

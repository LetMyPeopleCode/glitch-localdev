/**
 * daemon.js - run by the scheduled process to check for updates, commit and push them.
 * 
 */

const cron = require('node-cron');

const daemon = module.exports;

//create a local config variables
var config = {};

/**
 * Launches the daemon on a pre-set schedule
 * @param {int} myInterval - interval in seconds the daemon should run
 */
daemon.launch = (myConfig) => {
  config = myConfig;
  cron.schedule('*/' + config.myInterval.toString() +' * * * * *', () => {
    console.log('running a task every ' + config.myInterval.toString() + ' seconds');
  });
}
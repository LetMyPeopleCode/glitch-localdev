/**
 * daemon.js - run by the scheduled process to check for updates, commit and push them.
 * 
 */

const cron = require('node-cron');
const repomgr = require('./repomgr.js');

const daemon = module.exports;

/**
 * Launches the daemon on a pre-set schedule
 * @param {object} config - configuration object
 */
daemon.launch = (config) => {
  console.log('\nLaunching Update Daemon\n');
  var task = cron.schedule('*/' + config.update.toString() +' * * * * *', () => {
    if(repomgr.isDirty()){
        config.last_update = Date.now();
    }
    var last = parseInt((Date.now - config.last_update)/1000)
    if(last > config.timeout) task.stop();
  });
}
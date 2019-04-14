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
daemon.launch = async (config) => {
  console.log('\nLaunching Update Daemon\n');
  var task = cron.schedule('*/' + config.update.toString() +' * * * * *', () => {
    var runChecks = async () =>{
      var is_dirty = await repomgr.isDirty();
      if(is_dirty){
        config.last_update = Date.now();
      }
      var last = parseInt((Date.now() - config.last_update)/1000)
      if(last > parseInt(config.timeout)) {
        console.log('No updates in ' + config.timeout + ' seconds. Timing out and shutting down update daemon. Restart glitch-localdev \nto start monitoring and auto-pushing updates'); 
        task.stop();
      }
    }
    runChecks();
  });

}
/**
 * glitch-localdev
 * 
 * repo: https://github.com/YiddishNinja/glitch-localdev
 * 
 * This 
 * 
 */

const config = require('./lib/config.js');
const repomgr = require('./lib/repomgr.js');
const daemon = require('./lib/daemon.js');


const init = async () => {
  const my_config = await config.getConfig();
  if (my_config.is_new){
    const status = await repomgr.install(my_config);
  }

  daemon.launch(my_config);
}

init();

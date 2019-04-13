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

const myConfig = config.getConfig();
console.log("returned: ", myConfig);


//daemon.launch();
 

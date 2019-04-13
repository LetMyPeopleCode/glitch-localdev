/**
 * config.js - methods for creating, reading, and manipulating the local 
 * configuration file
 * 
 */

const fs = require('fs');
const readline = require('readline');

const config = module.exports;

/**
 * The one callable method by anything importing this: get config
 * Checks if a config file exists. 
 * If not, it asks questions to build one.
 * If so, it loads it & validates it.
 * Then the result of one of those actions is returned
 */
config.getConfig = () => {
  // check filesystem for .glitch-localdev
  if(fs.existsSync('.glitch-localdev')){
    config_vals = loadAndCheck();
  } else {
    config_vals = configCreate();
  }
  return config_vals;
}

/**
 * Ask the needed questions, validate the answers, write them to disk, validate again, 
 * return a config object.
 */
const configCreate = async () => {
  var myConfig = {}
  // ask the user for configuration values
  myConfig.repo_url = await getUserInput("What is your Glitch repo URL?: ", validateRepo);
  myConfig.user_id = await getUserInput("What is your user ID (from 'Git, Import, Export' tool)?: ", validateUser);
  myConfig.update = await getUserInput("Push updates interval (in seconds 5-600 - default is 15)?: ", validateInterval);
  myConfig.timeout = await getUserInput("Inactivity timeout (in seconds 0-86400, 0 = no timeout, default is 1800)?: ", validateTimeout);

  //write the values to .glitch-localdev
  fs.writeFileSync('.glitch-localdev', JSON.stringify(myConfig));

  //run values through parser and return
  return parseConfig(myConfig);
}

/**
 * Load from disk, parse the JSON, validate and pass back a config object
 */
const loadAndCheck = () => {
  var contents = fs.readFileSync('.glitch-localdev');
  var myConfig = JSON.parse(contents);
  return parseConfig(myConfig);
}

/**
 * Set up an interface to get user input
 */
const makeRL = () => {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return rl;
}

/**
 * Asks questions and keeps asking them until it gets an answer that meets the validation rule.
 * @param {string} query - The question to be asked
 * @param {function} validator - a function to be used to validate the answer
 */
 getUserInput = (query, validator) => {
  rl = makeRL();
  return new Promise( (resolve, reject) => {
    rl.question(query, (answer) => {
      if(validator(answer)) {
        rl.close();
        resolve(answer);
      } else {
        console.log('Invalid Answer')
        rl.close();
        answer = getUserInput(query, validator); // look! recursion!
        resolve(answer);
      }
    });
  });
}

/**
 * Takes the configuration object created either by Q&A or reading the file and runs
 * a final validation pass on it (to ensure no one is trying to sneak bits in via a 
 * maliciously structured config file)
 * 
 * Checks for use of default values, throws an error if something doesn't pass the sniff
 * test, then passes it back.
 * 
 * @param {object} myConfig 
 */
const parseConfig = (myConfig) => {
  var is_valid = true;
  // validate glitch repo URL
  if(!validateRepo(myConfig.repo_url)) is_valid = false;
  
  // validate glitch user guid
  if(!validateUser(myConfig.user_id)) is_valid = false;

  // update last modified
  myConfig.last_update = Date.now();

  // validate update interval (can be 5 to 600, default 15)
  if(!validateInterval(myConfig.update)) is_valid = false;
  myConfig.update = (myConfig.update === "") ? 15 : parseInt(myConfig.update); 

  // validate timeout value (can be 0 to 86400, default 1800)
  if(!validateTimeout(myConfig.timeout)) is_valid = false;
  myConfig.timeout = (myConfig.timeout === "") ? 1800 : parseInt(myConfig.timeout); 

  // if anything failed, throw an error
  if(!is_valid) throw "It appears .glitch-localdev in this directory has been corrupted. Please fix it. or you can erase it and this program will ask you for the necessary information again.";

  // we'll need this variable when configuring the repo and pulling it in, so let's make it now
  myConfig.upstream = myConfig.repo_url.replace("https://", "https://" + myConfig.user_id + "@");

  return myConfig;

}

/**
 * Validates the repository URL the user got from Glitch
 * @param {string} url - The URL of the repo
 */
const validateRepo = (url) => {
  //model: https://api.glitch.com/word-word/git
  var uri_regex = /^https:\/\/api.glitch.com\/[a-z]+-[a-z]+\/git$/
  return uri_regex.test(url);
}

/**
 * Validates the user ID the user got from Glitch
 * @param {string} uid - The user ID
 */
const validateUser = (uid) => {
  //model: 48970c11-a9bd-cc3e-2188-ef34cbd44f31
  var user_regex = /^([a-f0-9]+-){4}[a-f0-9]+$/
  return user_regex.test(uid);
}

/**
 * Validates the timeout value entered. Coming in as a string and can be empty to opt for the default.
 * @param {string} val - the value entered
 */
const validateTimeout = (val) => {
  //allow default
  if(val === "") return true;
  val = parseInt(val);
  if((val>-1)&&(val<86401)) return true;
  return false;
}

/**
 * Validates the update interval value entered. Coming in as a string and can be empty to opt for the default.
 * @param {string} val - the value entered
 */
const validateInterval = (val) => {
  if(val === "") return true;
  val = parseInt(val);
  if((val>4)&&(val<601)) return true;
  return false;  
}
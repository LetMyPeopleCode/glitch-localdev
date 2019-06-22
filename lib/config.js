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
 * 
 * Note it seems Glitch autosaves quickly, but the changes remain unstaged and uncommitted for up to 6 minutes
 * 
 */
const configCreate = async () => {
  var myConfig = {}
  // ask the user for configuration values
  myConfig.repo_url = await getUserInput("What is your Glitch repo URL?: ", validateRepo);
  myConfig.user_id = await getUserInput("What is your user name (from 'Git, Import, Export' tool)?: ", validateUser);
  myConfig.update = await getUserInput("Push updates interval (in seconds 5-900 - default is 120)?: ", validateInterval);
  myConfig.timeout = await getUserInput("Inactivity timeout (in seconds 0-86400, 0 = no timeout, default is 1800)?: ", validateTimeout);
  myConfig.auto_save = await getUserInput("Autosave Frequency (VS Code project setting, in seconds 0-900, 0 = no autosave, default is 15)?: ", validateAutosave);
  //write the values to .glitch-localdev
  fs.writeFileSync('.glitch-localdev', JSON.stringify(myConfig));

  //add the gitignore now so there aren't conflicts reloading clean
  fs.copyFileSync(__dirname + '/assets/gitignore-base', '.gitignore');

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
  myConfig.last_update = Date.now().toString();

  // validate update interval (can be 5 to 900, default 120)
  if(!validateInterval(myConfig.update)) is_valid = false;
  myConfig.update = (myConfig.update === "") ? 120 : parseInt(myConfig.update); 

  // validate timeout value (can be 0 to 86400, default 1800)
  if(!validateTimeout(myConfig.timeout)) is_valid = false;
  myConfig.timeout = (myConfig.timeout === "") ? 1800 : parseInt(myConfig.timeout); 

  // validate Autosave value (can be 0 to 900, default 15 -- x 1000 microseconds)
  if(!validateAutosave(myConfig.auto_save)) is_valid = false;
  myConfig.auto_save = (myConfig.auto_save === "") ? 15000 : parseInt(myConfig.auto_save * 1000); 

  // if anything failed, throw an error
  if(!is_valid) throw "It appears .glitch-localdev in this directory has been corrupted. Please fix it. or you can erase it and this program will ask you for the necessary information again.";

  // we'll need this variable when configuring the repo and pulling it in, so let's make it now
  myConfig.upstream = myConfig.repo_url.replace("https://", "https://" + myConfig.user_id + "@");

  //test if we need to initialize the repo
  myConfig.is_new = testEmpty();

  return myConfig;

}

/**
 * Validates the repository URL the user got from Glitch
 * @param {string} url - The URL of the repo
 */
const validateRepo = (url) => {
  //model: https://api.glitch.com/word-word/git
  var uri_regex = /^https:\/\/api.glitch.com\/git\/[a-z]+-[a-z]+$/
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
 * Validates the autosave value entered. Coming in as a string and can be empty to opt for the default.
 * @param {string} val - the value entered
 */
const validateAutosave = (val) => {
  //allow default
  if(val === "") return true;
  val = parseInt(val);
  if((val>-1)&&(val<901)) return true;
  return false;
}


/**
 * Validates the update interval value entered. Coming in as a string and can be empty to opt for the default.
 * @param {string} val - the value entered
 */
const validateInterval = (val) => {
  if(val === "") return true;
  val = parseInt(val);
  if((val>4)&&(val<901)) return true;
  return false;  
}

/**
 * Tests to make sure there is no content in the current directory
 * other than the two expected files 
 * so we know if we need to install the repo
 *
 */
const testEmpty = () => {
  data = fs.readdirSync('.')
  if(data.length !== 2) return false;
  if(data[0] !== ".gitignore") return false;
  if(data[1] !== ".glitch-localdev") return false
  return true;
}

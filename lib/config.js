/**
 * config.js - methods for creating, reading, and manipulating the local 
 * configuration file
 * 
 */

const fs = require('fs');
const readline = require('readline');



const config = module.exports;

config.getConfig = () => {
  // check filesystem for .glitch-localdev
  if(fs.existsSync('.glitch-localdev')){
    config_vals = loadAndCheck();
  } else {
    config_vals = configCreate();
  }
}

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

const loadAndCheck = async () => {

}


// SET UP FUNCTIONS FOR GETTING CONSOLE STDIN INPUT
const makeRL = () => {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return rl;
}

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



const parseConfig = (myConfig) => {
  var isValid = true;
  // validate glitch repo URL

  // validate glitch user guid

  // update last modified

  // validate update interval (can be 2 to 600, default 5)

  // validate dieAfter value (can be 0 to 86400, default 1800)
}

const validateRepo = (url) => {
  //model: https://api.glitch.com/word-word/git
  var uri_regex = /^https:\/\/api.glitch.com\/[a-z]+-[a-z]+\/git$/
  return uri_regex.test(url);
}

const validateUser = (uid) => {
  //model: 48970c11-a9bd-cc3e-2188-ef34cbd44f31
  var user_regex = /^([a-f0-9]+-){4}[a-f0-9]+$/
  return user_regex.test(uid);
}

const validateTimeout = (val) => {
  //allow default
  if(val === "") return true;
  val = parseInt(val);
  if((val>-1)&&(val<86401)) return true;
  return false;
}

const validateInterval = (val) => {
  if(val === "") return true;
  val = parseInt(val);
  if((val>4)&&(val<601)) return true;
  return false;  
}
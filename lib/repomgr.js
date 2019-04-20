/**
 * repomgr.js
 * 
 * exports a module with methods for creating and managing the local git repo
 * 
 * REMEMBER to change config.is_new to false and write the new config to the repo.
 * 
 */

 const gitmgr = require('simple-git/promise');
 const fs = require('fs');

 const repomgr = module.exports;

 /**
  * .install: sets up a copy of your Glitch repo in the directory where glitch-localdev was run
  * 
  * Steps: init, set remote origin, pull, fetch, checkout master, create working branch, push working branch
  * 
  * @param {object} - config - the configuration object
  */
 repomgr.install = async (config) => {
  await gitmgr('.').init()
  await gitmgr('.').addRemote('origin', config.upstream)
  await gitmgr('.').pull('origin', 'master')
  await gitmgr('.').checkout('master')
  await gitmgr('.').checkoutLocalBranch('working')

  // We now have a complete copy of our branch, minus a .gitignore and plus our config.
  // Over on Glitch, they have their own .gitignore, but it's in the /etc folder and aliased
  // Let's copy in our .gitignore from our assets folder.

  fs.copyFileSync(__dirname + '/assets/gitignore-base', '.gitignore');
  
  // since the git hooks clobber the merge from working to master
  // fs.copyFileSync(__dirname + '/assets/merger', 'merger');
  // commenting out for now as it seems the script is more trouble than running the commands manually
  
  //Create the .vscode dir and add our Autosave values. 0 = none, so only config if > 0
  if(config.auto_save > 0){
    var vs_vals = {
        "files.autoSave": "afterDelay",
        "files.autoSaveDelay": config.auto_save
    }
    fs.mkdirSync('.vscode');
    fs.writeFileSync('.vscode/settings.json', JSON.stringify(vs_vals));
  }

  // lets stage commit and push the working branch to the server

  await gitmgr('.').add('.');
  await gitmgr('.').push('origin','working')

  return true;
 }

 /**
  * .isDirty: checks the current repo for unstaged / uncommitted changes, files needing to be added
  * adds & commits them, then pushes to working
  * 
  */
 repomgr.isDirty = async () => {

  var is_dirty = false;
  const status = await gitmgr('.').status();

  
  if(status.not_added.length !== 0){
    console.log('added: ', status.not_added);
    is_dirty = true;
  }

  if(status.deleted.length !== 0){
    console.log('deleted: ', status.deleted);
    is_dirty = true;
  }

  if(status.modified.length !== 0){
    console.log('modified: ', status.modified);
    is_dirty = true;
  }

  if(is_dirty){
    console.log('changes detected')
    await gitmgr('.').add('.');
    var timestamp = parseInt(Date.now() / 1000);
    var prestamp = new Date();
    console.log ("committing changes at " + prestamp.toTimeString());
    await gitmgr('.').commit("committing from localdev - " + timestamp.toString());

    // pull from master, merge to master, and then merge from master
    console.log ("checking out master")
    await gitmgr('.').checkout('master');
    console.log ("pulling from origin")
    await gitmgr('.').pull('origin','master');
    console.log ("merging to master from working")
    await gitmgr('.').mergeFromTo('working','master');
    console.log ("checking out working")
    await gitmgr('.').checkout('working');
    console.log ("merging to working from master")
    await gitmgr('.').mergeFromTo('master','working');

    //push to working
    console.log("pushing updates to working");
    await gitmgr('.').push('origin','working');
    console.log("done\n\n")
    return is_dirty
  }  else {
    return false;
  }
}


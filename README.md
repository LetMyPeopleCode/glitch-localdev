# glitch-localdev
**Author:** Greg Bulmash (@YiddishNinja)

**Release History:**

* 0.1.0 - FIRST RELEASE - 4/14/2019 - ***Consider this VERY alpha software***
* 0.1.3 - Added npm -g functionality (so it will run from commandline)
* 0.1.4 - Fixed daemon timeout issue, added timestamp to commit reporting in console
  * Resolving Github issues 1 & 2
* 0.1.5 - Glitch changed the format of the git repo URL - fixing regex

**Requirements:**

* node.js installed on your local dev machine
* git installed on your local dev machine
* an account on Glitch.com

**Contents:**

* [Introduction](#introduction)
  * [What does it do?](#what-does-it-do?)
  * [What doesn't it do?](#what-doesn\'t-it-do?)
* [Configuring and using](#configuring-and-using)
  * [Installation](#installation)
  * [Clone a Glitch project](#clone-a-glitch-project)
  * [Code on an existing project](#code-on-an-existing-project)
  * [Sync Glitch with your local repo](#sync-glitch-with-your-local-repo)
  * [Sync your local repo with Glitch](#sync-your-local-repo-with-glitch)
* [Contributing](#contributing)



## Introduction

If you code on Glitch.com, you know that it doesn't have the most awesome editor. Bracket matching didn't work great so they turned it off. There's no autosuggestion or autocompletion. It's a pretty basic text editor.

Whatever your reason (mine is working on Free Code Camp projects), perhaps you'd like to be able to test and deploy on Glitch, but code locally in your favorite editor. That's where glitch-localdev comes in.

### What does it do? 

Essentially, it does 3 things...

* It creates a local copy of your Glitch project by pulling from Glitch via Git, then creates a "working" branch to work in.
* It instruments Visual Studio Code (first editor supported) to auto-save periodically, like Glitch does.
* It runs a daemon that checks your local project directory at an interval you specify and pushes changes to your working branch on Glitch. 

### What doesn\'t it do?

These are "roadmap" items to make it more Glitch-like or Glitch compatible, which I haven't had time for or success with yet.

* Merge your working branch changes into "master" and update the Glitch UI

  * See [instructions below](#sync-glitch-with-your-local-repo) to do this manually.

* Run a local server with hot loading as auto-saves kick in.

* Gracefully handle many people working in the same Glitch project at once. For now, it's meant as a solo developer tool.

  

## Configuring and using

### Installation

​	`npm install -g glitch-localdev`

A global installation is recommended. That way you can easily launch environments when needed.

### Clone a Glitch project

Create the directory where you want to house the clone of your Glitch project. 

Open a terminal window or command prompt in it (or open one and navigate to it). **The directory must be empty at this point**. 

Run these commands in the terminal:

​	`code .` (if you want to launch Visual Studio Code with the project loaded)

​	`glitch-localdev`

In a separate browser window, have your Glitch project editor open: 

* Click the "Tools" button in the lower left corner of your project screen.
* Click the "Git, Import, and Export" button from the "Tools" panel
* Click the "Write" button from the "Git, Import, and Export" panel

Your Glitch project URL displays with a "copy" button next to it. Click the button to copy. Paste it in your terminal to configure the Glitch repo URL.

Click the "Copy User Name". Paste it into your terminal to configure your Glitch user name. 

**IMPORTANT CAUTION:** The user name is basically a secret API key. Anyone who has it can access any of your Glitch projects via Git. Protect it.

Set time values:

* "Push updates interval" - the daemon will check for file modifications and push them every X seconds. You're setting X.
* "Inactivity timeout" - If there are no new updates in this many seconds, the daemon will shut down. Set 0 seconds to have the daemon run until you manually stop it. Hit enter to accept the default of 30 minutes or enter a value between 1 second to 86400 (one day).
* "Autosave Frequency" - This currently only works with Visual Studio Code. It creates a project settings file that will cause Visual Studio Code to automatically save any changed files in the project directory (or subdirectories) every X seconds. Set it to 0 to disable autosave, hit enter to accept the default of 15 seconds, or set an interval of your choice between 1 second and 900 seconds (15 minutes).

The program will use the info to clone your Glitch project into the directory, then launch the monitoring daemon. You're ready to code.

### Code on an existing project

If you've already cloned a Glitch project and now you're coming back to it. Open a terminal window or command prompt in the project directory (or open one and navigate to the project directory). Then run:

​	`code .` (if you want to launch Visual Studio Code with the project loaded)

​	`glitch-localdev`

The program will read your configuration and start the monitoring daemon.

### Sync Glitch with your local repo

If the daemon has been allowed to push changes for you, go back to the editor screen for your project on the Glitch website. From the "Tools" menu (lower left corner), select "Console."

A terminal will open in a new browser tab.

In the terminal type:

​	`git merge working`

This will merge your working branch into your master branch. Then type:

​	`refresh`

This will restart the Glitch editor to pick up and reflect any changes you merged in.

You can now test your project on Glitch.

**Two bits of advice:**

These will help you when you want to sync your local repo with changes you make on Glitch.

1: Control-c stop the glitch-localdev daemon while you're working directly on Glitch, but keep the terminal window open.

2: Keep the Glitch console tab open.

### Sync your local repo with Glitch

If you've stopped your daemon and have been editing and debugging on Glitch, here's how to bring your changes back into your local repo.

* **Make sure Glitch has committed your changes:** In the Glitch console, run: 

  `git status` 

  If there are any unstaged and/or uncommitted changes, stage and/or commit them manually... or wait for Glitch to do it their way, which happens about every 6 minutes.

* **Pull from master:** In the terminal window open with your local project directory, run: 

  `git pull origin master`

  This will merge the changes into your working branch and pull them down. You may want to push them up just to be safe:

  `git push origin working`

  

## Contributing

Since this is very new, I'd really appreciate people opening issues to describe what they want to contribute and we can track the contributions through there. When you make a pull request, you can reference the issue.

**Testing:** I'm still working on my skills as a test writer, thus no test framework for this early release. I'm learning [AVA](<https://github.com/avajs>) to level up my test writing skills, so future tests will be instrumented with [AVA](<https://github.com/avajs>). If you want to contribute tests, we'll use [AVA](<https://github.com/avajs>) for it.


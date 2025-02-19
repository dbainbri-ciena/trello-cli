var fs = require("fs");
var path = require("path");

exports.homePath = function() {
  return process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
};

exports.createEmptyConfig = function(cdir) {
  var cpath = path.resolve(cdir, "config.json");
  if (!fs.existsSync(cdir)) {
    fs.mkdirSync(cdir, "0700");
  }
  var template = {
    appKey: "YOURAPIKEY",
    configPath: cdir + "/",
    authCache: "authentication.json",
    translationCache: "translations.json"
  };
  fs.writeFileSync(cpath, JSON.stringify(template, null, 4));
  console.log("Blank configuration file saved to: " + cpath);
  console.log(
    "Go to https://trello.com/app-key to generate your API key and replace YOURAPIKEY in " +
      cpath
  );
};

exports.createEmptyDefaults = function(cdir) {
  var cpath = path.resolve(cdir, "defaults.json");
  if (!fs.existsSync(cdir)) {
    fs.mkdirSync(cdir, "0700");
  }
  var template = {
    board: "",
    list: "",
    card: "",
    since: ""
  };
  fs.writeFileSync(cpath, JSON.stringify(template, null, 4));
  console.log("Blank defaults file saved to: " + cpath);
};
